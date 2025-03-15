# Twitter Bot Detection

A full-stack application that detects bot accounts on Twitter by analyzing user handles. This project combines a React/Vite frontend, Python backend, and machine learning-based classification.

## 🌟 Features

- **Single User Detection**: Check if a specific Twitter handle belongs to a bot
- **Bulk Detection**: Process multiple Twitter handles via CSV upload
- **User Authentication**: Secure login system for authorized access
- **Prediction Caching**: Store previous predictions for improved performance
- **Responsive UI**: Modern interface built with React and Vite

## 🏗️ Architecture

The project consists of three main components:

1. **Frontend**: React application built with Vite
2. **Backend**: Python API server handling prediction requests
3. **Model Generator**: Python scripts for training the bot detection model

## 🔧 Tech Stack

### Frontend
- React
- Vite
- Axios for API requests
- React Router for navigation

### Backend
- Python
- Flask/FastAPI for REST endpoints
- SQLite for caching predictions and user data

### ML Model
- Scikit-learn for model training and evaluation
- Random Forest Classifier
- Feature engineering for Twitter user data

## 📋 Requirements

- Node.js (v16+)
- Python (v3.8+)
- pip
- npm or yarn

## 🚀 Installation

### Clone the repository
```bash
git clone https://github.com/yourusername/twitter-bot-detection.git
cd twitter-bot-detection
```

### Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python backend/init_db.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```
# Backend configuration
PORT=5000
DATABASE_PATH=./database/predictions.db
MODEL_PATH=./model/bot_classifier.pkl

# Frontend configuration
VITE_API_URL=http://localhost:5000
```

## 🏃‍♂️ Running the Application

### Start the Backend
```bash
# From the root directory
python backend/app.py
```

### Start the Frontend
```bash
# From the frontend directory
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧠 Model Training

The bot detection model uses a Random Forest Classifier with feature engineering:

```bash
# Train the model
python model/train_model.py --data path/to/training_data.csv --output model/bot_classifier.pkl
```

### Features Used
- Account age
- Number of followers
- Following to followers ratio
- Tweet frequency
- Profile completeness
- Tweet sentiment analysis
- Usage patterns

## 🔍 Usage

### Single User Check
1. Navigate to the homepage
2. Enter a Twitter handle in the input field
3. Click "Check User"
4. View the prediction result and confidence score

### Bulk User Check
1. Navigate to the "Bulk Check" page
2. Upload a CSV file with Twitter handles (one per line)
3. Click "Process File"
4. Download the results as a CSV file

## 👥 API Endpoints

- `POST /api/predict-user`: Check a single Twitter handle
- `POST /api/predict-csv`: Process multiple Twitter handles
- `POST /api/login`: User authentication
- `GET /api/prediction-history`: Get cached predictions for the current user

## 🔒 Authentication

The application includes user authentication to protect API endpoints and track user activity:

- Registration and login functionality
- JWT-based authentication
- Role-based access control

## 🧪 Testing

```bash
# Backend tests
pytest backend/tests/

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/twitter-bot-detection](https://github.com/yourusername/twitter-bot-detection)