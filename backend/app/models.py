# models.py
from sqlalchemy import Column, Integer, String, DateTime, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    user_query = Column(String, nullable=False)
    file_name = Column(String, nullable=True)
    file_content = Column(LargeBinary, nullable=True)
    model_response = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)