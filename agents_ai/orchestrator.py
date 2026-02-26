#!/usr/bin/env python3
"""
Multi-Agent Orchestrator (The "Brain")
Routes user queries to the correct specialist agent.
OPTIMIZATION: Uses 'gemini-2.0-flash' (Verified Working) for routing.
"""

import os
import sys
import time
from dotenv import load_dotenv

# --- Import Your Agents ---
try:
    from human_anatomy_agent.human_anatomy_agent import HumanAnatomyAgent
    from human_autonomy_agent.human_autonomy_agent import HumanAutonomyAgent
    from market_analysis_agent.market_analysis_agent import MarketAnalysisAgent 
    from clinical_trials_agent.clinical_trials_agent import ClinicalTrialsAgent 
except ImportError as e:
    print(f"Orchestrator Import Error: {e}")
    sys.exit(1)

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

class DrugRepurposingOrchestrator:
    def __init__(self):
        print("Initializing Orchestrator (Router)...")
        # Use simple GOOGLE_API_KEY if available, or GENAI key
        self.api_key = os.environ.get("GOOGLE_GENAI_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("CRITICAL: GOOGLE_GENAI_KEY or GOOGLE_API_KEY missing.")

        # 1. ROUTER MODEL
        # Using gemini-2.0-flash as it is verified to work with this key
        try:
            self.router_llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash", 
                google_api_key=self.api_key,
                temperature=0,
            )
        except Exception:
            # Fallback
            self.router_llm = ChatGoogleGenerativeAI(
                model="gemini-pro", 
                google_api_key=self.api_key,
                temperature=0,
            )

        # 2. Routing Logic
        self.router_template = """
        Classify the User Query into ONE domain:
        - ANATOMY: Biology, physiology, drug mechanisms, body systems.
        - TRIALS: Clinical studies, phases, recruitment, patient data.
        - MARKET: Commercial potential, competitors, pricing, sales.
        - COMPLIANCE: Ethics, privacy, PHI checks, legal regulations.
        - GENERAL: Greetings or unclear inputs.

        User Query: {query}

        Return ONLY the category name.
        """
        
        self.router_chain = (
            PromptTemplate.from_template(self.router_template) 
            | self.router_llm 
            | StrOutputParser()
        )

        # 3. Initialize Agents (The "Expert" Swarm)
        print("   - Connecting to HAP (Anatomy)...")
        self.hap = HumanAnatomyAgent()
        print("   - Connecting to HAA (Autonomy)...")
        self.haa = HumanAutonomyAgent()
        print("   - Connecting to MAA (Market)...")
        self.maa = MarketAnalysisAgent()
        print("   - Connecting to CTA (Trials)...")
        self.cta = ClinicalTrialsAgent()
        print("Orchestrator Online.\n")

    def route_and_execute(self, query):
        print(f"Brain: Routing '{query}'...")
        
        # Step 1: Route
        try:
            category = self.router_chain.invoke({"query": query}).strip().upper()
            print(f"   -> Detected Intent: [{category}]")
        except Exception as e:
            raise e

        # Step 2: Dispatch
        # We add a tiny sleep to prevent hitting rate limits instantly between Router & Agent
        time.sleep(1) 
        
        if "ANATOMY" in category:
            return self.hap.run(query)
        elif "COMPLIANCE" in category:
            return self.haa.run(query)
        elif "MARKET" in category:
            return self.maa.run(query)
        elif "TRIALS" in category:
            return self.cta.run(query)
        elif "GENERAL" in category:
            return "Hello! I am the Drug Repurposing Orchestrator. Ask me about Anatomy, Clinical Trials, Market Analysis, or Compliance."
        else:
            return self.hap.run(query) # Default fallback

def main():
    system = DrugRepurposingOrchestrator()
    
    print("="*60)
    print("MULTI-AGENT DRUG REPURPOSING SYSTEM ACTIVE")
    print("="*60)
    
    # Simple interaction loop (non-blocking for automation)
    # In a real run, this would be input(), but for automation we can just run a test
    test_queries = [
        "What is the physiological function of Prolactin and what does a level of 12.7 ng/mL indicate in a non-pregnant female?",
    ]
    
    for q in test_queries:
        print(f"\nSimulating Query: {q}")
        response = system.route_and_execute(q)
        print(f"\nRESPONSE:\n{response}")
        print("-" * 60)
        time.sleep(2)

if __name__ == "__main__":
    main()
