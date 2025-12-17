import os
import sys
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings

# Load Env
load_dotenv()

# Configuration
DATA_PATH = "context_data.txt"
DB_PATH = "./chroma_db"
# Use the same model as agents or a specific embedding model.
# "nomic-embed-text" is better, but "llama3" works for embeddings too (though large).
# Let's try to use "nomic-embed-text" if available, else "mistral" or "llama3".
# I'll default to "llama3" since I know it's pulled. 
# Although "all-minilm" or "nomic-embed-text" are standard.
# Attempting to use "llama3" for simplicity as the user has it.
EMBEDDING_MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3") 

def ingest():
    print(f"Starting Ingestion (Model: {EMBEDDING_MODEL_NAME})...")
    
    if not os.path.exists(DATA_PATH):
        print(f"❌ Data file not found: {DATA_PATH}")
        return

    # 1. Load Data
    print(f"   - Loading {DATA_PATH}...")
    loader = TextLoader(DATA_PATH)
    docs = loader.load()
    
    # 2. Split Text
    print("   - Splitting text...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)
    print(f"   - Created {len(splits)} chunks.")
    
    # 3. Embed & Store
    print(f"   - Embedding into ChromaDB at {DB_PATH}...")
    try:
        embedding_fn = OllamaEmbeddings(model=EMBEDDING_MODEL_NAME)
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embedding_fn,
            persist_directory=DB_PATH
        )
        print("✅ Ingestion Complete!")
    except Exception as e:
        print(f"❌ Error during embedding: {e}")
        # Hint for user
        if "not found" in str(e).lower():
            print(f"💡 Hint: Run `ollama pull {EMBEDDING_MODEL_NAME}` if you haven't yet.")

if __name__ == "__main__":
    ingest()
