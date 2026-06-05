# PrepWise AI

### Personalized AI-Powered Mock Interview Preparation Platform

## 🌍 The Problem

Many students and job seekers struggle to prepare effectively for technical interviews because traditional interview preparation platforms provide generic questions that are not tailored to a candidate's actual skills, projects, internships, or experience.

At the same time, recruiters and interviewers often focus heavily on resume-based discussions, project explanations, and real-world problem-solving abilities rather than memorized answers.

**PrepWise AI** solves this problem by creating personalized AI-driven mock interviews that analyze uploaded resumes, generate contextual technical questions, evaluate answers intelligently, and provide detailed performance analytics to help users improve their interview readiness.

## ✨ Key Features

### 🔐 Secure Authentication & User Management

* **JWT Authentication:** Secure login and session management using JSON Web Tokens.
* **Protected Routes:** Restrict dashboard and interview access to authenticated users.
* **Password Encryption:** Secure password hashing using bcrypt.

### 📄 AI-Powered Resume Analysis

* **Resume Upload:** Upload resumes in PDF format.
* **Resume Parsing:** Extract skills, projects, internships, achievements, and technologies using pdf-parse.
* **Contextual Understanding:** AI analyzes resume content to generate personalized interview experiences.

### 🤖 Personalized AI Interview Generation

* **Dynamic Question Generation:** Generate technical questions based on:

  * Skills
  * Projects
  * Internships
  * Achievements
  * Selected Role
  * Interview Category

* **Role-Based Interviews:**

  * Frontend Developer
  * Backend Developer
  * Full Stack Developer
  * Software Engineer

* **Interview Categories:**

  * General Interview 
  * DSA
  * HR
  * MERN Stack
  * System Design
  * Java
  * Python
  * Behavioral Interviews

### 🧠 Adaptive AI Follow-Up System

* **Context-Aware Follow-Up Questions:** AI generates intelligent follow-up questions based on previous responses.
* **Project-Focused Discussions:** Simulates realistic recruiter-style questioning on projects and internships.
* **Dynamic Interview Flow:** Adapts interview depth according to candidate responses.

### ⚡ Real-Time Interview Experience

* **Live Interview Sessions:** Real-time question progression using Socket.io.
* **Instant Updates:** Real-time synchronization between frontend and backend.
* **Interactive Interview Flow:** Seamless communication throughout the interview process.

### 📊 Analytics & Performance Dashboard

* **Performance Tracking:**

  * Interview Scores
  * Weak Topics
  * Strong Areas
  * Topic Improvement Trends
  * Total Interviews Completed
* **Interview History:** Track all previous mock interview sessions.
* **Progress Analytics:** Visualize growth and performance over time.

## 💻 Tech Stack

| Layer              | Technology           | Purpose                                      |
| ------------------ | -------------------- | -------------------------------------------- |
| **Frontend**       | React.js             | Component-based frontend development         |
|                    | CSS                  | Custom responsive UI styling                 |
|                    | Axios                | API communication                            |
|                    | React Router         | Client-side routing                          |
| **Backend**        | Node.js / Express.js | Backend server and REST APIs                 |
|                    | MongoDB / Mongoose   | Database and object modeling                 |
|                    | Socket.io            | Real-time interview communication            |
| **Authentication** | JWT                  | Secure authentication                        |
|                    | bcrypt               | Password hashing                             |
| **AI Integration** | Gemini API           | AI-based interview generation and evaluation |
| **File Handling**  | multer               | Resume upload handling                       |
|                    | pdf-parse            | Resume text extraction                       |
| **Dev Tools**      | dotenv               | Environment variable management              |
|                    | Nodemon              | Development server auto restart              |

## 🏗️ System Design Concepts

### 1. Resume-Aware AI Workflow

The system extracts contextual information from uploaded resumes including skills, projects, internships, and achievements. This data is used to dynamically generate highly personalized interview questions instead of static question sets.

### 2. Adaptive AI Interview Engine

The AI interview flow is dynamic. Based on user responses, the system generates contextual follow-up questions to simulate realistic interviewer behavior and deeper technical discussions.

### 3. Real-Time Architecture

Socket.io enables real-time communication for:

* Live question progression
* Instant session updates
* Interactive interview sessions

This creates a smooth and engaging interview experience without requiring page refreshes.

### 4. Modular REST API Architecture

The backend follows a modular RESTful architecture with separate controllers, services, middleware, and routes to improve scalability and maintainability.

### 5. AI-Based Evaluation Pipeline

The Gemini API evaluates user responses based on:

* Technical Correctness
* Communication Clarity
* Explanation Depth
* Problem-Solving Ability
* Confidence

This creates intelligent feedback and analytics.

### 6. Scalable Analytics System

All interview sessions, scores, and evaluations are stored in MongoDB, enabling long-term performance tracking and dashboard analytics.

## 🚀 Easy Setup Instructions

### Prerequisites

* Node.js (v16+)
* MongoDB
* Gemini API Key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PrepWise-AI
```

### 2. Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend server:

   ```bash
   npm run dev
   ```

4. Open your browser:

   ```
   http://localhost:5173
   ```

---

## 🌐 Live Demo

Experience PrepWise AI in action:

🚀 **Demo Link:** https://prep-wise-ai-frontend.vercel.app/

---

*Developed with ❤️ to help students prepare smarter, perform better, and crack technical interviews with confidence.*
