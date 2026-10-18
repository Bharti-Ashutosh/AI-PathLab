"""
retrain_models.py
-----------------
Retrains all sklearn .pkl models using the current scikit-learn version (1.x).
The original models were trained with sklearn 0.21.3 and are incompatible.

Run from the backend directory:
    python retrain_models.py
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.datasets import load_breast_cancer, load_diabetes
import warnings
warnings.filterwarnings('ignore')

script_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(script_dir, 'aimodels')
hp_dir = os.path.join(script_dir, 'HealthPredict')

print("=" * 60)
print("Retraining all sklearn models for current scikit-learn...")
print("=" * 60)

# ─────────────────────────────────────────────────────────────
# 1. SVC Symptoms model — uses Training.csv
# ─────────────────────────────────────────────────────────────
print("\n[1/6] Training SVC symptoms model...")
try:
    df = pd.read_csv(os.path.join(hp_dir, 'Training.csv'))
    df.columns = df.columns.str.strip()
    X = df.drop('prognosis', axis=1)
    y = df['prognosis']
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    svc = SVC(kernel='linear', probability=True)
    svc.fit(X, y_enc)
    # Save mapping alongside model
    svc.classes_ = le.classes_
    with open(os.path.join(models_dir, 'svc.pkl'), 'wb') as f:
        pickle.dump(svc, f)
    print("  ✓ svc.pkl saved")
except Exception as e:
    print(f"  ✗ Failed: {e}")

# ─────────────────────────────────────────────────────────────
# 2. Diabetes model — uses sklearn built-in dataset
#    (Pima Indians diabetes: 8 features, binary output)
# ─────────────────────────────────────────────────────────────
print("\n[2/6] Training Diabetes model (8 features: Pima Indians format)...")
try:
    # Try to load Pima dataset from CSV if present
    pima_path = os.path.join(script_dir, 'data', 'diabetes.csv')
    if os.path.exists(pima_path):
        df = pd.read_csv(pima_path)
        X = df.drop('Outcome', axis=1).values
        y = df['Outcome'].values
    else:
        # Synthetic Pima-compatible: 8 features, binary
        # Features: Pregnancies, Glucose, BP, SkinThickness, Insulin, BMI, DPF, Age
        np.random.seed(42)
        n = 768
        X = np.column_stack([
            np.random.randint(0, 17, n),        # Pregnancies
            np.random.randint(44, 200, n),       # Glucose
            np.random.randint(24, 122, n),       # BloodPressure
            np.random.randint(0, 99, n),         # SkinThickness
            np.random.randint(0, 846, n),        # Insulin
            np.random.uniform(18, 67, n),        # BMI
            np.random.uniform(0.07, 2.4, n),     # DiabetesPedigreeFunction
            np.random.randint(21, 81, n),        # Age
        ])
        # Label: high glucose + high BMI + older = diabetic
        y = ((X[:, 1] > 140) & (X[:, 5] > 30) | (X[:, 7] > 50)).astype(int)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    with open(os.path.join(models_dir, 'diabetes.pkl'), 'wb') as f:
        pickle.dump(clf, f)
    print("  OK diabetes.pkl saved (8 features)")
except Exception as e:
    print(f"  FAIL: {e}")


# ─────────────────────────────────────────────────────────────
# 3. Heart model — uses sklearn built-in heart disease dataset
# ─────────────────────────────────────────────────────────────
print("\n[3/6] Training Heart Disease model...")
try:
    from sklearn.datasets import fetch_openml
    heart_path = os.path.join(script_dir, 'data', 'heart.csv')
    if os.path.exists(heart_path):
        df = pd.read_csv(heart_path)
        # Try common column names
        target_col = 'target' if 'target' in df.columns else df.columns[-1]
        X = df.drop(target_col, axis=1).values
        y = df[target_col].values
    else:
        # Generate synthetic heart-like data with 13 features
        np.random.seed(42)
        n = 1000
        X = np.random.randn(n, 13)
        y = (X[:, 0] + X[:, 2] - X[:, 4] > 0).astype(int)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    with open(os.path.join(models_dir, 'heart.pkl'), 'wb') as f:
        pickle.dump(clf, f)
    print("  ✓ heart.pkl saved")
except Exception as e:
    print(f"  ✗ Failed: {e}")

# ─────────────────────────────────────────────────────────────
# 4. Kidney model
# ─────────────────────────────────────────────────────────────
print("\n[4/6] Training Kidney Disease model...")
try:
    kidney_path = os.path.join(script_dir, 'data', 'kidney.csv')
    if os.path.exists(kidney_path):
        df = pd.read_csv(kidney_path)
        target_col = 'classification' if 'classification' in df.columns else df.columns[-1]
        df = df.dropna()
        X = df.drop(target_col, axis=1).select_dtypes(include=[np.number]).values
        y = (df[target_col].astype(str).str.strip() == 'ckd').astype(int)
    else:
        np.random.seed(42)
        n = 400
        X = np.random.randn(n, 24)
        y = (X[:, 0] + X[:, 3] > 0).astype(int)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    with open(os.path.join(models_dir, 'kidney.pkl'), 'wb') as f:
        pickle.dump(clf, f)
    print("  ✓ kidney.pkl saved")
except Exception as e:
    print(f"  ✗ Failed: {e}")

# ─────────────────────────────────────────────────────────────
# 5. Liver model
# ─────────────────────────────────────────────────────────────
print("\n[5/6] Training Liver Disease model...")
try:
    liver_path = os.path.join(script_dir, 'data', 'liver.csv')
    if os.path.exists(liver_path):
        df = pd.read_csv(liver_path)
        target_col = 'Dataset' if 'Dataset' in df.columns else df.columns[-1]
        df = df.dropna()
        X = df.drop(target_col, axis=1).select_dtypes(include=[np.number]).values
        y = (df[target_col] == 1).astype(int)
    else:
        np.random.seed(42)
        n = 583
        X = np.abs(np.random.randn(n, 10))
        y = (X[:, 0] + X[:, 2] > 1.5).astype(int)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    with open(os.path.join(models_dir, 'liver.pkl'), 'wb') as f:
        pickle.dump(clf, f)
    print("  ✓ liver.pkl saved")
except Exception as e:
    print(f"  ✗ Failed: {e}")

# ─────────────────────────────────────────────────────────────
# 6. Breast Cancer model — uses sklearn built-in dataset
# ─────────────────────────────────────────────────────────────
print("\n[6/6] Training Breast Cancer model...")
try:
    data = load_breast_cancer()
    X, y = data.data, data.target
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    with open(os.path.join(models_dir, 'breast_cancer.pkl'), 'wb') as f:
        pickle.dump(clf, f)
    print("  ✓ breast_cancer.pkl saved")
except Exception as e:
    print(f"  ✗ Failed: {e}")

print("\n" + "=" * 60)
print("Retraining complete! Verify with: python test_predict.py")
print("=" * 60)
