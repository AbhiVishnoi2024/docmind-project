from sentence_transformers import SentenceTransformer
from typing import List

class EmbeddingEngine:
    def __init__(self):
        """Initializes the optimized local embedding transformer model."""
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def generate_embedding(self, text: str) -> List[float]:
        """Converts an input string into a dense 384-dimensional vector coordinate array."""
        return self.model.encode(text).tolist()

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Processes batches of chunks concurrently to maximize vector calculation throughput."""
        return self.model.encode(texts).tolist()
