# Bot Detector API

This is a FastAPI-based API service that helps detect whether a Twitter/X account is operated by a bot or a human. The application uses a machine learning model to analyze account attributes and estimate the probability of an account being a bot.

## Features

- Detect bots from Twitter/X usernames
- Process CSV files with account data
- Result caching system to improve performance and reduce API calls
- IP address tracking for monitoring usage patterns
- Admin endpoints for cache and user statistics

## Prerequisites

- Python 3.8+
- RapidAPI Key for Twitter241 API

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bot-detector-api.git
cd bot-detector-api
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root with your RapidAPI key:
```
RAPID_API_KEY1=your_rapidapi_key_here
```

5. Make sure you have the ML model file `bot_detector.pkl` in the project directory.

## Usage

### Running the API

Start the API server:

```bash
python app.py
```

Or using uvicorn directly:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### API Endpoints

- `GET /` - Simple test endpoint
- `POST /predict-user/` - Detect if a Twitter/X username belongs to a bot
- `POST /predict-csv/` - Process multiple accounts via CSV upload
- `GET /cache-stats/` - Get statistics about the cache
- `DELETE /clear-cache/` - Clear the prediction cache
- `GET /user-stats/` - Get statistics about API users
- `GET /user-requests/{ip_address}` - Get request history for a specific IP

### Examples

#### Checking a single username

```bash
curl -X POST "http://localhost:8000/predict-user/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=elonmusk"
```

Response:
```json
{
  "id": "elonmusk",
  "bot_probability": 12.5,
  "user_probability": 87.5,
  "cached": false
}
```

#### Processing a CSV file

Create a CSV file with account data:
```csv
id,default_profile,favourites_count,followers_count,friends_count,geo_enabled,statuses_count,verified,avg_tweets_per_day,account_age_days
123456,1,500,1000,200,0,3000,0,5.2,577
```

Then upload it:
```bash
curl -X POST "http://localhost:8000/predict-csv/" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@accounts.csv"
```

## Database

The application uses SQLite for storage, with two tables:

1. `prediction_cache` - Stores the prediction results for usernames
2. `user_requests` - Logs IP addresses and their request timestamps

The database file (`bot_detector_cache.db`) is created automatically in the project directory when the application starts.

## Cache System

The API caches results for 24 hours (configurable via `CACHE_EXPIRATION`). This:
- Improves response times for repeated queries
- Reduces RapidAPI usage (saving costs)
- Decreases load on the Twitter API

## Rate Limiting and Monitoring

The IP tracking system allows monitoring of usage patterns and can be expanded to implement rate limiting if needed.

## Security Notes

- The API currently allows requests from any origin (`CORS allow_origins=["*"]`).
- For production, consider restricting CORS and implementing authentication.
- Sensitive information (API keys) is stored in environment variables.

## Troubleshooting

- If you get errors about missing modules, ensure all dependencies are installed.
- If the database fails to initialize, check file permissions in the project directory.
- For RapidAPI errors, verify your API key and subscription status.