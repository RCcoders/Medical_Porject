# Market Analysis Agent for Pharmaceutical Commercial Viability

This project implements a specialized Market Analysis Agent using the LangChain framework that operates under the ReAct (Reasoning and Acting) pattern. The agent focuses exclusively on pharmaceutical commercial viability and competitive intelligence. This version has been migrated from OpenAI to Google GenAI.

## Features

- Uses LangChain framework with ReAct pattern for reasoning and acting
- Implements three specialized tools for pharmaceutical market analysis:
  1. Market size and growth analysis
  2. Competitor landscape analysis
  3. Sentiment and HCP feedback analysis
- Provides commercial viability scores and risk assessments
- Simulates access to proprietary commercial data

## Requirements

- Python 3.8+
- LangChain
- Google GenAI API key
- Pydantic

## Installation

### Option 1: Manual Installation
1. Clone this repository
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

### Option 2: Windows Batch Script
On Windows, you can simply double-click the `install.bat` file to install dependencies.

## Usage

1. Set your Google GenAI API key as an environment variable:
   ```bash
   export GOOGLE_API_KEY='your-google-api-key-here'
   ```
   
   On Windows:
   ```cmd
   set GOOGLE_API_KEY=your-google-api-key-here
   ```
   
   You can obtain a Google API key from [Google AI Studio](https://aistudio.google.com/)

2. Run the market analysis agent:
   ```
   python market_analysis_agent.py
   ```
   
   Or on Windows, double-click the `run_agent.bat` file.

## Customization

You can customize the agent by:
- Changing the LLM model in the script (currently uses `gemini-pro`)
- Modifying the simulated data in the tool functions
- Updating the system prompt to adjust the agent's behavior

## How It Works

The agent follows a strict ReAct pattern:
1. Thought: Analyzes what information is needed
2. Action: Calls one of the specialized tools
3. Observation: Receives data from the tool
4. Thought: Processes the observation
5. Final Answer: Provides a structured response with viability score and risks

The agent is constrained to only use its specialized tools and cannot access external sources.