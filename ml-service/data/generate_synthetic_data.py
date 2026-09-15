import os
import numpy as np
import pandas as pd

def generate_student_dataset(n_samples=3500, random_seed=42):
    np.random.seed(random_seed)

    branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"]
    branch_weights = [0.4, 0.2, 0.15, 0.1, 0.05, 0.1]

    cgpa = np.round(np.clip(np.random.normal(7.8, 1.1, n_samples), 5.5, 10.0), 2)
    easySolved = np.random.randint(10, 350, n_samples)
    mediumSolved = np.random.randint(0, 200, n_samples)
    hardSolved = np.random.randint(0, 50, n_samples)
    contestRating = np.round(np.clip(np.random.normal(1400, 250, n_samples), 800, 2300), 0)
    projectsCount = np.random.randint(0, 8, n_samples)
    internshipsCount = np.random.randint(0, 4, n_samples)
    certifications = np.random.randint(0, 6, n_samples)
    semester = np.random.choice([5, 6, 7, 8], size=n_samples, p=[0.2, 0.3, 0.3, 0.2])
    branch = np.random.choice(branches, size=n_samples, p=branch_weights)
    communityActivityScore = np.random.randint(0, 100, n_samples)

    # Score synthesis with sensible correlation weights + noise
    total_solved = easySolved * 0.5 + mediumSolved * 2.0 + hardSolved * 5.0
    score = (
        (cgpa - 5.5) * 12.0 +
        (total_solved / 15.0) +
        (contestRating - 1000) * 0.04 +
        projectsCount * 6.0 +
        internshipsCount * 12.0 +
        certifications * 3.0 +
        communityActivityScore * 0.15 +
        np.random.normal(0, 10, n_samples)
    )

    # Placed probability mapping
    prob_placed = 1 / (1 + np.exp(-(score - 65) / 12))
    placed = np.random.binomial(1, prob_placed).astype(bool)

    # Package band calculation
    package_band = []
    for p, s in zip(placed, score):
        if not p:
            package_band.append("none")
        elif s > 95:
            package_band.append("high")
        elif s > 75:
            package_band.append("mid")
        else:
            package_band.append("low")

    df = pd.DataFrame({
        "cgpa": cgpa,
        "easySolved": easySolved,
        "mediumSolved": mediumSolved,
        "hardSolved": hardSolved,
        "contestRating": contestRating,
        "projectsCount": projectsCount,
        "internshipsCount": internshipsCount,
        "certifications": certifications,
        "branch": branch,
        "semester": semester,
        "communityActivityScore": communityActivityScore,
        "placed": placed,
        "packageBand": package_band
    })

    out_dir = os.path.join(os.path.dirname(__file__))
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "placement_data.csv")
    df.to_csv(out_file, index=False)
    print(f"[SUCCESS] Generated {len(df)} synthetic student rows at: {out_file}")
    print(df.head())

if __name__ == "__main__":
    generate_student_dataset()
