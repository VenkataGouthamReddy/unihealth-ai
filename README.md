# UniHealth AI - Campus Healthcare Management System

A complete full-stack AI-powered campus healthcare management system.

## Project Structure

- `/backend`: Python FastAPI application with MongoDB.
- `/frontend`: React application with Vite and Tailwind CSS.

## Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB (running locally on port 27017 or update `MONGODB_URL` in backend config)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000 and docs at http://localhost:8000/docs.

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:5173.

## Features Implemented So Far (Foundation Phase)
- Project Structure and Boilerplate
- MongoDB Database Connection
- User, Student, Doctor, Appointment Models
- JWT Authentication (Register/Login API endpoints)
- React Router with Protected Routes
- Login & Registration UI with Tailwind CSS
- Student Dashboard Layout

*This project is being developed iteratively. Next phases will implement the Doctor Dashboard, Admin Dashboard, and AI capabilities.*
