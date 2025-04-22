from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware  # Import CORS middleware
import os

load_dotenv()  # Load environment variables

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:4200"  # Your Angular frontend's URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Configuration
MODEL_NAME = "gemini-2.0-flash"
API_KEY = os.getenv("GOOGLE_API_KEY")  

# Initialize the GenAI client
client = genai.Client(api_key=API_KEY)

class ChatRequest(BaseModel):
    prompt: str  

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        user_prompt = request.prompt
        
        # Format the request for Gemini
        contents = user_prompt
        
        # Generate response using the GenAI client
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
        )
        
        # Extract the generated text
        generated_text = response.candidates[0].content.parts[0].text
        
        return {"response": generated_text}

    
    except (KeyError, IndexError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid response format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)