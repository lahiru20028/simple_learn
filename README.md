<<<<<<< HEAD
# simple_learn
=======
# Simple Learn Backend

This is the backend server for the Simple Learn application, built with Node.js, Express, and Google Generative AI.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    -   Open the `.env` file.
    -   Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API Key.
    -   (Optional) Change the `PORT` if needed (default is 5000).

3.  **Run the Server:**
    ```bash
    node server.js
    ```

## API Endpoints

### POST /api/chat

Accepts a JSON body with a `question` field and returns an AI-generated answer.

**Request:**
```json
{
  "question": "What is photosynthesis?"
}
```

**Response:**
```json
{
  "answer": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigments..."
}
```
>>>>>>> 128fd9f (Initial commit for Simple Learn - excluding libraries)
