import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useInterview from "../../hooks/useInterview";
import {
  TargetIcon, StarIcon, TrophyIcon, MessageSquareIcon,
  MicIcon, FileTextIcon, BarChartIcon, ClipboardIcon,
  CheckCircleIcon, AlertCircleIcon, CodeIcon, LayersIcon,
  ServerIcon, UsersIcon, CpuIcon, SparklesIcon, PlayIcon,
} from "../../components/Common/Icons";
import "./Dashboard.css";

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card card">
    <div className="stat-card-icon" style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div className="stat-card-info">
      <span className="stat-card-value">{value}</span>
      <span className="stat-card-label">{label}</span>
      {sub && <span className="stat-card-sub">{sub}</span>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { getAnalytics } = useInterview();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data.analytics);
      } catch {
        // fall back to user stats
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = {
    totalInterviews: analytics?.totalInterviews ?? user?.stats?.totalInterviews ?? 0,
    averageScore: analytics?.averageScore ?? user?.stats?.averageScore ?? 0,
    bestScore: analytics?.bestScore ?? user?.stats?.bestScore ?? 0,
    totalQuestions: analytics?.totalQuestions ?? user?.stats?.totalQuestions ?? 0,
  };

  const getScoreColor = (score) => {
    if (score >= 7) return "var(--success)";
    if (score >= 5) return "var(--warning)";
    return "var(--error)";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const categories = [
    { id: "general",       label: "General Interview", icon: <TargetIcon size={18} />,       desc: "Skills, Projects & Achievements" },
    { id: "dsa",           label: "DSA Interview",     icon: <CodeIcon size={18} />,          desc: "Data Structures & Algorithms" },
    { id: "mern",          label: "MERN Stack",        icon: <LayersIcon size={18} />,        desc: "MongoDB, Express, React, Node" },
    { id: "system-design", label: "System Design",     icon: <ServerIcon size={18} />,        desc: "Architecture & Scalability" },
    { id: "hr",            label: "HR Interview",      icon: <UsersIcon size={18} />,         desc: "Soft Skills & Culture Fit" },
    { id: "java",          label: "Java Technical",    icon: <CpuIcon size={18} />,           desc: "Core Java & Frameworks" },
    { id: "python",        label: "Python Technical",  icon: <CpuIcon size={18} />,           desc: "Python & Libraries" },
    { id: "behavioral",    label: "Behavioral",        icon: <MessageSquareIcon size={18} />, desc: "Situational Questions" },
    { id: "role-based",    label: "Role-Based",        icon: <SparklesIcon size={18} />,      desc: "Frontend/Backend/Fullstack" },
  ];

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {getGreeting()}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="dashboard-subtitle">
            {stats.totalInterviews === 0
              ? "Ready to start your interview prep journey?"
              : `You've completed ${stats.totalInterviews} interview${stats.totalInterviews !== 1 ? "s" : ""}. Keep it up!`}
          </p>
        </div>
        <Link to="/interview/setup" className="btn btn-primary">
          <PlayIcon size={14} />
          Start Interview
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<TargetIcon size={20} />}
          label="Total Interviews"
          value={stats.totalInterviews}
          color="var(--accent-primary)"
          sub="All time"
        />
        <StatCard
          icon={<StarIcon size={20} />}
          label="Average Score"
          value={`${stats.averageScore}/10`}
          color={getScoreColor(stats.averageScore)}
          sub="Overall performance"
        />
        <StatCard
          icon={<TrophyIcon size={20} />}
          label="Best Score"
          value={`${stats.bestScore}/10`}
          color="var(--warning)"
          sub="Personal best"
        />
        <StatCard
          icon={<MessageSquareIcon size={20} />}
          label="Questions Answered"
          value={stats.totalQuestions}
          color="var(--accent-secondary)"
          sub="Total practice"
        />
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/interview/setup" className="quick-action-card">
              <div className="qa-icon" style={{ background: "rgba(99,102,241,0.12)", color: "var(--accent-primary)" }}>
                <MicIcon size={20} />
              </div>
              <div>
                <h3>Start Mock Interview</h3>
                <p>Practice with AI-generated questions</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>

            <Link to="/upload-resume" className="quick-action-card">
              <div className="qa-icon" style={{ background: "rgba(59,130,246,0.12)", color: "var(--accent-secondary)" }}>
                <FileTextIcon size={20} />
              </div>
              <div>
                <h3>{user?.hasResume ? "Update Resume" : "Upload Resume"}</h3>
                <p>{user?.hasResume ? "Replace your current resume" : "Upload PDF to get started"}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>

            <Link to="/analytics" className="quick-action-card">
              <div className="qa-icon" style={{ background: "rgba(34,197,94,0.12)", color: "var(--success)" }}>
                <BarChartIcon size={20} />
              </div>
              <div>
                <h3>View Analytics</h3>
                <p>Track your performance trends</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>

            <Link to="/history" className="quick-action-card">
              <div className="qa-icon" style={{ background: "rgba(245,158,11,0.12)", color: "var(--warning)" }}>
                <ClipboardIcon size={20} />
              </div>
              <div>
                <h3>Interview History</h3>
                <p>Review past interview sessions</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Resume Status */}
          <div className="card resume-status-card">
            <h2 className="section-title">Resume Status</h2>
            {user?.hasResume ? (
              <div className="resume-ready">
                <CheckCircleIcon size={22} style={{ color: "var(--success)", flexShrink: 0 }} />
                <div>
                  <h3>Resume Uploaded</h3>
                  <p>Your resume is analyzed and ready for personalized questions</p>
                </div>
                <Link to="/upload-resume" className="btn btn-outline btn-sm">Update</Link>
              </div>
            ) : (
              <div className="resume-missing">
                <AlertCircleIcon size={36} style={{ color: "var(--warning)", opacity: 0.6 }} />
                <h3>No Resume Uploaded</h3>
                <p>Upload your resume to get personalized interview questions based on your experience</p>
                <Link to="/upload-resume" className="btn btn-primary btn-sm">Upload Resume</Link>
              </div>
            )}
          </div>

          {/* Recent Interviews */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: "16px" }}>
              <h2 className="section-title" style={{ margin: 0 }}>Recent Interviews</h2>
              <Link to="/history" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {loading ? (
              <div className="flex-center" style={{ padding: "32px" }}>
                <div className="spinner spinner-lg"></div>
              </div>
            ) : analytics?.recentInterviews?.length > 0 ? (
              <div className="recent-list">
                {analytics.recentInterviews.map((interview, i) => (
                  <div key={i} className="recent-item">
                    <div className="recent-item-info">
                      <span className="recent-category">{(interview.category || "general").toUpperCase()}</span>
                      <span className="recent-date">{new Date(interview.date).toLocaleDateString()}</span>
                    </div>
                    <div className="recent-score" style={{ color: getScoreColor(interview.score) }}>
                      {interview.score.toFixed(1)}/10
                    </div>
                    <span className={`badge badge-${interview.score >= 7 ? "success" : interview.score >= 5 ? "warning" : "error"}`}>
                      {interview.grade}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "32px" }}>
                <TargetIcon size={40} style={{ opacity: 0.2, color: "var(--text-muted)" }} />
                <h3>No interviews yet</h3>
                <p>Start your first mock interview to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview Categories */}
      <div className="card categories-card">
        <h2 className="section-title">Interview Categories</h2>
        <div className="categories-list">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/interview/setup?category=${cat.id}`} className="category-item">
              <span className="category-item-icon">{cat.icon}</span>
              <div>
                <span className="category-item-label">{cat.label}</span>
                <span className="category-item-desc">{cat.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
