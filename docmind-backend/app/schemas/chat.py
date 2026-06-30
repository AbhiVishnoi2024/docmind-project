from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    history_id: Optional[str] = None

class ChatHistoryItem(BaseModel):
    query: str
    answer: str
    timestamp: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    history_id: str
    sources: Optional[List[Dict[str, Any]]] = None
