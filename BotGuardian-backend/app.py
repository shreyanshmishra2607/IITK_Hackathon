from fastapi import FastAPI, File, UploadFile, Form
import pandas as pd
import joblib
import io
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime
import numpy as np
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from nltk.sentiment import SentimentIntensityAnalyzer
from pathlib import Path
import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

# Download Sentiment Analyzer
nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()

file_name = "test.csv"
file_path = Path(os.getcwd()) / file_name

SECRET_KEY = os.getenv("RAPID_API_KEY1")

app = FastAPI()


data = pd.read_csv(file_path)


# Drop unnecessary columns
drop_columns = [
    "id", "screen_name", "profile_image_url", "profile_background_image_url"
]
data.drop(columns=drop_columns, inplace=True, errors="ignore")

# Convert categorical features
data["verified"] = data["verified"].astype(int)
data["geo_enabled"] = data["geo_enabled"].astype(int)
data["default_profile"] = data["default_profile"].astype(int)
data["default_profile_image"] = data["default_profile_image"].astype(int)

# Process text features
def preprocess_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+', '', text)  # Remove URLs
    text = re.sub(r'[^a-zA-Z ]', '', text)  # Remove special characters
    return text

data["clean_description"] = data["description"].fillna("").apply(preprocess_text)
data["sentiment"] = data["clean_description"].apply(lambda x: sia.polarity_scores(x)['compound'])

# TF-IDF for text-based features
tfidf = TfidfVectorizer(max_features=500, ngram_range=(1,2))
tfidf_features = tfidf.fit_transform(data["clean_description"]).toarray()

# Prepare feature set
feature_columns = [
    "default_profile", "default_profile_image", "favourites_count",
    "followers_count", "friends_count", "geo_enabled", "statuses_count",
    "verified", "average_tweets_per_day", "account_age_days", "sentiment"
]

X = np.hstack((tfidf_features, data[feature_columns].values))
y = data["account_type"].map({"bot": 1, "human": 0}).astype(int)


# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

# Train model
model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)
y_pred_prob = model.predict_proba(X_test)[:, 1]

# Compute Metrics
accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_prob)
report = classification_report(y_test, y_pred, output_dict=True)


# ✅ FastAPI Route for Model Metrics
@app.get("/metrics/")
async def get_model_metrics():    
    
    return {
        "accuracy": accuracy,
        "roc_auc": roc_auc,
        "classification_report": report
    }


# Load the trained model
model = joblib.load("bot_detector.pkl")  # Ensure the model file exists

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict-csv/")
async def predict_user_csv(file: UploadFile = File(...)):
    try:
        results = []
        # Read file as a pandas dataframe
        df_iter = pd.read_csv(io.StringIO((await file.read()).decode("utf-8")), chunksize=1)

        for chunk in df_iter:
            record_id = chunk.iloc[0, 0]  # First column (assumed as ID)
            features = chunk.iloc[0, 1:].values.reshape(1, -1)  # Remaining columns as features
            
            # Predict using the model
            prediction_proba = model.predict_proba(features)[0]
            bot_probability = prediction_proba[1]  # Probability of bot

            # Convert NumPy types to Python native types
            results.append({"id": str(record_id), "bot_probability": float(bot_probability*100)})

        return {"results": results}

    except Exception as e:
        return {"error": str(e)}

@app.post("/predict-user/")
async def predict_user(username: str = Form(None)):
    try:
        url = "https://twitter241.p.rapidapi.com/user"
        if not username:
       	    return {"error": f"username {username}"}

        querystring = {
            "username": username
        }

        headers = {
            "x-rapidapi-key": f"{SECRET_KEY}",
            "x-rapidapi-host": "twitter241.p.rapidapi.com"
        }

        try:
            response = requests.get(url, headers=headers, params=querystring)
            user_data = response.json()["result"]
        except Exception as e:
            return {"error": f"Error fetching user data: {str(e)}"}

        try:
            if "result" in user_data["data"]["user"]:
                user_info = user_data["data"]["user"]["result"]["legacy"]

                favourites_count = user_info["favourites_count"]
                followers_count = user_info["followers_count"]
                friends_count = user_info["friends_count"]
                statuses_count = user_info["statuses_count"]
                verified = user_info["verified"]
                created_at = user_info["created_at"]
                default_profile = int(user_info["default_profile"])
                geo_enabled = int(bool(user_info["location"]))
            else:
                return {"error": "User data not found"}
        except Exception as e:
            return {"error": f"Error parsing user data: {e}"}

        try:
            # Calculate account age in days
            account_created_date = datetime.strptime(created_at, "%a %b %d %H:%M:%S %z %Y")
            account_age_days = (datetime.now(account_created_date.tzinfo) - account_created_date).days

            # Calculate average tweets per day
            average_tweets_per_day = statuses_count / account_age_days if account_age_days > 0 else 0

            ret_data = {
                "default_profile": default_profile,
                "favourites_count": favourites_count,
                "followers_count": followers_count,
                "friends_count": friends_count,
                "geo_enabled": geo_enabled,
                "statuses_count": statuses_count,
                "verified": verified,
                "average_tweets_per_day": average_tweets_per_day,
                "account_age_days": account_age_days
            }

            # Extract values in the specified order
            features = [
                ret_data["default_profile"],
                ret_data["favourites_count"],
                ret_data["followers_count"],
                ret_data["friends_count"],
                ret_data["geo_enabled"],
                ret_data["statuses_count"],
                ret_data["verified"],
                ret_data["average_tweets_per_day"],
                ret_data["account_age_days"]
            ]

            # Reshape the features into a 2D array
            features_array = np.array(features).reshape(1, -1)

            # Predict using the model
            prediction_proba = model.predict_proba(features_array)[0]
            bot_probability = prediction_proba[1]  # Probability of bot
            return {
                "id": username,
                "bot_probability": float(bot_probability * 100),
            }
        except Exception as e:
            return {"error": f"Error calculating metrics: {str(e)}"}

    except Exception as e:
        return {"error": str(e)}

