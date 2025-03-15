from fastapi import FastAPI, File, UploadFile, Form, Request
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
import sqlite3  # This is already part of Python's standard library
from sqlite3 import Error
import time
import json

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

# Cache expiration time in seconds (1 day = 86400 seconds)
CACHE_EXPIRATION = 86400

# Database setup
def create_connection():
    try:
        conn = sqlite3.connect("bot_detector_cache.db")
        return conn
    except Error as e:
        print(f"Database connection error: {e}")
        return None

def setup_database():
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            
            # Create prediction cache table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS prediction_cache (
                    username TEXT PRIMARY KEY,
                    bot_probability REAL NOT NULL,
                    user_probability REAL NOT NULL,
                    timestamp INTEGER NOT NULL
                )
            ''')
            
            # Create user request log table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ip_address TEXT NOT NULL,
                    request_timestamps TEXT NOT NULL,
                    last_request INTEGER NOT NULL,
                    total_requests INTEGER NOT NULL
                )
            ''')
            
            conn.commit()
            print("Database initialized successfully")
        except Error as e:
            print(f"Database setup error: {e}")
        finally:
            conn.close()
    else:
        print("Error! Cannot create the database connection.")

# Call setup on startup
setup_database()

def get_cached_result(username):
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT username, bot_probability, user_probability, timestamp FROM prediction_cache WHERE username = ?",
                (username,)
            )
            result = cursor.fetchone()
            conn.close()
            
            if result:
                # Check if cache is still valid
                current_time = int(time.time())
                if current_time - result[3] <= CACHE_EXPIRATION:
                    return {
                        "id": result[0],
                        "bot_probability": result[1],
                        "user_probability": result[2],
                        "cached": True
                    }
        except Error as e:
            print(f"Cache fetch error: {e}")
            conn.close()
    return None

def cache_result(username, bot_probability, user_probability):
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            current_time = int(time.time())
            cursor.execute(
                "INSERT OR REPLACE INTO prediction_cache (username, bot_probability, user_probability, timestamp) VALUES (?, ?, ?, ?)",
                (username, bot_probability, user_probability, current_time)
            )
            conn.commit()
            conn.close()
        except Error as e:
            print(f"Cache store error: {e}")
            conn.close()

def log_user_request(ip_address):
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            current_time = int(time.time())
            
            # Check if this IP already exists
            cursor.execute(
                "SELECT request_timestamps, total_requests FROM user_requests WHERE ip_address = ?",
                (ip_address,)
            )
            result = cursor.fetchone()
            
            if result:
                # Update existing record
                timestamps = json.loads(result[0])
                # Append new timestamp, keeping the last 100 timestamps
                timestamps.append(current_time)
                if len(timestamps) > 100:
                    timestamps = timestamps[-100:]
                
                total_requests = result[1] + 1
                
                cursor.execute(
                    "UPDATE user_requests SET request_timestamps = ?, last_request = ?, total_requests = ? WHERE ip_address = ?",
                    (json.dumps(timestamps), current_time, total_requests, ip_address)
                )
            else:
                # Create new record
                timestamps = [current_time]
                cursor.execute(
                    "INSERT INTO user_requests (ip_address, request_timestamps, last_request, total_requests) VALUES (?, ?, ?, ?)",
                    (ip_address, json.dumps(timestamps), current_time, 1)
                )
            
            conn.commit()
            conn.close()
        except Error as e:
            print(f"User request log error: {str(e)}")
            conn.close()

@app.get("/")
async def test():
    return {"msg": "This is the test result"}

@app.post("/predict-csv/")
async def predict_user_csv(request: Request, file: UploadFile = File(...)):
    # Log the request
    client_ip = request.client.host
    log_user_request(client_ip)
    
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
async def predict_user(request: Request, username: str = Form(None)):
    # Log the request
    client_ip = request.client.host
    log_user_request(client_ip)
    
    try:
        if not username:
            return {"error": f"username {username}"}
            
        # Check cache first
        cached_result = get_cached_result(username)
        if cached_result:
            return cached_result
            
        url = "https://twitter241.p.rapidapi.com/user"
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
            
            # Store result in cache
            cache_result(username, float(bot_probability * 100), float(user_probability * 100))
            
            return {
                "id": username,
                "bot_probability": float(bot_probability * 100),
                "user_probability": float(user_probability * 100),
                "cached": False
            }
        except Exception as e:
            return {"error": f"Error in model: {str(e)}"}

    except Exception as e:
        return {"error": str(e)}

@app.get("/cache-stats/")
async def get_cache_stats(request: Request):
    # Log the request
    client_ip = request.client.host
    log_user_request(client_ip)
    
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            # Count total entries
            cursor.execute("SELECT COUNT(*) FROM prediction_cache")
            total_entries = cursor.fetchone()[0]
            
            # Get most recent entries
            cursor.execute(
                "SELECT username, bot_probability, user_probability, timestamp FROM prediction_cache ORDER BY timestamp DESC LIMIT 10"
            )
            recent_entries = [
                {
                    "username": row[0],
                    "bot_probability": row[1],
                    "user_probability": row[2],
                    "cached_at": datetime.fromtimestamp(row[3]).strftime('%Y-%m-%d %H:%M:%S')
                }
                for row in cursor.fetchall()
            ]
            
            conn.close()
            return {
                "total_cached_entries": total_entries,
                "recent_entries": recent_entries
            }
        except Error as e:
            conn.close()
            return {"error": f"Database error: {str(e)}"}
    return {"error": "Database connection failed"}

@app.delete("/clear-cache/")
async def clear_cache(request: Request):
    # Log the request
    client_ip = request.client.host
    log_user_request(client_ip)
    
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM prediction_cache")
            conn.commit()
            count = cursor.rowcount
            conn.close()
            return {"message": f"Cache cleared. {count} entries removed."}
        except Error as e:
            conn.close()
            return {"error": f"Failed to clear cache: {str(e)}"}
    return {"error": "Database connection failed"}

@app.get("/user-stats/")
async def get_user_stats(request: Request):
    # Log the request
    client_ip = request.client.host
    log_user_request(client_ip)
    
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            # Count total unique users
            cursor.execute("SELECT COUNT(*) FROM user_requests")
            total_users = cursor.fetchone()[0]
            
            # Get most active users
            cursor.execute(
                "SELECT ip_address, total_requests, last_request FROM user_requests ORDER BY total_requests DESC LIMIT 10"
            )
            most_active_users = [
                {
                    "ip_address": row[0],
                    "total_requests": row[1],
                    "last_request": datetime.fromtimestamp(row[2]).strftime('%Y-%m-%d %H:%M:%S')
                }
                for row in cursor.fetchall()
            ]
            
            # Get most recent users
            cursor.execute(
                "SELECT ip_address, total_requests, last_request FROM user_requests ORDER BY last_request DESC LIMIT 10"
            )
            recent_users = [
                {
                    "ip_address": row[0],
                    "total_requests": row[1],
                    "last_request": datetime.fromtimestamp(row[2]).strftime('%Y-%m-%d %H:%M:%S')
                }
                for row in cursor.fetchall()
            ]
            
            conn.close()
            return {
                "total_unique_users": total_users,
                "most_active_users": most_active_users,
                "recent_users": recent_users
            }
        except Error as e:
            conn.close()
            return {"error": f"Database error: {str(e)}"}
    return {"error": "Database connection failed"}

@app.get("/user-requests/{ip_address}")
async def get_user_request_history(request: Request, ip_address: str):
    # Log the request
    client_ip = request.client.host
    log_user_request(client_ip)
    
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT request_timestamps, total_requests FROM user_requests WHERE ip_address = ?",
                (ip_address,)
            )
            result = cursor.fetchone()
            
            if result:
                timestamps = json.loads(result[0])
                formatted_timestamps = [datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S') for ts in timestamps]
                
                return {
                    "ip_address": ip_address,
                    "total_requests": result[1],
                    "request_timestamps": formatted_timestamps,
                    "timestamp_count": len(timestamps)
                }
            else:
                return {"error": f"No request history found for IP: {ip_address}"}
            
        except Error as e:
            conn.close()
            return {"error": f"Database error: {str(e)}"}
    return {"error": "Database connection failed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)