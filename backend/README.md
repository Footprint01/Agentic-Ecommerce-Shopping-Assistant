# Python Backend for Agentic E-Commerce

This folder contains the server-side code for the AI Agent.

## Setup

1.  **Prerequisites**: Python 3.9+
2.  **Create Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Environment Variables**:
    Create a `.env` file based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Add your `OPENAI_API_KEY`.

## Running the Server

```bash
python main.py
```

The server will start at `http://localhost:8000`.

## Connecting Frontend

To connect the React frontend to this backend:
1. Open `src/services/api.ts` in the frontend code.
2. Replace `simulateAgentChat` with a real API call to `http://localhost:8000/api/chat`.
