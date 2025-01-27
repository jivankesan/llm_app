# chat.py
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session
import openai

from ..database import SessionLocal
from ..models import ChatHistory
import time

router = APIRouter()
model = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/generate")
async def generate_response(
    user_id: str = Form(...),
    user_query: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    Accepts:
      - user_id (Form)
      - user_query (Form)
      - file (File) [optional]

    1) If a file is uploaded, read its contents and append to the user_query.
    2) Call OpenAI with the combined prompt.
    3) Store everything (prompt, file, response) in the DB.
    4) Return the model response.
    """

    file_name = None
    file_content = None

    # If there's an uploaded file, read it
    if file:
        file_name = file.filename
        file_content = await file.read()  # raw bytes

    # Build prompt by combining user query + file text (if any)
    combined_prompt = user_query

    if file_content:
        try:
            # Attempt to decode file as UTF-8 text
            text_content = file_content.decode("utf-8", errors="ignore")
            combined_prompt += f"\n\nFile content:\n{text_content}"
        except Exception:
            print("Error decoding file content")
            # If it's not text or there's an error decoding, skip appending
            pass

    if model is not None:
        # Call OpenAI (example using text-davinci-003)
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=combined_prompt,
            max_tokens=128,
            temperature=0.7
        )

        model_response_text = response.choices[0].text.strip()
    else:
        model_response_text = "Model not found"
    
    time.sleep(2)

    # Store in the database
    chat_record = ChatHistory(
        user_id=user_id,
        user_query=user_query,
        file_name=file_name,
        file_content=file_content,  # raw binary
        model_response=model_response_text
    )
    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)

    return {
        "response": model_response_text,
        "id": chat_record.id,
        "file_name": file_name
    }