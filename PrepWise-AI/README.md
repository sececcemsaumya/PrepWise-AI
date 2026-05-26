# PrepWise AI
### Personalized AI-Powered Mock Interview Preparation Platform

---

## 🌍 The Problem

Many students and job seekers struggle to prepare effectively for technical interviews because traditional interview preparation platforms provide generic questions that are not tailored to a candidate's actual skills, projects, internships, or experience.

At the same time, recruiters and interviewers often focus heavily on resume-based discussions, project explanations, and real-world problem-solving abilities rather than memorized answers.

**PrepWise AI** solves this problem by creating personalized AI-driven mock interviews that analyze uploaded resumes, generate contextual technical questions, evaluate answers intelligently, and provide detailed performance analytics to help users improve their interview readiness.

---

## ✨ Key Features

### 🔐 Secure Authentication & User Management
- **JWT Authentication:** Secure login and session management using JSON Web Tokens.
- **Protected Routes:** Restrict dashboard and interview access to authenticated users.
- **Password Encryption:** Secure password hashing using bcrypt.

### 📄 AI-Powered Resume Analysis
- **Resume Upload:** Upload resumes in PDF format.
- **Resume Parsing:** Extract skills, projects, internships, achievements, and technologies using pdf-parse.
- **Contextual Understanding:** AI analyzes resume content to generate personalized interview experiences.

### 🤖 Personalized AI Interview Generation
- **Dynamic Question Generation:** Generate technical questions based on:
  - Skills
  - Projects
  - Internships
  - Achievements
  - Selected role
  - Interview category

- **Role-Based Interviews:**
  - Frontend Developer
  - Backend Developer
  - Full Stack Developer
  - Software Engineer

- **Interview Categories:**
  - General Interview *(Adaptive & Unlimited)*
  - DSA
  - HR
  - MERN Stack
  - System Design
  - Java
  - Python
  - Behavioral Interviews

### 🧠 Adaptive AI Follow-Up System
- **Context-Aware Follow-Up Questions:** AI generates intelligent follow-up questions based on previous responses.
- **Project-Focused Discussions:** Simulates realistic recruiter-style questioning on projects and internships.

### ⚡ Real-Time Interview Experience
- **Live Interview Sessions:** Real-time question progression using Socket.io.
- **Interview Timer:** Timed interview rounds for realistic simulation.
- **Instant Updates:** Real-time synchronization between frontend and backend.

### 📊 Analytics & Performance Dashboard
- **Performance Tracking:**
  - Interview scores
  - Weak topics
  - Strong areas
  - Topic improvement trends
  - Total interviews completed
- **Interview History:** Track all previous mock interview sessions.
- **Progress Analytics:** Visualize growth and performance over time.

### 🚀 Performance Optimization with Redis
- **Caching:** Cache frequently generated interview questions for faster response times.
- **Session Management:** Store temporary interview session data efficiently.
- **Improved Scalability:** Reduce repeated AI API calls and optimize backend performance.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Component-based frontend development |
| Frontend | CSS | Custom responsive UI styling |
| Frontend | Axios | API communication |
| Frontend | React Router | Client-side routing |
| Backend | Node.js / Express.js | Backend server and REST APIs |
| Database | MongoDB / Mongoose | Database and object modeling |
| Cache | Redis | Caching and temporary session storage |
| Real-Time | Socket.io | Real-time interview communication |
| Auth | JWT | Secure authentication |
| Auth | bcrypt | Password hashing |
| AI Integration | Gemini API | AI-based interview generation and evaluation |
| File Handling | multer | Resume upload handling |
| File Handling | pdf-parse | Resume text extraction |
| Dev Tools | dotenv | Environment variable management |
| Dev Tools | Nodemon | Development server auto restart |

---

## 🏗️ System Design Concepts

### 1. Resume-Aware AI Workflow
The system extracts contextual information from uploaded resumes including skills, projects, internships, and achievements. This data is used to dynamically generate highly personalized interview questions instead of static question sets.

### 2. Adaptive AI Interview Engine
The AI interview flow is dynamic. Based on user responses, the system generates contextual follow-up questions to simulate realistic interviewer behavior and deeper technical discussions.

### 3. Real-Time Architecture
Socket.io enables real-time communication for:
- Interview timers
- Live question progression
- Instant session updates

This creates a smooth and interactive interview experience.

### 4. Redis-Based Performance Optimization
Redis is used to cache generated interview questions and temporary session data. This reduces repeated AI requests and improves overall backend responsiveness.

### 5. Modular REST API Architecture
The backend follows a modular RESTful architecture with separate controllers, services, middleware, and routes to improve scalability and maintainability.

### 6. AI-Based Evaluation Pipeline
The Gemini API evaluates user responses based on:
- Technical correctness
- Clarity
- Communication quality
- Explanation depth
- Confidence

This creates intelligent feedback and analytics.

### 7. Scalable Analytics System
All interview sessions, scores, and evaluations are stored in MongoDB, enabling long-term performance tracking and dashboard analytics.

---

## 🚀 Easy Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB
- Redis
- Gemini API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd PrepWise-AI
```

### 2. Backend Setup

Navigate to backend folder:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=your_redis_url
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start backend server:
```bash
npm run dev
```

### 3. Frontend Setup

Navigate to frontend folder:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Start frontend server:
```bash
npm run dev
```

Open your browser at **http://localhost:5173**

---

## � Folder Structure

```
PrepWise-AI/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar/
│       │   ├── Sidebar/
│       │   └── Common/
│       ├── pages/
│       │   ├── Home/
│       │   ├── Login/
│       │   ├── Signup/
│       │   ├── Dashboard/
│       │   ├── UploadResume/
│       │   ├── InterviewSession/
│       │   ├── InterviewResult/
│       │   └── Profile/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       ├── routes/
│       ├── utils/
│       └── styles/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── sockets/
│       └── utils/
├── README.md
└── package.json
```

---

## � Future Enhancements

- Voice-based interview support
- AI emotion and confidence analysis
- Video interview simulation
- Multi-language interview support
- Integrated coding interview editor
- AI-generated learning roadmap
- Advanced recruiter analytics

---

## 👨‍💻 Author

**Developed by Saumya M**

Built with ❤️ to help students prepare smarter, perform better, and crack interviews with confidence.
