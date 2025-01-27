# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Modify to production db when ready
SQLALCHEMY_DATABASE_URL = "sqlite:///./local_dev.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite in a single thread
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)