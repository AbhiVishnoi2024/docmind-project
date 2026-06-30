import time
import logging
import hashlib
import threading
import random
import google.generativeai as genai
from google.api_core import exceptions
from app.core.config import settings
from typing import List

logger = logging.getLogger("uvicorn.error")

class GeminiAIService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        """Singleton pattern so all requests share one queue."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        genai.configure(api_key=settings.GEMINI_API_KEY, transport='rest')
        
        # Use 'gemini-3.5-flash' — available on new accounts with fresh quota
        # (5 requests/day, 250K tokens, 20/min)
        self.model = genai.GenerativeModel('gemini-3.5-flash')
        logger.info("✅ Using Gemini model: gemini-3.5-flash")

        # Cache: prefix_hash -> {value, expires}
        self._cache = {}

        # Rate limit tracking
        self._last_rate_limit_time = 0
        self._consecutive_429s = 0

        # Single-request queue lock
        self._request_queue = threading.Lock()
        self._queue_wait_time = 2  # seconds minimum between requests

        logger.info("🚀 Gemini service initialized (singleton + serial queue)")

    def _cache_key(self, prefix: str, text: str) -> str:
        return f"{prefix}_{hashlib.md5(text.encode()).hexdigest()}"

    def _get_from_cache(self, key: str):
        entry = self._cache.get(key)
        if entry and entry["expires"] > time.time():
            return entry["value"]
        return None

    def _set_cache(self, key: str, value: str, ttl=300):
        self._cache[key] = {"value": value, "expires": time.time() + ttl}

    def _clean_expired_cache(self):
        now = time.time()
        expired = [k for k, v in self._cache.items() if v["expires"] < now]
        for k in expired:
            del self._cache[k]

    def _call_with_retry(self, prompt: str, retries=5, cache_prefix=None):
        """
        Makes a SINGLE Gemini API call at a time using serial queue.
        Uses caching, exponential backoff, jitter, and cooldown.
        """
        # ── 1. Check cache first ──
        if cache_prefix:
            ck = self._cache_key(cache_prefix, prompt)
            cached = self._get_from_cache(ck)
            if cached:
                logger.info(f"✅ [CACHE HIT] '{cache_prefix}' — skipping API call")
                return cached

        # ── 2. Wait for our turn in the serial queue ──
        logger.info(f"⏳ Queuing Gemini request '{cache_prefix or 'unknown'}'...")
        acquired = self._request_queue.acquire(blocking=True)

        try:
            # ── 3. Cooldown: if we just hit a rate limit, wait ──
            if self._last_rate_limit_time > 0:
                elapsed = time.time() - self._last_rate_limit_time
                if elapsed < 60:
                    extra_wait = max(0, 30 - elapsed)
                    if extra_wait > 0:
                        logger.warning(f"⏳ Rate limit cooldown: waiting {extra_wait:.0f}s...")
                        time.sleep(extra_wait)

            # ── 4. Small delay between requests (even on success) ──
            time.sleep(self._queue_wait_time)

            # ── 5. Attempt the API call with retries ──
            for i in range(retries):
                try:
                    response = self.model.generate_content(prompt)
                    self._consecutive_429s = 0

                    text = response.text
                    if cache_prefix:
                        self._set_cache(ck, text)
                        self._clean_expired_cache()

                    logger.info(f"✅ Gemini success '{cache_prefix or 'unknown'}'")
                    return text

                except exceptions.ResourceExhausted as e:
                    self._last_rate_limit_time = time.time()
                    self._consecutive_429s += 1

                    base_wait = min((2 ** i) * 5, 60)
                    jitter = random.uniform(0.8, 1.2)
                    wait_time = base_wait * jitter

                    logger.warning(
                        f"⚠️ [429] Rate limit! Waiting {wait_time:.1f}s "
                        f"(attempt {i+1}/{retries}, consecutive={self._consecutive_429s})"
                    )

                    if self._consecutive_429s >= 5:
                        raise Exception(
                            "Gemini API quota exhausted. Free tier resets after ~1 hour. "
                            "Please wait and try again later."
                        )

                    time.sleep(wait_time)

                except Exception as e:
                    logger.error(f"❌ Gemini error: {str(e)}")
                    raise e

            raise Exception("API Quota exhausted. Please try again later.")

        finally:
            self._request_queue.release()

    def _get_error_message(self, e: Exception) -> str:
        """Returns a user-friendly error message based on the exception."""
        error_str = str(e)
        if 'not found' in error_str.lower() or 'not supported' in error_str.lower():
            return "⚠️ Gemini model unavailable. The server is starting up — please retry in 10 seconds."
        if 'quota' in error_str.lower() or '429' in error_str or 'ResourceExhausted' in error_str:
            return "⚠️ Gemini API quota exceeded. Free tier resets after ~1 hour. Please wait and try again."
        if 'API_KEY' in error_str or 'api key' in error_str.lower() or 'unauthorized' in error_str.lower():
            return "⚠️ Invalid Gemini API key. Please check your .env file."
        return f"⚠️ Gemini API error. Please retry in 10 seconds."

    # ===== PUBLIC METHODS =====

    def generate_rag_answer(self, question: str, context_chunks: List[str]) -> str:
        context_text = "\n\n".join(context_chunks)
        prompt = f"Answer using ONLY this context:\n{context_text}\n\nQuestion: {question}\nAnswer:"
        try:
            return self._call_with_retry(prompt, cache_prefix="rag")
        except Exception as e:
            logger.error(f"RAG failed: {str(e)}")
            return self._get_error_message(e)

    def generate_summary(self, text_chunks: List[str]) -> str:
        if not text_chunks:
            return "No content to summarize."
        full_text = "\n".join(text_chunks[:12])
        prompt = f"Provide a detailed academic summary of this text:\n\n{full_text}"
        try:
            return self._call_with_retry(prompt, cache_prefix="summary")
        except Exception as e:
            logger.error(f"Summary failed: {str(e)}")
            return self._get_error_message(e)

    def generate_quiz(self, text_chunks: List[str]) -> str:
        if not text_chunks:
            return "[]"
        full_text = "\n".join(text_chunks[:12])
        prompt = (
            "Generate a multiple-choice quiz with 10 questions in valid JSON format. "
            "Each item must have: 'question_text' (string), 'options' (array of 4 strings), "
            "and 'correct_answer' (string, must be one of the 4 options). "
            "Return ONLY the JSON array, no markdown.\n\n"
            f"Text:\n{full_text}"
        )
        try:
            return self._call_with_retry(prompt, cache_prefix="quiz")
        except Exception as e:
            logger.error(f"Quiz failed: {str(e)}")
            return '[]'

    def generate_study_questions(self, text_chunks: List[str], level: str) -> str:
        if not text_chunks:
            return "[]"
        full_text = "\n".join(text_chunks[:12])

        level_prompts = {
            "beginner": "Generate 3-5 beginner-level study questions that test basic understanding.",
            "intermediate": "Generate 3-5 intermediate-level study questions that test analytical thinking.",
            "advanced": "Generate 3-5 advanced-level study questions that test deep comprehension and synthesis."
        }
        difficulty_instruction = level_prompts.get(level, level_prompts["beginner"])

        prompt = (
            f"{difficulty_instruction} "
            "Return in valid JSON array format where each item has 'question_text' (string) "
            "and 'ideal_answer' (string). Return ONLY the JSON, no markdown.\n\n"
            f"Text:\n{full_text}"
        )
        try:
            return self._call_with_retry(prompt, cache_prefix=f"questions_{level}")
        except Exception as e:
            logger.error(f"Study questions failed: {str(e)}")
            return "[]"