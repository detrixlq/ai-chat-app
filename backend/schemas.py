from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    prompt: str
    username: str# Associate with user

class ChatResponse(BaseModel):
    response: str
