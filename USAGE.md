# Project Usage Instructions

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Ollama** (for local AI agents)
  - Install from [ollama.com](https://ollama.com/)
  - Pull the required model: `ollama pull llama3`

## Installation

### 1. Backend Setup

Open a terminal in the root directory (`c:\Users\ROHAN\Medical`):

```bash
# Install Python dependencies
pip install -r backend/requirements.txt
```

### 2. Frontend Setup

Open a new terminal in the `project` directory:

```bash
cd project
npm install
```

### 3. Environment Configuration

Ensure you have a `.env` file in the root directory (`c:\Users\ROHAN\Medical\.env`) with the following keys:

```ini
# Google Search Configuration
GOOGLE_API_KEY=...
GOOGLE_CSE_ID=...

# Mistral AI Configuration
MISTRAL_API_KEY=...

# Google GenAI Configuration
GOOGLE_GENAI_KEY=...

OLLAMA_MODEL=llama3
```

## Running the Project

### 1. Start Ollama (Required for Agents)

Ensure Ollama is running in the background. You can usually just open the Ollama app, or run:

```bash
ollama serve
```

### 2. Start the Backend

In the root directory:

```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
The API will be available at `http://127.0.0.1:8000`.
API Documentation: `http://127.0.0.1:8000/docs`

### 3. Start the Frontend

In the `project` directory:

```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Using the Agents

You can interact with the agents via the API endpoint:
- **POST** `/agents/query`
- **Body**: `{"query": "Your medical question here"}`
