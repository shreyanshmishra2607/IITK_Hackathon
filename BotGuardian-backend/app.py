from fastapi import FastAPI, File, UploadFile, Form
import pandas as pd
import joblib
import io
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime
import numpy as np
import os
from fastapi import FastAPI
from dotenv import load_dotenv
import uvicorn

load_dotenv()

SECRET_KEY = os.getenv("RAPID_API_KEY1")

app = FastAPI()

# Load the trained model
model = joblib.load("bot_detector.pkl")  # Ensure the model file exists

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def test():
    return {"msg": "This is the test result"}

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

            # Extract values in the specified order
            features = [
                default_profile,
                favourites_count,
                followers_count,
                friends_count,
                geo_enabled,
                statuses_count,
                verified,
                average_tweets_per_day,
                account_age_days
            ]

            # Reshape the features into a 2D array
            features_array = np.array(features).reshape(1, -1)

            # Predict using the model
            prediction_proba = model.predict_proba(features_array)[0]
            bot_probability = prediction_proba[1]  # Probability of bot
            user_probability = prediction_proba[0]  # Probability of User
            return {
                "id": username,
                "bot_probability": float(bot_probability * 100),
                "user_probability": float(user_probability * 100)
            }
        except Exception as e:
            return {"error": f"Error calculating metrics: {str(e)}"}

    except Exception as e:
        return {"error": str(e)}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)