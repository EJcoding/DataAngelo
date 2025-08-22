# DataAngelo

DataAngelo is an AI-powered tool that generates database designs, SQL schemas, and ER diagrams from natural language descriptions. It leverages a local LLM (Ollama) to provide tailored database architectures for your application needs.

## Features

- **Describe your app**: Enter a description of your application's data needs.
- **Choose your database**: Supports MySQL, PostgreSQL, SQLite, and SQL Server.
- **AI-generated output**: Get SQL schema, Mermaid ER diagram, and a detailed design explanation.
- **Copy & visualize**: Copy SQL or diagram code, and view diagrams directly in the browser.
- **Example prompts**: Try out sample use cases for quick results.

## Project Structure

```
backend/
  api.py           # FastAPI backend, connects to Ollama LLM
frontend/
  src/             # React frontend (Vite + TailwindCSS)
  public/
  index.html
  package.json
```

## Getting Started

### Prerequisites

- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [Ollama](https://ollama.com/) running locally with a compatible model (e.g., `codellama:7b`)

### 1. Start the Backend

Install dependencies:

```sh
pip install fastapi uvicorn pydantic requests
```

Run the API server:

```sh
uvicorn backend.api:app --app-dir . --reload
```

Make sure Ollama is running and the model is available (default: `codellama:7b`).

### 2. Start the Frontend

Install dependencies:

```sh
cd frontend
npm install
```

Run the development server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration

- **Backend**: See [`backend/api.py`](backend/api.py) for API endpoints and Ollama integration.
- **Frontend**: See [`frontend/src/App.jsx`](frontend/src/App.jsx) for the main React app.

## Customization

- To use a different LLM/model, change the `MODEL_NAME` in [`backend/api.py`](backend/api.py).
- To add more database types, update the dropdown in [`frontend/src/App.jsx`](frontend/src/App.jsx).
