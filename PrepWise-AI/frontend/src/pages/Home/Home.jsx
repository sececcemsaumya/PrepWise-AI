import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Common/Logo";
import {
  FileTextIcon, SparklesIcon, BarChartIcon, ZapIcon,
  TargetIcon, CodeIcon, LayersIcon, UsersIcon,
  CpuIcon, ServerIcon, MessageSquareIcon, ArrowRightIcon,
  CheckCircleIcon,
} from "../../components/Common/Icons";
import "./Home.css";

/* ── Typing animation hook ──────────────────────────────────────────────── */
const useTypingEffect = (words, speed = 80, pause = 1800) => {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), speed);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex((w) => (w + 1) % words.length);
    }

    setDisplayed(current.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words, speed, pause]);

  return displayed;
};

/* ── Counter animation hook ─────────────────────────────────────────────── */
const useCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
};

/* ── Data ───────────────────────────────────────────────────────────────── */
const features = [
  { icon: <FileTextIcon size={22} />, title: "Resume Analysis", color: "#6366f1",
    desc: "Upload your PDF resume and our AI extracts skills, projects, internships, and achievements automatically." },
  { icon: <SparklesIcon size={22} />, title: "AI Question Generation", color: "#3b82f6",
    desc: "Gemini AI generates personalized interview questions based on your actual resume content and experience." },
  { icon: <TargetIcon size={22} />, title: "Smart Evaluation", color: "#8b5cf6",
    desc: "Get detailed feedback on technical accuracy, clarity, communication, and explanation depth." },
  { icon: <ZapIcon size={22} />, title: "Real-Time Sessions", color: "#f59e0b",
    desc: "Live timers, progress tracking, and adaptive follow-up questions powered by Socket.io." },
  { icon: <BarChartIcon size={22} />, title: "Analytics Dashboard", color: "#22c55e",
    desc: "Track your performance trends, identify weak topics, and monitor improvement over time." },
  { icon: <LayersIcon size={22} />, title: "Multiple Categories", color: "#ec4899",
    desc: "DSA, MERN Stack, System Design, HR, Java, Python, Behavioral, and Role-Based interviews." },
];

const categories = [
  { label: "General Interview", icon: <TargetIcon size={15} />, color: "#6366f1" },
  { label: "DSA Interview",     icon: <CodeIcon size={15} />,    color: "#6366f1" },
  { label: "MERN Stack",        icon: <LayersIcon size={15} />,  color: "#3b82f6" },
  { label: "System Design",     icon: <ServerIcon size={15} />,  color: "#8b5cf6" },
  { label: "HR Interview",      icon: <UsersIcon size={15} />,   color: "#22c55e" },
  { label: "Java Technical",    icon: <CpuIcon size={15} />,     color: "#f59e0b" },
  { label: "Python Technical",  icon: <CpuIcon size={15} />,     color: "#10b981" },
  { label: "Behavioral",        icon: <MessageSquareIcon size={15} />, color: "#ec4899" },
  { label: "Role-Based",        icon: <SparklesIcon size={15} />, color: "#06b6d4" },
];

const typingWords = [
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "Software Engineer",
  "MERN Developer",
  "System Designer",
];

/* ── Floating particles ─────────────────────────────────────────────────── */
const Particles = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 12,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="particles" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ── Mock card ─────────────────────────────────────────────────────────── */
const mockQuestions = [
  { tag: "Question 1 · DSA", text: "Explain the difference between a stack and a queue with a real-world example." },
  { tag: "Question 2 · Projects", text: "Walk me through the architecture of your most complex project." },
  { tag: "Question 3 · System Design", text: "How would you design a URL shortener that handles millions of requests?" },
  { tag: "Question 4 · Behavioral", text: "Describe a time you had to learn a new technology quickly under pressure." },
  { tag: "Question 5 · MERN Stack", text: "How does the React reconciliation algorithm work under the hood?" },
];

const MockCard = () => {
  const [qIndex, setQIndex] = useState(0);
  const [activeBar, setActiveBar] = useState(0);
  const bars = [
    { label: "Technical", value: 85, color: "#6366f1" },
    { label: "Clarity",   value: 72, color: "#3b82f6" },
    { label: "Depth",     value: 91, color: "#22c55e" },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveBar((p) => (p + 1) % bars.length), 1800);
    return () => clearInterval(t);
  }, []);

  // Rotate question every 4 seconds
  useEffect(() => {
    const t = setInterval(() => setQIndex((p) => (p + 1) % mockQuestions.length), 4000);
    return () => clearInterval(t);
  }, []);

  const currentQ = mockQuestions[qIndex];

  return (
    <div className="mock-card">
      <div className="mock-card-header">
        <span className="mock-dot mock-red" />
        <span className="mock-dot mock-yellow" />
        <span className="mock-dot mock-green" />
        <span className="mock-card-title">Live Interview Session</span>
        <span className="mock-live-badge">● Live</span>
      </div>
      <div className="mock-card-body">
        <div className="mock-question-block">
          <span className="mock-q-tag">{currentQ.tag}</span>
          <p className="mock-question-text">"{currentQ.text}"</p>
        </div>
        <div className="mock-scores">
          {bars.map((b, i) => (
            <div key={b.label} className={`mock-score-row ${i === activeBar ? "active-row" : ""}`}>
              <span className="mock-score-label">{b.label}</span>
              <div className="mock-bar-track">
                <div className="mock-bar-fill" style={{ width: `${b.value}%`, background: b.color }} />
              </div>
              <span className="mock-score-val" style={{ color: b.color }}>
                {(b.value / 10).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
        <div className="mock-typing-indicator">
          <span /><span /><span />
          <p>AI is evaluating your answer...</p>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────────────── */
const Home = () => {
  const typedRole = useTypingEffect(typingWords, 75, 2000);
  const { count: interviewCount, ref: countRef } = useCounter(9);

  return (
    <div className="home">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="home-header">
        <div className="home-header-inner container">
          <Logo size="md" />
          <div className="home-header-actions">
            <Link to="/login"  className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="hero">
        <Particles />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-glow hero-glow-2" aria-hidden="true" />

        <div className="container hero-container">
          {/* Left — text */}
          <div className="hero-text">
            <div className="hero-badge anim-fade-up" style={{ animationDelay: "0.1s" }}>
              <SparklesIcon size={13} />
              AI-Powered Interview Preparation
            </div>

            <h1 className="hero-title anim-fade-up" style={{ animationDelay: "0.2s" }}>
              Ace Your Next Interview
              <br />
              <span className="gradient-text">as a </span>
              <span className="typing-text">
                {typedRole}
                <span className="typing-cursor">|</span>
              </span>
            </h1>

            <p className="hero-subtitle anim-fade-up" style={{ animationDelay: "0.35s" }}>
              Upload your resume, get personalized AI-generated questions, practice with
              real-time sessions, and track your performance with detailed analytics.
            </p>

            <div className="hero-actions anim-fade-up" style={{ animationDelay: "0.5s" }}>
              <Link to="/signup" className="btn btn-primary btn-lg hero-btn-primary">
                Start Practicing Free
                <ArrowRightIcon size={16} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>

            <div className="hero-stats anim-fade-up" style={{ animationDelay: "0.65s" }}>
              <div className="hero-stat" ref={countRef}>
                <span className="stat-number">{interviewCount}+</span>
                <span className="stat-label">Interview Categories</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="stat-number">AI</span>
                <span className="stat-label">Powered by Gemini</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="stat-number">3</span>
                <span className="stat-label">Difficulty Levels</span>
              </div>
            </div>
          </div>

          {/* Right — animated mock card */}
          <div className="hero-visual anim-fade-left" style={{ animationDelay: "0.4s" }}>
            <MockCard />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to Succeed</h2>
            <p>A complete interview preparation platform powered by cutting-edge AI</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card card anim-fade-up"
                style={{ animationDelay: `${0.05 + i * 0.08}s` }}
              >
                <div className="feature-icon-wrap" style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Interview Categories</h2>
            <p>Practice across all major technical and non-technical interview types</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="category-chip anim-pop"
                style={{ "--cat-color": cat.color, animationDelay: `${i * 0.06}s` }}
              >
                <span className="cat-chip-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get interview-ready in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            {[
              { step: "01", title: "Sign Up & Upload Resume",  desc: "Create your account and upload your PDF resume for AI analysis." },
              { step: "02", title: "Configure Interview",       desc: "Choose category, role, difficulty level, and number of questions." },
              { step: "03", title: "Practice with AI",          desc: "Answer personalized questions with real-time timer and adaptive follow-ups." },
              { step: "04", title: "Review & Improve",          desc: "Get detailed feedback, scores, and track your progress on the dashboard." },
            ].map((s, i) => (
              <div
                key={i}
                className="step-card anim-fade-up"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────────── */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefits-text anim-fade-right">
              <h2>Why PrepWise AI?</h2>
              <p>Unlike generic platforms, PrepWise AI reads your actual resume and builds an interview around your real experience.</p>
              <div className="benefits-list">
                {[
                  "Questions based on your actual projects and internships",
                  "Adaptive follow-ups that respond to your answers",
                  "Detailed per-answer feedback, not generic tips",
                  "Performance analytics to track improvement over time",
                  "Multiple categories from DSA to HR to System Design",
                ].map((b, i) => (
                  <div key={i} className="benefit-item anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <CheckCircleIcon size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="benefits-visual anim-fade-left">
              <div className="visual-card">
                <div className="visual-header">
                  <div className="visual-dot red" />
                  <div className="visual-dot yellow" />
                  <div className="visual-dot green" />
                  <span>Live Interview Session</span>
                </div>
                <div className="visual-body">
                  <div className="visual-question">
                    <span className="visual-label">Question 3 of 10</span>
                    <p>"You mentioned building a Redis caching layer in your project. What specific caching strategy did you implement and why?"</p>
                  </div>
                  <div className="visual-score-row">
                    {[
                      { label: "Technical", pct: "85%", val: "8.5" },
                      { label: "Clarity",   pct: "70%", val: "7.0" },
                      { label: "Depth",     pct: "90%", val: "9.0" },
                    ].map((s) => (
                      <div key={s.label} className="visual-score-item">
                        <span>{s.label}</span>
                        <div className="visual-bar"><div style={{ width: s.pct }} /></div>
                        <span>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-logo"><Logo size="md" variant="icon" /></div>
            <h2>Ready to Ace Your Interview?</h2>
            <p>Join thousands of candidates who improved their interview skills with PrepWise AI</p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started for Free
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-logo"><Logo size="sm" /></div>
          <p>AI-powered mock interview platform · Built with Gemini API</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
