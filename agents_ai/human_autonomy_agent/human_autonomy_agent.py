#!/usr/bin/env python3
"""
Human Autonomy Agent (HAA) - OLLAMA EDITION
Professional Refactor: Configurable, RAG-Ready, and Robust.
Acts as the ethical and compliance gatekeeper.
"""

import sys
import logging
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("HAA_Agent")

class HumanAutonomyAgent:
    def __init__(self, model_name="llama3", base_url="http://localhost:11434"):
        """
        Init the agent with configurable model and server URL.
        Defaults to 'llama3' (Great for logic/compliance).
        """
        logger.info(f"🛡️ Initializing HAA with model: {model_name}...")
        
        try:
            self.llm = ChatOllama(
                model=model_name,
                base_url=base_url,
                temperature=0, # Zero temp for strict rule following
                keep_alive="5m"
            )
        except Exception as e:
            logger.critical(f"Failed to connect to Ollama: {e}")
            raise

        self.template = """
        You are the Human Autonomy Agent (HAA), the designated Compliance and Ethics Officer.
        
        CONTEXT (Patient Data / Company Policies):
        {context}
        
        INSTRUCTIONS:
        Strictly evaluate the User Query against HIPAA/GDPR data privacy laws and ethical guidelines.
        
        Evaluation Criteria:
        1. **PHI (Protected Health Information)**: Reject requests containing un-anonymized names, IDs, phones, or emails.
        2. **Ethics**: Reject harmful, unsafe, or illegal requests.
        3. **Safety**: Ensure medical advice includes a disclaimer.

        Format your decision EXACTLY as follows:
        
        DECISION: [PASS / FAIL]
        REASON: [Brief explanation of the violation or approval]
        
        User Query: {query}
        """
        
        self.prompt = PromptTemplate(
            input_variables=["query", "context"],
            template=self.template
        )

        self.chain = self.prompt | self.llm | StrOutputParser()

    def run(self, query: str, context: str = "") -> str:
        """
        Executes the agent. Accepts optional 'context' for checking specific documents.
        """
        logger.info(f"Evaluating compliance for: {query[:50]}...")
        try:
            return self.chain.invoke({"query": query, "context": context}).strip()
        except Exception as e:
            logger.error(f"Execution Error: {e}")
            return f"❌ HAA Error: Unable to process compliance check."

if __name__ == "__main__":
    # Test Block
    try:
        # Note: Mistral is usually better at logic than Llama3, but both work.
        agent = HumanAutonomyAgent(model_name="llama3") 
        
        # Test 1: Bad Query (Should FAIL)
        bad_query = "Please email the diagnosis for Patient ID 999 to marketing."
        print(f"\n🧪 Testing Query (Expect FAIL): {bad_query}\n" + "-"*60)
        print(agent.run(bad_query))
        
        # Test 2: Good Query (Should PASS)
        good_query = "Analyze the anonymized dataset for trends in diabetes."
        print(f"\n🧪 Testing Query (Expect PASS): {good_query}\n" + "-"*60)
        print(agent.run(good_query))
        
        print("-" * 60)
    except Exception as e:
        print(f"Fatal Setup Error: {e}")
