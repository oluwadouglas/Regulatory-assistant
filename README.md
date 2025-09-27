# Regulatory Report Assistant

A full-stack application for processing and analyzing medical adverse event reports. The application uses natural language processing to extract structured information from unstructured medical reports and provides a user-friendly interface for viewing and analyzing the data.

## Features

- **Report Processing**: Submit unstructured medical reports and extract structured information including:
  - Drug names
  - Adverse events
  - Severity levels
  - Patient outcomes
- **Translation**: Translate outcomes to French or Swahili
- **Analytics Dashboard**: View charts and statistics about reported adverse events
- **Report History**: Browse and search through previously processed reports
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Python 3.8+
- FastAPI
- SQLAlchemy (SQLite)
- spaCy for NLP
- Uvicorn ASGI server

### Frontend
- React 18
- Material-UI (MUI) for UI components
- Recharts for data visualization
- Axios for API requests

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download the spaCy English language model:
   ```bash
   python -m spacy download en_core_web_sm
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 5000
   ```

   The API will be available at `http://localhost:5000`
   API documentation (Swagger UI) will be available at `http://localhost:5000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

- `POST /process-report`: Process a new medical report
- `GET /reports`: Get all processed reports
- `POST /translate`: Translate text to French or Swahili

## Project Structure

```
regulatory-assistant/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── reports.db        # SQLite database (created on first run)
└── frontend/
    ├── public/           # Static files
    ├── src/
    │   ├── App.js        # Main React component
    │   └── ...           # Other React components
    ├── package.json      # Node.js dependencies
    └── ...
```

## Deployment

### Backend

For production deployment, consider using:
- Gunicorn with Uvicorn workers
- Nginx as a reverse proxy
- Environment variables for configuration
- A production-grade database like PostgreSQL

### Frontend

Build the production version:
```bash
cd frontend
npm run build
```

Serve the built files using a static file server like Nginx or deploy to a platform like Vercel or Netlify.

## License

MIT

## Screenshots

![Screenshot 1](screenshots/screenshot1.png)
![Screenshot 2](screenshots/screenshot2.png)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
