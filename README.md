# Agentic E-Commerce Shopping Assistant

This project is a complete "Agentic E-Commerce" application with a React frontend and a Python backend.

## Features

- **AI Shopping Assistant**: A chat interface that helps users find products (simulated in demo mode, full LangGraph implementation in backend code).
- **Product Catalog**: Fetches real product data from DummyJSON API.
- **Cart Management**: Full shopping cart functionality.
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS.

## Project Structure

- `src/`: React Frontend code.
  - `components/`: UI Components (ChatInterface, ProductList, etc.).
  - `services/`: API integration (DummyJSON).
  - `store/`: State management (Zustand).
- `backend/`: Python Backend code.
  - `main.py`: FastAPI server.
  - `agents/`: Agentic AI implementation.
    - `graph.py`: LangGraph workflow definition.
    - `tools.py`: Tools for search, comparison, and details.
    - `state.py`: Agent state definition.

## How to Run Locally

### Frontend
1. `npm install`
2. `npm run dev`

### Backend (Optional for Demo)
To enable the full Python-based agent:
1. Navigate to `backend/`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows).
4. Install dependencies: `pip install -r requirements.txt`.
5. Rename `.env.example` to `.env` and add your OpenAI API Key.
6. Run the server: `python main.py`.
7. Update `src/services/api.ts` to point to `http://localhost:8000` instead of the simulated agent.

## Demo Mode
Currently, the application runs in "Client-side Demo Mode". The Chat Assistant simulates intelligence by parsing keywords and querying the DummyJSON API directly from the browser. This ensures the application works immediately without setting up the Python backend.
