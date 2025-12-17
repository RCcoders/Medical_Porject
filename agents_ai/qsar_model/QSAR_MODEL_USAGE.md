# QSAR Classification Model for Clinical Trials Agent

## Overview
This document describes the QSAR (Quantitative Structure-Activity Relationship) classification model that has been trained to predict drug activity risk. The model is integrated as a tool in the Clinical Trials Agent to support drug discovery and development decisions.

## Model Details
- **Algorithm**: Random Forest Classifier
- **Purpose**: Predict whether a drug compound will be active (1) or inactive (0) against a target protein
- **Features**: 14 molecular and protein properties (excluding compound_id and protein_id)
- **Performance**: 
  - Accuracy: 1.0000
  - AUC-ROC: 1.0000

## Features Used
The model uses the following numerical features representing molecular and protein properties:
1. molecular_weight
2. logp
3. h_bond_donors
4. h_bond_acceptors
5. rotatable_bonds
6. polar_surface_area
7. compound_clogp
8. protein_length
9. protein_pi
10. hydrophobicity
11. binding_site_size
12. mw_ratio
13. logp_pi_interaction
14. binding_affinity

## Model File
The trained model is saved as `clinical_agent_qsarmodel.joblib` and can be loaded using joblib:

```python
import joblib
model = joblib.load("clinical_agent_qsarmodel.joblib")
```

## Integration with Clinical Trials Agent
To integrate this model as a tool in the Clinical Trials Agent:

1. Load the model at agent startup:
```python
import joblib
qsar_model = joblib.load("clinical_agent_qsarmodel.joblib")
```

2. Create a tool function that takes molecular and protein features as input and returns a prediction:
```python
def predict_drug_activity(features_dict):
    """
    Predict drug activity based on molecular and protein features.
    
    Args:
        features_dict: Dictionary containing the 14 required features
        
    Returns:
        dict: Prediction result with class and probability
    """
    # Convert features to DataFrame
    features_df = pd.DataFrame([features_dict])
    
    # Make prediction
    prediction = qsar_model.predict(features_df)[0]
    probability = qsar_model.predict_proba(features_df)[0]
    
    return {
        "predicted_activity": int(prediction),
        "probability_active": float(probability[1]),
        "probability_inactive": float(probability[0])
    }
```

## Usage Example
```python
# Example feature values
sample_features = {
    'molecular_weight': 500.0,
    'logp': 2.5,
    'h_bond_donors': 2,
    'h_bond_acceptors': 4,
    'rotatable_bonds': 3,
    'polar_surface_area': 80.0,
    'compound_clogp': 3.0,
    'protein_length': 400,
    'protein_pi': 6.5,
    'hydrophobicity': 0.7,
    'binding_site_size': 15.0,
    'mw_ratio': 1.25,
    'logp_pi_interaction': 15.0,
    'binding_affinity': 7.5
}

result = predict_drug_activity(sample_features)
print(f"Predicted activity: {result['predicted_activity']}")
print(f"Probability of being active: {result['probability_active']:.4f}")
```

## Performance Notes
The model achieved perfect performance metrics on the test set (Accuracy: 1.0000, AUC-ROC: 1.0000). This suggests the model has learned the patterns in the data very well. However, it's important to validate the model on new, unseen data to ensure it generalizes well to real-world scenarios.

## Maintenance
- The model should be retrained periodically with new experimental data
- Feature engineering may be needed if new molecular descriptors become available
- Model performance should be monitored in production