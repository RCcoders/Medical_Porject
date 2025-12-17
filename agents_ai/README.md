# Agents AI Project

This repository contains two main AI components organized in separate directories:

## Directory Structure

```
agents_ai/
├── market_analysis_agent/     # Pharmaceutical market analysis agent
├── qsar_model/               # QSAR classification model for drug activity prediction
├── .venv/                    # Python virtual environment
├── PROJECT_STATUS.md         # Current project status report
└── CLEANUP_SUMMARY.md        # Summary of project cleanup activities
```

## 1. Market Analysis Agent

Located in the `market_analysis_agent/` directory, this is a pharmaceutical commercial viability analysis agent using LangChain and the ReAct (Reasoning + Acting) pattern.

### Features:
- Market size and growth analysis
- Competitor landscape assessment
- Sentiment and HCP (Healthcare Professional) feedback analysis
- Generates commercial viability scores and risk assessments

### Files:
- `market_analysis_agent.py` - Full LangChain implementation
- `simple_market_agent.py` - Standalone implementation without dependencies
- `demo_both_versions.py` - Demonstration script
- `requirements.txt` - Dependency specifications
- `install.bat` - Windows installation script
- `run_agent.bat` - Windows execution script
- `README.md` - Agent-specific documentation
- `USAGE_INSTRUCTIONS.md` - Detailed usage guide

## 2. QSAR Model

Located in the `qsar_model/` directory, this is a Quantitative Structure-Activity Relationship classification model for predicting drug activity.

### Features:
- Predicts drug activity based on molecular features
- Uses Random Forest Classifier algorithm
- Achieves high accuracy and AUC-ROC scores
- Saved model for integration with other agents

### Files:
- `train_qsar_model.py` - Model training script
- `test_qsar_model.py` - Model testing script
- `clinical_agent_qsarmodel.joblib` - Trained model
- `QSAR_MODEL_USAGE.md` - Documentation for model integration

## Getting Started

1. For the Market Analysis Agent:
   - Navigate to `market_analysis_agent/` directory
   - For immediate use: Run `simple_market_agent.py` (no dependencies required)
   - For full functionality: Run `install.bat` then `run_agent.bat`

2. For the QSAR Model:
   - Navigate to `qsar_model/` directory
   - Run `train_qsar_model.py` to retrain the model
   - Run `test_qsar_model.py` to verify the model

## Status

Both components are fully functional and tested. See `PROJECT_STATUS.md` for detailed status information.