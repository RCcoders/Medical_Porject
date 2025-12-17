#!/usr/bin/env python3
"""
Train a QSAR Classification Model using pre-processed drug discovery data.
This model will be integrated as a tool in the Clinical Trials Agent to predict drug activity risk.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import joblib
import os

def load_and_prepare_data(file_path):
    """
    Load the data from the specified file path and prepare it for modeling.
    
    Parameters:
    file_path (str): Path to the pre-processed drug discovery data CSV file
    
    Returns:
    tuple: (X, y) where X is the feature matrix and y is the target vector
    """
    print(f"Loading data from {file_path}...")
    
    # Load the data
    df = pd.read_csv(file_path)
    print(f"Data loaded successfully. Shape: {df.shape}")
    
    # Display basic information about the dataset
    print(f"Columns: {list(df.columns)}")
    print(f"Target distribution:\n{df['active'].value_counts()}")
    
    # Define features (X) and target (y)
    # Exclude identifier columns: compound_id and protein_id
    feature_columns = [col for col in df.columns if col not in ['compound_id', 'protein_id', 'active']]
    X = df[feature_columns]
    y = df['active']
    
    print(f"Feature matrix shape: {X.shape}")
    print(f"Target vector shape: {y.shape}")
    
    return X, y

def train_model(X, y):
    """
    Train a Random Forest Classifier model.
    
    Parameters:
    X (DataFrame): Feature matrix
    y (Series): Target vector
    
    Returns:
    tuple: (model, X_test, y_test) trained model and test data
    """
    print("Splitting data into training and testing sets (70% train, 30% test)...")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Instantiate the Random Forest Classifier
    print("Instantiating Random Forest Classifier...")
    model = RandomForestClassifier(random_state=42)
    
    # Train the model
    print("Training the model...")
    model.fit(X_train, y_train)
    print("Model training completed.")
    
    return model, X_test, y_test

def evaluate_model(model, X_test, y_test):
    """
    Evaluate the trained model on the test set.
    
    Parameters:
    model: Trained classifier
    X_test (DataFrame): Test feature matrix
    y_test (Series): Test target vector
    """
    print("Evaluating model performance...")
    
    # Make predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]  # Probability of positive class
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_pred_proba)
    
    print(f"Accuracy Score: {accuracy:.4f}")
    print(f"AUC-ROC Score: {auc_roc:.4f}")
    
    return accuracy, auc_roc

def save_model(model, file_path):
    """
    Save the trained model to disk.
    
    Parameters:
    model: Trained classifier
    file_path (str): Path to save the model
    """
    print(f"Saving model to {file_path}...")
    joblib.dump(model, file_path)
    print("Model saved successfully.")

def main():
    """
    Main function to execute the complete QSAR model training pipeline.
    """
    # Define file paths
    data_file_path = r"C:\Users\thaku\Downloads\drug_discovery_virtual_screening_preprocessed (1).csv"
    model_save_path = "clinical_agent_qsarmodel.joblib"
    
    try:
        # Step 1: Load and prepare data
        X, y = load_and_prepare_data(data_file_path)
        
        # Step 2: Train the model
        model, X_test, y_test = train_model(X, y)
        
        # Step 3: Evaluate the model
        accuracy, auc_roc = evaluate_model(model, X_test, y_test)
        
        # Step 4: Save the model
        save_model(model, model_save_path)
        
        print("\n" + "="*50)
        print("QSAR MODEL TRAINING COMPLETED SUCCESSFULLY")
        print("="*50)
        print(f"Model saved to: {model_save_path}")
        print(f"Test Accuracy: {accuracy:.4f}")
        print(f"Test AUC-ROC: {auc_roc:.4f}")
        print("="*50)
        
    except FileNotFoundError:
        print(f"Error: Could not find the data file at {data_file_path}")
        print("Please ensure the file exists and the path is correct.")
    except Exception as e:
        print(f"An error occurred during model training: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()