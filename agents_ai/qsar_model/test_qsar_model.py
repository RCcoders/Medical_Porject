#!/usr/bin/env python3
"""
Test script to verify the trained QSAR model can be loaded and used for predictions.
"""

import joblib
import pandas as pd
import numpy as np

def test_model_loading():
    """
    Test that the model can be loaded successfully.
    """
    try:
        # Load the trained model
        model = joblib.load("clinical_agent_qsarmodel.joblib")
        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def test_sample_predictions(model):
    """
    Test the model with sample data.
    """
    # Create sample data matching the feature structure
    # Note: This is just for demonstration - in practice, you would use real molecular data
    sample_data = {
        'molecular_weight': [500.0],
        'logp': [2.5],
        'h_bond_donors': [2],
        'h_bond_acceptors': [4],
        'rotatable_bonds': [3],
        'polar_surface_area': [80.0],
        'compound_clogp': [3.0],
        'protein_length': [400],
        'protein_pi': [6.5],
        'hydrophobicity': [0.7],
        'binding_site_size': [15.0],
        'mw_ratio': [1.25],
        'logp_pi_interaction': [15.0],
        'binding_affinity': [7.5]
    }
    
    # Convert to DataFrame
    sample_df = pd.DataFrame(sample_data)
    
    try:
        # Make prediction
        prediction = model.predict(sample_df)
        probability = model.predict_proba(sample_df)
        
        print(f"Sample prediction: {prediction[0]}")
        print(f"Probability of active: {probability[0][1]:.4f}")
        print(f"Probability of inactive: {probability[0][0]:.4f}")
        
    except Exception as e:
        print(f"Error making prediction: {e}")

def main():
    """
    Main function to test the QSAR model.
    """
    print("Testing QSAR Model Loading and Predictions")
    print("=" * 45)
    
    # Test model loading
    model = test_model_loading()
    
    if model is not None:
        # Test sample predictions
        print("\nTesting sample predictions:")
        test_sample_predictions(model)
        
        # Show model information
        print(f"\nModel type: {type(model)}")
        print(f"Number of features expected: {model.n_features_in_}")
        
    print("\nTest completed.")

if __name__ == "__main__":
    main()