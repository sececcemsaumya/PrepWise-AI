import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useInterview from "../../hooks/useInterview";
import "./InterviewSetup.css";

const categories = [
  { id: "general",       label: "General Interview", icon: "🎯", desc: "Skills, Projects, Internships & Achievements" },
  { id: "dsa",           label: "DSA Interview",     icon: "🔢", desc: "Data Structures & Algorithms" },
  { id: "mern",          label: "MERN Stack",        icon: "⚛️", desc: "MongoDB, Express, React, Node.js" },
  { id: "system-design", label: "System Design",     icon: "🏗️", desc: "Architecture & Scalability" },
  { id: "hr",            label: "HR Interview",      icon: "🤝", desc: "Soft Skills & Culture Fit" },
  { id: "java",          label: "Java Technical",    icon: "☕", desc: "Core Java & Frameworks" },
  { id: "python",        label: "Python Technical",  icon: "🐍", desc: "Python & Libraries" },
  { id: "behavioral",    label: "Behavioral",        icon: "💬", desc: "Situational Questions" },
  { id: "role-based",    label: "Role-Based",        icon: "👨‍💻", desc: "Frontend/Backend/Fullstack" },
];

const roles = [
  { id: "general",          label: "General" },
  { id: "frontend",         label: "Frontend Developer" },
  { id: "backend",          label: "Backend Developer" },
  { id: "fullstack",        label: "Full-Stack Developer" },
  { id: "software-engineer",label: "Software Engineer" },
];

const difficulties = [
  { id: "beginner",     label: "Beginner",     desc: "Fundamental concepts", color: "var(--success)" },
  { id: "intermediate", label: "Intermediate", desc: "Practical knowledge",  color: "var(--warning)" },
  { id: "advanced",     label: "Advanced",     desc: "Expert-level depth",   color: "var(--error)" },
];

/* ── Loading overlay shown while Gemini generates the first question ─────── */
const StartingOverlay = ({ category, role, difficulty }) => {
  const cat = categories.find((c) => c.id === category);

  const categoryMessages = {
    dsa: "Preparing algorithm and data structure questions tailored to your experience...",
    mern: "Crafting MERN stack questions based on your projects and skills...",
    "system-design": "Designing system design scenarios relevant to your background...",
    hr: "Preparing behavioral questions based on your experience...",
    java: "Generating Java technical questions matched to your skill level...",
    python: "Creating Python questions tailored to your projects...",
    behavioral: "Crafting situational questions based on your background...",
    "role-based": "Preparing role-specific questions for your target position...",
    general: "Analyzing your resume and crafting personalized questions...",
  };

  const message = categoryMessages[category] || categoryMessages.general;

  return (
    <div className="starting-overlay">
      <div className="starting-card">
        <div className="starting-logo">
          <div className="starting-avatar">A</div>
        </div>
        <h2>Preparing Your {cat?.label}</h2>
        <p>{message}</p>

        <div className="starting-steps">
          <div className="starting-step done">
            <div className="step-dot" />
            <span>Analyzing your resume</span>
          </div>
          <div className="starting-step active">
            <div className="step-dot" />
            <span>Generating {cat?.label} questions</span>
          </div>
          <div className="starting-step">
            <div className="step-dot" />
            <span>Setting up interview session</span>
          </div>
        </div>

        <div className="starting-meta">
          <span className="starting-badge">{cat?.label}</span>
          <span className="starting-badge">{difficulty}</span>
          <span className="starting-badge">{role}</span>
        </div>

        <div className="starting-bar">
          <div className="starting-bar-fill" />
        </div>
        <p className="starting-hint">This usually takes 5–10 seconds</p>
      </div>
    </div>
  );
};

const InterviewSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startInterview, error } = useInterview();

  const [config, setConfig] = useState({
    category: searchParams.get("category") || "",
    role: "general",
    difficulty: "intermediate",
    totalQuestions: 10,
  });
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const handleStart = async () => {
    if (!user?.hasResume) { navigate("/upload-resume"); return; }
    if (!config.category) return;

    setStarting(true);
    setStartError("");
    try {
      const data = await startInterview(config);
      navigate(`/interview/session/${data.interview.sessionId}`);
    } catch (err) {
      setStartError(err.response?.data?.message || "Failed to start interview. Please try again.");
      setStarting(false);
    }
  };

  // Show full-screen overlay while generating
  if (starting) {
    return <StartingOverlay category={config.category} role={config.role} difficulty={config.difficulty} />;
  }

  return (
    <div className="interview-setup fade-in">
      <div className="setup-header">
        <h1>Configure Your Interview</h1>
        <p>Customize your mock interview session to match your preparation goals</p>
      </div>

      {!user?.hasResume && (
        <div className="alert alert-warning" style={{ marginBottom: "24px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Please upload your resume first.{" "}
          <a href="/upload-resume" style={{ color: "var(--warning)", fontWeight: 600 }}>Upload Resume →</a>
        </div>
      )}

      <div className="setup-layout">
        <div className="setup-main">

          {/* Category */}
          <div className="setup-section card">
            <h2><span>1</span> Interview Category</h2>
            <p className="setup-section-desc">Choose the type of interview you want to practice</p>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${config.category === cat.id ? "selected" : ""}`}
                  onClick={() => setConfig((p) => ({ ...p, category: cat.id }))}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <div>
                    <span className="cat-label">{cat.label}</span>
                    <span className="cat-desc">{cat.desc}</span>
                  </div>
                  {config.category === cat.id && <span className="cat-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div className="setup-section card">
            <h2><span>2</span> Target Role</h2>
            <p className="setup-section-desc">Select the role you're interviewing for</p>
            <div className="role-grid">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={`role-btn ${config.role === role.id ? "selected" : ""}`}
                  onClick={() => setConfig((p) => ({ ...p, role: role.id }))}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="setup-section card">
            <h2><span>3</span> Difficulty Level</h2>
            <p className="setup-section-desc">Choose the complexity of questions</p>
            <div className="difficulty-grid">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  className={`difficulty-btn ${config.difficulty === diff.id ? "selected" : ""}`}
                  style={{ "--diff-color": diff.color }}
                  onClick={() => setConfig((p) => ({ ...p, difficulty: diff.id }))}
                >
                  <span className="diff-label">{diff.label}</span>
                  <span className="diff-desc">{diff.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* All interviews are adaptive — show info card */}
          <div className="setup-section card adaptive-info-card">
            <h2><span>4</span> Interview Mode</h2>
            <div className="adaptive-badge">
              <span className="adaptive-icon" style={{ fontSize: "20px" }}>⚡</span>
              <div>
                <h3>Adaptive Unlimited Mode</h3>
                <p>All interviews are adaptive — questions are generated dynamically based on your resume, previous answers, and performance. The interview continues until you choose to end it. Each question builds on what you said before.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary panel */}
        <div className="setup-summary">
          <div className="card summary-card">
            <h2>Interview Summary</h2>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Category</span>
                <span className="summary-value">
                  {config.category ? categories.find((c) => c.id === config.category)?.label : "Not selected"}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Role</span>
                <span className="summary-value">{roles.find((r) => r.id === config.role)?.label}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Difficulty</span>
                <span className="summary-value" style={{ textTransform: "capitalize" }}>{config.difficulty}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Questions</span>
                <span className="summary-value">Unlimited (Adaptive)</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Est. Duration</span>
                <span className="summary-value">Until you end</span>
              </div>
            </div>

            {(startError || error) && (
              <div className="alert alert-error" style={{ marginBottom: "16px" }}>
                {startError || error}
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleStart}
              disabled={!config.category}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Start Interview
            </button>

            {!config.category && (
              <p className="summary-hint">Please select a category to continue</p>
            )}
          </div>

          <div className="card resume-check">
            <div className="resume-check-icon">{user?.hasResume ? "✅" : "⚠️"}</div>
            <div>
              <h3>{user?.hasResume ? "Resume Ready" : "No Resume"}</h3>
              <p>{user?.hasResume ? "Questions will be personalized to your resume" : "Upload resume for personalized questions"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
