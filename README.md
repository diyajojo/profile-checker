# Profile Checker

Profile Checker is a full-stack application that analyzes user profile photos for privacy, security, and PII (Personally Identifiable Information) risks. It leverages Google Cloud Vision API, Gemini AI, and custom metadata analysis to provide comprehensive insights into images uploaded by users.

## Features

- **Image Analysis**: Uses Google Vision API to detect landmarks, logos, web entities, and extract text from uploaded images.
- **AI-Powered Summaries**: Integrates Gemini Agent to provide AI-generated summaries of vulnerabilities found within the image, including text content and web matches.
- **PII Detection**: Analyzes image metadata and content for potential privacy and PII risks.
- **User Authentication**: Supports Google OAuth authentication via Supabase.
- **Profile and Matching System**: Allows users to create, edit, and manage profile information and photos. Includes dashboard views for browsing users and matches.
- **Dashboard**: Displays user profiles, matches, and individual analysis results.
- **Storage**: Securely stores profile photos using Supabase storage buckets.
- **Admin & User Views**: Supports different dashboard sections for users and their matches.

## How It Works

1. **Sign In**: Users sign in via Google authentication.
2. **Profile Creation**: Users fill in profile information and upload a profile photo.
3. **Image Analysis**: When a photo is uploaded, the backend:
   - Runs Google Vision analysis (landmarks, logos, web entities, text).
   - Extracts text and submits it to Gemini Agent for vulnerability summarization.
   - Analyzes image metadata for PII risks.
   - Aggregates and summarizes vulnerabilities, sources, and domains associated with the image.
4. **Results**: Users can view detailed analysis and privacy summaries for their profile photo.
5. **Matching & Browsing**: Users can browse other profiles and see potential matches, with privacy and security analysis available for each.

## Tech Stack

- **Frontend**: Next.js (React, TypeScript), Supabase client
- **Backend**: FastAPI (Python), Google Cloud Vision, Gemini AI
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth (Google OAuth)
- **Other**: Streamlit (for rapid prototyping and internal tools), dotenv for environment variable management

## Directory Structure

```
client/                 # Next.js frontend app
  app/
    dashboard/          # User dashboard (profiles, matches, etc)
    auth/               # Authentication components
    pfpcreate/          # Profile creation components
server/                 # Python backend (FastAPI)
  app/
    services/           # Core backend services (image analysis, AI agent, metadata analysis)
    routers/            # API routes
  trial/                # Prototyping and experiments (Streamlit, GVision test)
```

## Setup & Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/mehrinshamim/profile-checker.git
   cd profile-checker
   ```

2. **Set up environment variables**:

   - Create a `.env` file in `server/` and add your Google Vision API credentials, Gemini API key, and Serp API key.
   - Configure Supabase project and add corresponding keys to the frontend as needed.

3. **Install backend dependencies**:

   ```bash
   cd server
   pip install -r requirements.txt
   ```

4. **Install frontend dependencies**:

   ```bash
   cd ../client
   npm install
   ```

5. **Run the backend server**:

   ```bash
   cd ../server
   uvicorn app.main:app --reload
   ```

6. **Run the frontend app**:

   ```bash
   cd ../client
   npm run dev
   ```

7. **Optional (Streamlit prototyping)**:

   ```bash
   cd ../server/trial
   streamlit run gvision.py
   ```

## API Endpoints

- `GET /` – Welcome endpoint
- `GET /health` – Health check
- `POST /analyze-image` – Analyze a user's profile photo (aggregates Google Vision, Gemini, and metadata/PII analysis)

## Example Use Case

1. User signs up and uploads a photo.
2. The backend analyzes the image for visible and hidden privacy risks.
3. The results are displayed on the dashboard, helping users understand and mitigate privacy issues before using the photo on public platforms.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Cloud Vision API](https://cloud.google.com/vision)
- [Supabase](https://supabase.io/)
- [Gemini AI](https://ai.google.dev/gemini)