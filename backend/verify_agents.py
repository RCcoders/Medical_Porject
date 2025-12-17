import requests
import json
import sys

def test_agent_query():
    url = "http://localhost:8000/agents/query"
    payload = {"query": "What is the physiological function of Prolactin?"}
    
    print(f"Sending query to {url}...")
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print("Success!")
        print("Response:", json.dumps(data, indent=2))
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if e.response is not None:
            print("Response content:", e.response.text)
        sys.exit(1)

if __name__ == "__main__":
    test_agent_query()
