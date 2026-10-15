from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    file_name: str

class DocumentResponse(DocumentBase):
    id: str
    user_id: str
    file_path: str
    upload_date: datetime
    status: str

    class Config:
        from_attributes = True
