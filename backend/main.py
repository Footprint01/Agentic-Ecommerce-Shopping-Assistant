from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Agentic E-Commerce Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class ProductSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None

# Mock Agent response for when LLM keys are missing
def mock_agent_process(message: str):
    message_lower = message.lower()
    if "laptop" in message_lower:
        return {
            "response": "I found some great laptops for you. Based on your request, I recommend checking out the latest MacBook Pro or the Dell XPS series.",
            "actions": [{"type": "search", "query": "laptop"}]
        }
    elif "phone" in message_lower:
        return {
            "response": "Here are some top-rated smartphones. Are you interested in iPhone or Android devices?",
            "actions": [{"type": "search", "query": "smartphone"}]
        }
    else:
        return {
            "response": "I can help you find products! Try asking for laptops, phones, or groceries.",
            "actions": []
        }

@app.get("/")
async def root():
    return {"message": "Welcome to the Agentic E-Commerce Assistant API"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint for the AI Agent.
    In a real deployment with API keys, this would call the LangGraph agent.
    """
    try:
        # Check if we have API keys to run the real agent
        if os.getenv("OPENAI_API_KEY"):
            from backend.agents.graph import create_agent_graph
            from langchain_core.messages import HumanMessage, AIMessage
            
            # Reconstruct history
            messages = []
            for msg in request.history:
                if msg.get("role") == "user":
                    messages.append(HumanMessage(content=msg.get("content")))
                else:
                    messages.append(AIMessage(content=msg.get("content")))
            
            # Add current message
            messages.append(HumanMessage(content=request.message))
            
            # Run Agent
            app_graph = create_agent_graph()
            inputs = {"messages": messages}
            final_state = await app_graph.ainvoke(inputs)
            
            last_message = final_state["messages"][-1]
            return {
                "response": last_message.content,
                # In a real scenario, we might parse tool calls to infer actions
                "actions": [] 
            }
        
        # Fallback to mock logic for demo purposes if no keys
        return mock_agent_process(request.message)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
