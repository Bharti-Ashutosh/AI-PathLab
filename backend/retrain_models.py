"""
retrain_models.py
-----------------
Retrains all sklearn .pkl models using the current scikit-learn version (1.x)
on real clinical datasets with exact feature ordering and label conventions
matching the frontend forms (1 = Unhealthy / Positive, 0 = Healthy / Negative).

Run from the backend directory:
    python retrain_models.py
"""

import os
import pickle
import warnings
import numpy as np
import pandas as pd
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.datasets import fetch_openml, load_breast_cancer
from sklearn.model_selection import cross_val_score

warnings.filterwarnings("ignore")

script_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(script_dir, "aimodels")
hp_dir = os.path.join(script_dir, "HealthPredict")
os.makedirs(models_dir, exist_ok=True)

print("=" * 60)
print("Retraining all sklearn models on clinical datasets...")
print("=" * 60)

# ─────────────────────────────────────────────────────────────
# 1. SVC Symptoms model — uses HealthPredict/Training.csv
# ─────────────────────────────────────────────────────────────
print("\n[1/6] Training SVC symptoms model...")
try:
    df = pd.read_csv(os.path.join(hp_dir, "Training.csv"))
    df.columns = df.columns.str.strip()
    X = df.drop("prognosis", axis=1)
    y = df["prognosis"]
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    svc = SVC(kernel="linear", probability=True)
    svc.fit(X, y_enc)
    svc.classes_ = le.classes_
    with open(os.path.join(models_dir, "svc.pkl"), "wb") as f:
        pickle.dump(svc, f)
    print("  OK svc.pkl saved (132 features, 41 diseases)")
except Exception as e:
    print(f"  FAIL svc.pkl: {e}")

# ─────────────────────────────────────────────────────────────
# 2. Diabetes model — OpenML Pima Indians Diabetes (id=37, 8 features)
#    Features: preg, plas, pres, skin, insu, mass, pedi, age
# ─────────────────────────────────────────────────────────────
print("\n[2/6] Training Diabetes model (OpenML 37, 8 features)...")
try:
    diab = fetch_openml(data_id=37, as_frame=True, parser="auto")
    df_d = diab.frame
    X_d = df_d[["preg", "plas", "pres", "skin", "insu", "mass", "pedi", "age"]].astype(float).values
    y_d = (df_d["class"].astype(str).str.strip() == "tested_positive").astype(int).values

    clf_d = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)
    cv = cross_val_score(clf_d, X_d, y_d, cv=5).mean()
    clf_d.fit(X_d, y_d)
    with open(os.path.join(models_dir, "diabetes.pkl"), "wb") as f:
        pickle.dump(clf_d, f)
    print(f"  OK diabetes.pkl saved (8 features, 5-fold CV={cv:.3f})")
except Exception as e:
    print(f"  FAIL diabetes.pkl: {e}")

# ─────────────────────────────────────────────────────────────
# 3. Heart Disease model — OpenML Cleveland Heart (id=49, 13 features)
#    Features: age, sex, cp(1-4), trestbps, chol, fbs, restecg(0-2),
#              thalach, exang, oldpeak, slope(1-3), ca(0-3), thal(3/6/7)
# ─────────────────────────────────────────────────────────────
print("\n[3/6] Training Heart Disease model (OpenML 49, 13 features)...")
try:
    heart = fetch_openml(data_id=49, as_frame=True, parser="auto")
    df_h = heart.frame.copy()
    df_h["sex"] = (df_h["sex"].astype(str).str.strip() == "male").astype(float)
    df_h["cp"] = df_h["cp"].astype(str).str.strip().map(
        {"typ_angina": 1, "atyp_angina": 2, "non_anginal": 3, "asympt": 4}
    )
    df_h["fbs"] = (df_h["fbs"].astype(str).str.strip() == "t").astype(float)
    df_h["restecg"] = df_h["restecg"].astype(str).str.strip().map(
        {"normal": 0, "st_t_wave_abnormality": 1, "left_vent_hyper": 2}
    )
    df_h["exang"] = (df_h["exang"].astype(str).str.strip() == "yes").astype(float)
    df_h["slope"] = df_h["slope"].astype(str).str.strip().map(
        {"up": 1, "flat": 2, "down": 3}
    )
    df_h["thal"] = df_h["thal"].astype(str).str.strip().map(
        {"normal": 3, "fixed_defect": 6, "reversable_defect": 7}
    )
    df_h["target"] = (df_h["num"].astype(str).str.strip() != "<50").astype(int)

    h_cols = [
        "age", "sex", "cp", "trestbps", "chol", "fbs",
        "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
    ]
    for col in h_cols:
        df_h[col] = pd.to_numeric(df_h[col], errors="coerce")
    df_h = df_h.dropna(subset=h_cols)

    X_h = df_h[h_cols].values
    y_h = df_h["target"].values

    clf_h = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42)
    cv = cross_val_score(clf_h, X_h, y_h, cv=5).mean()
    clf_h.fit(X_h, y_h)
    with open(os.path.join(models_dir, "heart.pkl"), "wb") as f:
        pickle.dump(clf_h, f)
    print(f"  OK heart.pkl saved (13 features, 5-fold CV={cv:.3f})")
except Exception as e:
    print(f"  FAIL heart.pkl: {e}")

# ─────────────────────────────────────────────────────────────
# 4. Kidney Disease model — OpenML CKD (id=42972, exact 18 features)
#    Features: age, bp, al, su, rbc, pc, pcc, ba, bgr, bu, sc, pot, wc,
#              htn, dm, cad, pe, ane
#    Encoding: normal=0/abnormal=1, notpresent=0/present=1, no=0/yes=1
# ─────────────────────────────────────────────────────────────
print("\n[4/6] Training Kidney Disease model (OpenML 42972, 18 features)...")
try:
    ckd = fetch_openml(data_id=42972, as_frame=True, parser="auto")
    df_k = ckd.frame.copy()
    df_k["classification"] = (
        df_k["classification"].astype(str).str.replace("'", "").str.strip().str.lower()
    )
    df_k = df_k[df_k["classification"].isin(["ckd", "ckdt", "notckd"])]
    df_k["target"] = df_k["classification"].isin(["ckd", "ckdt"]).astype(int)

    for col in ["rbc", "pc"]:
        df_k[col] = df_k[col].astype(str).str.strip().str.lower().map(
            {"normal": 0, "abnormal": 1}
        )
    for col in ["pcc", "ba"]:
        df_k[col] = df_k[col].astype(str).str.strip().str.lower().map(
            {"notpresent": 0, "present": 1}
        )
    for col in ["htn", "dm", "cad", "pe", "ane"]:
        s = (
            df_k[col]
            .astype(str)
            .str.replace("'", "")
            .str.strip()
            .str.lower()
            .replace({"tno": "no", "tyes": "yes"})
        )
        df_k[col] = s.map({"no": 0, "yes": 1})

    k_cols = [
        "age", "bp", "al", "su", "rbc", "pc", "pcc", "ba",
        "bgr", "bu", "sc", "pot", "wc", "htn", "dm", "cad", "pe", "ane"
    ]
    for col in k_cols:
        df_k[col] = pd.to_numeric(
            df_k[col].astype(str).str.replace("'", "").str.replace("\t", "").str.strip(),
            errors="coerce",
        )
        if df_k[col].isna().any():
            df_k[col] = df_k[col].fillna(df_k[col].median())

    X_k = df_k[k_cols].values
    y_k = df_k["target"].values

    clf_k = RandomForestClassifier(n_estimators=200, random_state=42)
    cv = cross_val_score(clf_k, X_k, y_k, cv=5).mean()
    clf_k.fit(X_k, y_k)
    with open(os.path.join(models_dir, "kidney.pkl"), "wb") as f:
        pickle.dump(clf_k, f)
    print(f"  OK kidney.pkl saved (18 features, 5-fold CV={cv:.3f})")
except Exception as e:
    print(f"  FAIL kidney.pkl: {e}")

# ─────────────────────────────────────────────────────────────
# 5. Liver Disease model — OpenML ILPD (id=1480, 10 features)
#    Exact frontend feature order in LiverDiseaseTest.jsx:
#      Age(V1), Total Bilirubin(V3), Direct Bilirubin(V4),
#      Alkaline Phosphotase(V5), Alamine Aminotransferase(V6),
#      Aspartate Aminotransferase(V7), Total Protiens(V8),
#      Albumin(V9), Albumin and Globulin Ratio(V10), Gender(Male=1,Female=0)
#    Target: Class 1 (liver patient) -> 1, Class 2 (healthy) -> 0
# ─────────────────────────────────────────────────────────────
print("\n[5/6] Training Liver Disease model (OpenML 1480, 10 features)...")
try:
    ilpd = fetch_openml(data_id=1480, as_frame=True, parser="auto")
    df_l = ilpd.frame.copy()
    df_l["Gender"] = (df_l["V2"].astype(str).str.strip() == "Male").astype(float)
    for col in ["V1", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"]:
        df_l[col] = pd.to_numeric(df_l[col], errors="coerce")
    df_l = df_l.dropna()

    X_l = df_l[["V1", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "Gender"]].values
    y_l = (df_l["Class"].astype(str).str.strip() == "1").astype(int).values

    # class_weight='balanced' handles the 71%/29% ILPD imbalance cleanly
    clf_l = RandomForestClassifier(
        n_estimators=300, max_depth=8, class_weight="balanced", random_state=42
    )
    cv = cross_val_score(clf_l, X_l, y_l, cv=5).mean()
    clf_l.fit(X_l, y_l)
    with open(os.path.join(models_dir, "liver.pkl"), "wb") as f:
        pickle.dump(clf_l, f)
    print(f"  OK liver.pkl saved (10 features, 5-fold CV={cv:.3f})")
except Exception as e:
    print(f"  FAIL liver.pkl: {e}")

# ─────────────────────────────────────────────────────────────
# 6. Breast Cancer model — sklearn load_breast_cancer (exact 26 features)
#    Labels inverted so 1 = Malignant (Unhealthy), 0 = Benign (Healthy)
# ─────────────────────────────────────────────────────────────
print("\n[6/6] Training Breast Cancer model (26 features matching frontend)...")
try:
    bc = load_breast_cancer(as_frame=True)
    df_bc = bc.frame
    bc_cols = [
        "mean radius", "mean texture", "mean perimeter", "mean area", "mean smoothness",
        "mean compactness", "mean concavity", "mean concave points", "mean symmetry",
        "radius error", "perimeter error", "area error", "compactness error",
        "concavity error", "concave points error", "fractal dimension error",
        "worst radius", "worst texture", "worst perimeter", "worst area",
        "worst smoothness", "worst compactness", "worst concavity", "worst concave points",
        "worst symmetry", "worst fractal dimension",
    ]
    X_bc = df_bc[bc_cols].values
    y_bc = 1 - df_bc["target"].values  # 1 = Malignant, 0 = Benign

    clf_bc = RandomForestClassifier(n_estimators=200, random_state=42)
    cv = cross_val_score(clf_bc, X_bc, y_bc, cv=5).mean()
    clf_bc.fit(X_bc, y_bc)
    with open(os.path.join(models_dir, "breast_cancer.pkl"), "wb") as f:
        pickle.dump(clf_bc, f)
    print(f"  OK breast_cancer.pkl saved (26 features, 5-fold CV={cv:.3f})")
except Exception as e:
    print(f"  FAIL breast_cancer.pkl: {e}")

print("\n" + "=" * 60)
print("Retraining complete!")
print("=" * 60)
