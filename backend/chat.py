from fastapi import APIRouter, HTTPException, Depends
from schemas import ChatRequest, ChatResponse
from models import Chat, User
from database import SessionLocal
from sqlalchemy.orm import Session
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
MODEL_NAME = "gemini-2.0-flash"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        contents = request.prompt
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
        )
        generated_text = response.candidates[0].content.parts[0].text

        chat = Chat(user_id=user.id, prompt=request.prompt, response=generated_text)
        db.add(chat)
        db.commit()
        db.refresh(chat)

        return ChatResponse(response=generated_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
