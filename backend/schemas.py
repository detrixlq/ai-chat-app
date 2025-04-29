from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    prompt: str
    chat_id: int 
    username: str# Associate with user

class ChatResponse(BaseModel):
    response: str

class CreateChatRequest(BaseModel):
    username: str
    name: str