#!/usr/bin/env python3
"""
Heuristic Orchestrator (Professional Edition)
Routes user queries using Zero-Shot Keyword Classification.
Integrates with Local Ollama Agents (HAP, HAA) and External APIs (MAA, CTA).
"""

import sys
import os
import logging
from dotenv import load_dotenv

# Load Env (for API keys and Config)
load_dotenv()

# --- CONFIGURATION ---
# Best Practice: Load from Env, default to "mistral" if not set.
LOCAL_MODEL_NAME = os.getenv("OLLAMA_MODEL", "mistral") 
DB_PATH = "./chroma_db"

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("Orchestrator")

# 1. ROBUST PATH SETUP
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
logger.info(f"📂 Project Root: {current_dir}")

try:
    from langchain_chroma import Chroma
    from langchain_ollama import OllamaEmbeddings
    from human_anatomy_agent.human_anatomy_agent import HumanAnatomyAgent
    from human_autonomy_agent.human_autonomy_agent import HumanAutonomyAgent
    from market_analysis_agent.market_analysis_agent import MarketAnalysisAgent
    from clinical_trials_agent.clinical_trials_agent import ClinicalTrialsAgent
except ImportError as e:
    logger.critical(f"Failed to import agents or RAG dependencies. Error: {e}")
    sys.exit(1)

class HeuristicOrchestrator:
    def __init__(self):
        logger.info("Initializing Heuristic Orchestrator...")
        self.agents = {}
        self.chat_history = []  # Memory List
        
        # Initialize Vector Store for RAG
        try:
            logger.info("   - Connecting to Vector DB...")
            embedding_fn = OllamaEmbeddings(model=LOCAL_MODEL_NAME)
            self.vectorstore = Chroma(persist_directory=DB_PATH, embedding_function=embedding_fn)
            logger.info("✅ Vector DB Connected")
        except Exception as e:
            logger.warning(f"⚠️ Vector DB Connection Failed: {e}. RAG will be disabled.")
            self.vectorstore = None
        
        # Initialize Agents
        self._init_agent("MARKET", MarketAnalysisAgent)
        self._init_agent("TRIALS", ClinicalTrialsAgent)
        
        # Use the Configured Local Model
        self._init_agent("COMPLIANCE", lambda: HumanAutonomyAgent(model_name=LOCAL_MODEL_NAME))
        self._init_agent("ANATOMY", lambda: HumanAnatomyAgent(model_name=LOCAL_MODEL_NAME))

    def _init_agent(self, name, factory):
        """Helper to initialize agents safely."""
        try:
            logger.info(f"   - Loading {name}...")
            self.agents[name] = factory() if callable(factory) else factory
        except Exception as e:
            logger.error(f"❌ Failed to load {name}: {e}")
            self.agents[name] = None

    def classify_query(self, query: str) -> str:
        """Routes the query based on keywords."""
        q = query.lower()

        if any(k in q for k in ["patient", "id", "hipaa", "confidential", "email", "share", "privacy", "ethics"]):
            return "COMPLIANCE"
        if any(k in q for k in ["phase 1", "phase 2", "phase 3", "recruit", "study", "exclusion", "inclusion", "cohort", "medicine", "drug", "treatment", "therapy", "cure"]):
            return "TRIALS"
        if any(k in q for k in ["price", "cost", "revenue", "sales", "competitor", "share", "market", "growth"]):
            return "MARKET"
        
        return "ANATOMY"

    def retrieve_context(self, query: str) -> str:
        """Retrieves relevant documents from ChromaDB."""
        if not self.vectorstore:
            return ""
        
        try:
            results = self.vectorstore.similarity_search(query, k=1)
            if results:
                return f"\n[RAG Retrieved Info]: {results[0].page_content}\n"
        except Exception as e:
            logger.error(f"RAG Retrieval Error: {e}")
        
        return ""

    def run(self, query: str):
        """
        Runs the orchestration logic with RAG and Memory.
        """
        # Step 1: Format Conversation History
        history_text = "\n".join([f"User: {q}\nAI: {a}" for q, a in self.chat_history[-3:]]) # Short-term memory
        
        # Step 2: RAG Retrieval
        retrieved_context = self.retrieve_context(query)
        
        # Step 3: Combine Context
        full_context = f"CONVERSATION HISTORY:\n{history_text}\n{retrieved_context}"
        
        # Step 4: Route
        category = self.classify_query(query)
        logger.info(f"Routing '{query[:30]}...' -> [{category}]")

        # Step 5: Get Agent
        agent = self.agents.get(category)
        if not agent:
            return f"⚠️ Error: The {category} Agent is unavailable."

        if category == "ANATOMY" and query.lower() in ["hello", "hi", "test"]:
             return "Hello! I am the Drug Repurposing System. Ask me about Anatomy, Trials, Market, or Compliance."

        # Step 6: Dispatch
        try:
            # We check if the run method accepts context, otherwise just pass query
            try:
                # Pass query + Enriched Context
                response = agent.run(query, context=full_context)
            except TypeError:
                response = agent.run(query)
            
            # Update Memory
            self.chat_history.append((query, response))
            return response

        except Exception as e:
            logger.error(f"Agent Execution Failed: {e}")
            return f"System Error: {e}"

def main():
    orchestrator = HeuristicOrchestrator()
    
    print("\n" + "="*60)
    print(f"🤖 DRUG REPURPOSING SYSTEM ONLINE (Model: {LOCAL_MODEL_NAME})")
    print("   Type 'exit' to quit.")
    print("="*60)

    while True:
        try:
            user_input = input("\n🧪 Enter Query: ").strip()
            
            if not user_input:
                continue
                
            if user_input.lower() in ["exit", "quit"]:
                print("Shutting down...")
                break
            
            # Execute
            response = orchestrator.run(user_input)
            
            print("-" * 60)
            print(f"📝 RESPONSE:\n{response}")
            print("-" * 60)

        except KeyboardInterrupt:
            print("\nExiting...")
            break

if __name__ == "__main__":
    main()
