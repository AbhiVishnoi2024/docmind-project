import chromadb
from app.core.config import settings
from typing import List, Dict, Any

class ChromaVectorDB:
    def __init__(self):
        # Instantiate a persistent file storage client for vector records
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)

    def get_or_create_collection(self, doc_id: str):
        """Creates an isolated vector storage space partitioned by a unique document tracker."""
        return self.client.get_or_create_collection(name=f"doc_{doc_id}")

    def add_chunks(self, doc_id: str, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Saves textual metadata fragments and mathematical embeddings into the database index."""
        collection = self.get_or_create_collection(doc_id)
        ids = [f"{doc_id}_ch_{idx}" for idx in range(len(chunks))]
        documents = [c["text"] for c in chunks]
        metadatas = [{"page": c["page"]} for c in chunks]

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

    def query_similarity(self, doc_id: str, query_embedding: List[float], top_k: int = 3) -> List[str]:
        """Runs an HNSW cosine spatial search to extract the most relevant matching text fragments."""
        collection = self.get_or_create_collection(doc_id)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        return results['documents'][0] if results['documents'] and results['documents'][0] else []
