import os
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def train_placement_model():
    data_path = os.path.join(os.path.dirname(__file__), "data", "placement_data.csv")
    if not os.path.exists(data_path):
        from data.generate_synthetic_data import generate_student_dataset
        generate_student_dataset()

    df = pd.read_csv(data_path)

    # Feature columns used for training
    feature_cols = [
        "cgpa", "easySolved", "mediumSolved", "hardSolved",
        "contestRating", "projectsCount", "internshipsCount",
        "certifications", "semester", "communityActivityScore"
    ]

    X = df[feature_cols]
    y = df["placed"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Model 1: Logistic Regression
    lr = LogisticRegression(random_state=42, max_iter=1000)
    lr.fit(X_train_scaled, y_train)
    lr_preds = lr.predict(X_test_scaled)
    lr_f1 = f1_score(y_test, lr_preds)

    # Model 2: Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    rf.fit(X_train_scaled, y_train)
    rf_preds = rf.predict(X_test_scaled)
    rf_f1 = f1_score(y_test, rf_preds)

    print(f"[EVALUATION] Model Comparison:")
    print(f"   Logistic Regression F1: {lr_f1:.4f}")
    print(f"   Random Forest F1:       {rf_f1:.4f}")

    if rf_f1 >= lr_f1:
        best_model = rf
        best_name = "RandomForestClassifier"
        best_preds = rf_preds
        importances = rf.feature_importances_
    else:
        best_model = lr
        best_name = "LogisticRegression"
        best_preds = lr_preds
        importances = np.abs(lr.coef_[0])

    acc = accuracy_score(y_test, best_preds)
    prec = precision_score(y_test, best_preds)
    rec = recall_score(y_test, best_preds)
    f1 = f1_score(y_test, best_preds)

    print(f"\n[WINNER] Selected Model: {best_name}")
    print(f"   Accuracy:  {acc:.4f}")
    print(f"   Precision: {prec:.4f}")
    print(f"   Recall:    {rec:.4f}")
    print(f"   F1 Score:  {f1:.4f}")

    feature_importances = dict(zip(feature_cols, importances))
    sorted_importances = sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)

    print("\n[FACTORS] Feature Importances Summary:")
    for feat, imp in sorted_importances:
        print(f"   - {feat}: {imp:.4f}")

    # Package Band mapping logic dataset
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    model_save_path = os.path.join(models_dir, "placement_model.pkl")

    save_payload = {
        "model": best_model,
        "scaler": scaler,
        "feature_cols": feature_cols,
        "best_name": best_name,
        "metrics": {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1},
        "feature_importances": feature_importances
    }

    joblib.dump(save_payload, model_save_path)
    print(f"\n[SAVED] Model successfully saved to: {model_save_path}")

if __name__ == "__main__":
    train_placement_model()
