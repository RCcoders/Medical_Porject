# Usage Instructions for Market Analysis Agent

## Option 1: Using the Simplified Version (No Dependencies Required)

The simplified version [simple_market_agent.py](file:///c:/Users/thaku/Downloads/agents_ai/simple_market_agent.py) demonstrates all the core functionality without requiring any external dependencies.

To run it:
```bash
cd c:\Users\thaku\Downloads\agents_ai
python simple_market_agent.py
```

This will show the complete ReAct pattern in action:
1. Thought processes
2. Tool calls with parameters
3. Observations from tool responses
4. Final structured answer with viability score and risks

## Option 2: Using the Full LangChain Version (With Dependencies)

### Prerequisites Installation

If you want to use the full LangChain-powered version [market_analysis_agent.py](file:///c:/Users/thaku/Downloads/agents_ai/market_analysis_agent.py), you'll need to install the dependencies.

#### Method 1: Manual Installation
```bash
cd c:\Users\thaku\Downloads\agents_ai
pip install -r requirements.txt
```

#### Method 2: Using the Batch File (Windows)
Double-click on `install.bat` in the project folder.

### Running the Full Version

#### With Environment Variable
```bash
set OPENAI_API_KEY=your_actual_openai_api_key_here
python market_analysis_agent.py
```

#### Without API Key (Will Use Placeholder)
```bash
python market_analysis_agent.py
```

Note: Without a valid API key, the full LangChain version will still run but will encounter authentication errors with the LLM. The simplified version works completely standalone.

## Understanding the Output

Both versions will produce a structured analysis following this format:

1. **Commercial Viability Score** (1-100 scale)
2. **Top 3 Commercial Risks** as bullet points
3. **Market Opportunity** summary

The agent follows the ReAct pattern:
- **Thought**: Reasoning about what information is needed
- **Action**: Calling one of the three specialized tools
- **Observation**: Processing the tool response
- **Final Answer**: Synthesizing all information into actionable insights

## Customization

You can modify the simulated data in either version to test different scenarios:
- Change therapeutic areas
- Modify market sizes and growth rates
- Update competitor information
- Adjust sentiment analysis data

The tools are designed to simulate access to proprietary commercial data as specified in the requirements.