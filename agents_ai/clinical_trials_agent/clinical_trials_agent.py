import os
import sys
import requests
from dotenv import load_dotenv
from langchain_mistralai.chat_models import ChatMistralAI
from langchain_core.tools import Tool

# --- 1. SECURE ENVIRONMENT SETUP ---

def setup_environment():
    """
    Checks for .env file. If not found, creates it with placeholder Mistral key.
    Then loads and validates the environment variables.
    """
    env_path = ".env"
    
    # Check if .env exists, create if missing
    if not os.path.exists(env_path):
        print(f"'{env_path}' not found. Creating it with placeholder keys...")
        with open(env_path, "a") as f: # Append mode to avoid overwriting existing keys from other agents
            f.write("\n# Clinical Trials Agent Keys\n")
            f.write("MISTRAL_API_KEY=YOUR_MISTRAL_API_KEY\n")
        print(f"'{env_path}' updated. Please replace YOUR_MISTRAL_API_KEY with your actual key.")
        sys.exit(1)
    
    # Load environment variables
    load_dotenv(env_path)
    
    # Verify Mistral Key
    api_key = os.environ.get("MISTRAL_API_KEY")
    if not api_key or api_key == "YOUR_MISTRAL_API_KEY":
        print("-" * 70)
        print("CRITICAL ERROR: MISTRAL_API_KEY not found or is still the placeholder.")
        print(f"Please update '{env_path}' with your actual Mistral API key.")
        print("-" * 70)
        sys.exit(1)
    else:
        print("Environment variables loaded successfully.")

# Run setup
setup_environment()

# Constants
CLINICAL_TRIALS_API_BASE = "https://clinicaltrials.gov/api/v2/studies"

# --- 2. TOOL DEFINITIONS ---

def assess_qsarm_risk(drug_name: str) -> str:
    """
    Simulates the local QSAR model assessment for drug toxicity.
    """
    return f"QSAR Model Assessment for {drug_name}: Low-to-Moderate Toxicity Risk. Primary concern: Liver Metabolism (Flagged)."

def search_clinical_trials(drug_name: str) -> str:
    """
    Searches ClinicalTrials.gov for studies related to the drug.
    """
    try:
        params = {
            "query.term": drug_name,
            "pageSize": 3
        }
        headers = {"Accept": "application/json"}
        
        response = requests.get(CLINICAL_TRIALS_API_BASE, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        studies = data.get("studies", [])
        
        if not studies:
            return f"No clinical trials found for {drug_name}."
            
        trial_summaries = []
        for study in studies:
            protocol = study.get("protocolSection", {})
            id_module = protocol.get("identificationModule", {})
            nct_id = id_module.get("nctId", "Unknown ID")
            
            design = protocol.get("designModule", {})
            phases = design.get("phases", ["Phase Unknown"])
            phase_str = ", ".join(phases)
            
            trial_summaries.append(f"{nct_id} ({phase_str})")
            
        return f"Found {len(studies)} trials: " + ", ".join(trial_summaries)
        
    except Exception as e:
        return f"Error searching clinical trials: {str(e)}"

def search_pubmed_literature(query: str) -> str:
    """
    Simulates searching PubMed for literature.
    """
    return f"PubMed Literature Search for '{query}': Found 12 high-impact abstracts related to off-target safety signals."

# --- 3. AGENT CLASS DEFINITION ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from simple_agent import SimpleAgent
except ImportError:
    sys.path.append("..") 
    from simple_agent import SimpleAgent

class ClinicalTrialsAgent:
    def __init__(self):
        print("Initializing Clinical Trials Agent (CTA)...")
        # Initialize LLM
        try:
            self.llm = ChatMistralAI(
                model="mistral-small",
                mistral_api_key=os.environ["MISTRAL_API_KEY"]
            )
        except Exception as e:
            print(f"Failed to initialize ChatMistralAI: {e}")
            raise

        # Define Tools
        self.tools = [
            Tool(
                name="QSAR Risk Assessment",
                func=assess_qsarm_risk,
                description="Use this tool first to assess the toxicity risk of a drug."
            ),
            Tool(
                name="Clinical Trials Search",
                func=search_clinical_trials,
                description="Use this tool to find active clinical trials, their phases, and IDs from ClinicalTrials.gov."
            ),
            Tool(
                name="PubMed Search",
                func=search_pubmed_literature,
                description="Use this tool to search for medical literature and safety signals."
            )
        ]

        # Initialize Custom Agent
        self.agent = SimpleAgent(self.tools, self.llm)

    def run(self, query: str) -> str:
        print(f"CTA Processing Query: {query}")
        try:
            return self.agent.run(query)
        except Exception as e:
            return f"CTA Error: {e}"

def main():
    print("-" * 50)
    print("Testing Clinical Trials Agent...")
    print("-" * 50)

    agent = ClinicalTrialsAgent()
    test_query = "Find clinical trials for 'Novartis Drug X'."
    
    print(f"\nTest Query: {test_query}\n")
    print(agent.run(test_query))

if __name__ == "__main__":
    setup_environment()
    main()
