#!/usr/bin/env python3
"""
Human Anatomy Agent (HAP) - OLLAMA EDITION
Professional Refactor: Configurable, RAG-Ready, and Robust.
"""

import sys
import logging
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("HAP_Agent")

class HumanAnatomyAgent:
    def __init__(self, model_name="llama3", base_url="http://localhost:11434"):
        """
        Init the agent with configurable model and server URL.
        Defaults to 'llama3' as verified available.
        """
        logger.info(f"Initializing HAP with model: {model_name}...")
        
        try:
            self.llm = ChatOllama(
                model=model_name,
                base_url=base_url,
                temperature=0.2,
                keep_alive="5m" # Keeps model loaded for 5 mins for speed
            )
        except Exception as e:
            logger.critical(f"Failed to connect to Ollama: {e}")
            raise

        self.template = """
        You are the Human Anatomy Agent (HAP), an expert in biological sciences.
        
        CONTEXT (Patient Data / Research):
        {context}
        
        INSTRUCTIONS:
        Analyze the User Query based on the provided Context (if any).
        Use the following format strictly:

        ### 1. Biological Mechanism
        (Explain the pathway or mechanism clearly)

        ### 2. Anatomical Relevance
        (List specific organs, tissues, or receptors involved)

        ### 3. Physiological Impact
        (Describe the expected outcome on the human body)

        User Query: {query}
        """
        
        self.prompt = PromptTemplate(
            input_variables=["query", "context"],
            template=self.template
        )

        self.chain = self.prompt | self.llm | StrOutputParser()

    def run(self, query: str, context: str = "") -> str:
        """
        Executes the agent. Accepts optional 'context' for RAG capabilities.
        """
        logger.info(f"Processing query: {query[:50]}...")
        try:
            return self.chain.invoke({"query": query, "context": context}).strip()
        except Exception as e:
            logger.error(f"Execution Error: {e}")
            return f"HAP Error: Unable to process query."

if __name__ == "__main__":
    # Test Block
    try:
        # Easy to swap models now!
        agent = HumanAnatomyAgent(model_name="llama3") 
        
        test_query = "Explain how the heart pumps blood."
        print(f"\n🧪 Testing Query: {test_query}\n" + "-"*60)
        
        # We can pass context now!
        response = agent.run(test_query, context="Patient has aortic valve stenosis.")
        
        print(response)
        print("-" * 60)
    except Exception as e:
        print(f"Fatal Setup Error: {e}")
