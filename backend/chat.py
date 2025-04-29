from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from schemas import ChatRequest, ChatResponse, CreateChatRequest
from models import Chat, User, Message
from database import SessionLocal
from google import genai
from dotenv import load_dotenv
from typing import List
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

# POST /chat – Sends a prompt to the AI and saves message in specific chat
@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    chat = db.query(Chat).filter(Chat.id == request.chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=request.prompt,
        )
        generated_text = response.candidates[0].content.parts[0].text

        # Store both user and bot messages
        db.add_all([
            Message(chat_id=chat.id, sender='user', text=request.prompt),
            Message(chat_id=chat.id, sender='bot', text=generated_text)
        ])
        db.commit()

        return ChatResponse(response=generated_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# GET /chats?username=... – Return list of chats for user
@router.get("/chats")
def get_user_chats(username: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    chats = db.query(Chat).filter(Chat.user_id == user.id).all()
    return [{"id": chat.id, "name": chat.name, "messages": []} for chat in chats]

# POST /chats – Create a new chat for user
@router.post("/chats")
def create_chat(request: CreateChatRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_chat = Chat(user_id=user.id, name=request.name)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return {"id": new_chat.id, "name": new_chat.name, "messages": []}

# GET /chats/{chat_id}/messages – Fetch messages from a chat
@router.get("/chats/{chat_id}/messages")
def get_chat_messages(chat_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp.asc()).all()
    return [
        {"text": m.text, "sender": m.sender, "timestamp": m.timestamp}
        for m in messages
    ]

# DELETE /chats/{chat_id} – Delete a chat
@router.delete("/chats/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Also delete its messages
    db.query(Message).filter(Message.chat_id == chat_id).delete()
    db.delete(chat)
    db.commit()
    return {"detail": "Chat deleted"}
