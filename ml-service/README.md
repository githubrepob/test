# 🚀 UNIVERSE ML & NLP Microservice

This microservice provides machine learning prediction capabilities for student placement readiness and natural language processing (NLP) features like text embeddings, semantic search, and duplicate issue detection.

---

## 🛠️ Requirements & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Generate Synthetic Dataset
Generates 3,500 realistic student records (`data/placement_data.csv`):
```bash
python data/generate_synthetic_data.py
```

### 3. Train Model
Trains Logistic Regression & Random Forest classifiers, evaluates accuracy/F1 metrics, and saves the best model to `models/placement_model.pkl`:
```bash
python train_model.py
```

### 4. Run Microservice
Start the FastAPI server on port `8001`:
```bash
uvicorn app:app --port 8001 --reload
```

---

## 📡 API Endpoints

- **`POST /predict/placement`**: Calculates placement probability %, package band (`Low`/`Mid`/`High`), and top 3 key factors based on student metrics.
- **`POST /embed`**: Generates 384-dimensional text embeddings using `sentence-transformers/all-MiniLM-L6-v2`.
- **`POST /semantic-search`**: Ranks notes/documents by cosine similarity to a search query.
- **`POST /duplicate-check`**: Checks new issue titles/descriptions against existing issues to prevent near-duplicate posts.
