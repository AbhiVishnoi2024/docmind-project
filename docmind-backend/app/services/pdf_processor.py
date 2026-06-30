import fitz
from typing import List, Dict, Any

class PDFProcessorService:
    @staticmethod
    def extract_text_by_page(file_path: str) -> List[Dict[str, Any]]:
        """Opens a raw PDF file path and extracts clean text layout block data page-by-page."""
        doc = fitz.open(file_path)
        extracted_data = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            extracted_data.append({
                "page": page_num + 1,
                "text": text if text.strip() else ""
            })
        return extracted_data

    @staticmethod
    def chunk_text(page_data: List[Dict[str, Any]], chunk_size: int = 500, chunk_overlap: int = 50) -> List[Dict[str, Any]]:
        """Splits raw continuous pages of text into structured, overlapping contextual fragments."""
        chunks = []
        for data in page_data:
            text = data["text"]
            page = data["page"]
            start = 0
            if not text:
                continue
            while start < len(text):
                end = start + chunk_size
                chunk_str = text[start:end]
                chunks.append({
                    "text": chunk_str,
                    "page": page
                })
                # Sliding window step calculation using overlap metrics
                start += (chunk_size - chunk_overlap)
        return chunks
