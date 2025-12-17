from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sys
import os
from pathlib import Path

# Add agents_ai to sys.path if not already there
# We assume agents_ai is at the same level as backend
# c:\Users\ROHAN\Medical\agents_ai
AGENTS_DIR = Path(__file__).resolve().parent.parent.parent / "agents_ai"
if str(AGENTS_DIR) not in sys.path:
    sys.path.append(str(AGENTS_DIR))

try:
    from orchestrator import DrugRepurposingOrchestrator
except ImportError as e:
    # Handle case where imports fail (e.g. missing dependencies in env)
    print(f"Failed to import Orchestrator: {e}")
    DrugRepurposingOrchestrator = None

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    responses={404: {"description": "Not found"}},
)

class QueryRequest(BaseModel):
    query: str

# Global instance (lazy loading could be better but this is simple)
orchestrator_instance = None

def get_orchestrator():
    global orchestrator_instance
    if orchestrator_instance is None:
        if DrugRepurposingOrchestrator is None:
             raise HTTPException(status_code=500, detail="Agents system could not be loaded. Check server logs.")
        try:
            orchestrator_instance = DrugRepurposingOrchestrator()
        except Exception as e:
             import traceback
             traceback.print_exc()
             raise HTTPException(status_code=500, detail=f"Failed to initialize agents: {str(e)}")
    return orchestrator_instance

@router.post("/query")
async def query_agents(request: QueryRequest):
    """
    Send a query to the multi-agent system.
    """
    orchestrator = get_orchestrator()
    try:
        response = orchestrator.route_and_execute(request.query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
