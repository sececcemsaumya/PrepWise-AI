import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useInterview from "../../hooks/useInterview";
import "./InterviewResult.css";

const ScoreBar = ({ label, value }) => {
  const color = value >= 7 ? "var(--success)" : value >= 5 ? "var(--warning)" : "var(--error)";
  return (
    <div className="rb-score-row">
      <span className="rb-score-label">{label}</span>
      <div className="rb-score-track">
        <div className="rb-score-fill" style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <span className="rb-score-val" style={{ color }}>{value}/10</span>
    </div>
  );
};

const InterviewResult = () => {
  const { sessionId } = useParams();
  const { getInterview, loading } = useInterview();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInterview(sessionId);
        setInterview(data.interview);
      } catch {
        setError("Failed to load interview results");
      }
    };
    load();
  }, [sessionId]);

  const getScoreColor = (s) => s >= 7 ? "var(--success)" : s >= 5 ? "var(--warning)" : "var(--error)";
  const getGradeColor = (g) => ["A+","A"].includes(g) ? "var(--success)" : ["B+","B"].includes(g) ? "var(--accent-secondary)" : ["C+","C"].includes(g) ? "var(--warning)" : "var(--error)";
  const formatDuration = (s) => !s ? "N/A" : `${Math.floor(s/60)}m ${s%60}s`;

  if (loading) return (
    <div className="result-loading">
      <div className="spinner spinner-lg" />
      <p>Generating your performance report...</p>
    </div>
  );

  if (error || !interview) return (
    <div className="result-error">
      <h2>Results not found</h2>
      <p>{error}</p>
      <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  );

  const results = interview.results || {};
  const answered = interview.questions.filter((q) => q.answer);

  return (
    <div className="interview-result fade-in">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="result-header">
        <div>
          <h1>Interview Report</h1>
          <p>{(interview.config?.category || "general").toUpperCase()} · {interview.config?.difficulty || "intermediate"} · {interview.config?.role || "general"} · {answered.length} questions answered</p>
        </div>
        <div className="result-header-actions">
          <Link to="/interview/setup" className="btn btn-primary">Practice Again</Link>
          <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
        </div>
      </div>

      {/* ── Score banner ────────────────────────────────────────────────── */}
      <div className="result-banner">
        <div className="banner-grade" style={{ borderColor: getGradeColor(results.grade), color: getGradeColor(results.grade) }}>
          {results.grade || "N/A"}
        </div>
        <div className="banner-stats">
          {[
            { label: "Overall Score",   value: `${results.averageScore?.toFixed(1) || 0}/10`,   color: getScoreColor(results.averageScore) },
            { label: "Technical",       value: `${results.technicalScore?.toFixed(1) || 0}/10`,  color: getScoreColor(results.technicalScore) },
            { label: "Communication",   value: `${results.communicationScore?.toFixed(1) || 0}/10`, color: getScoreColor(results.communicationScore) },
            { label: "Questions",       value: `${answered.length} answered`,                    color: "var(--accent-primary)" },
            { label: "Duration",        value: formatDuration(interview.duration),               color: "var(--text-secondary)" },
          ].map((m) => (
            <div key={m.label} className="banner-stat">
              <span className="banner-stat-value" style={{ color: m.color }}>{m.value}</span>
              <span className="banner-stat-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="result-tabs">
        {["overview", "questions", "recommendations"].map((tab) => (
          <button
            key={tab}
            className={`result-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "📊 Overview" : tab === "questions" ? "💬 Q&A Review" : "🎯 Recommendations"}
          </button>
        ))}
      </div>

      {/* ── Overview tab ────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="tab-content fade-in">
          {/* Overall feedback */}
          <div className="card result-section">
            <h3>Overall Performance</h3>
            <p className="overall-feedback-text">{results.overallFeedback || "Interview completed."}</p>
          </div>

          {/* Strong / Weak */}
          <div className="result-two-col">
            {results.strongTopics?.length > 0 && (
              <div className="card result-section">
                <h3>💪 Strong Areas</h3>
                <div className="topic-tags">
                  {results.strongTopics.map((t, i) => (
                    <span key={i} className="topic-tag topic-strong">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {results.weakTopics?.length > 0 && (
              <div className="card result-section">
                <h3>📈 Areas to Improve</h3>
                <div className="topic-tags">
                  {results.weakTopics.map((t, i) => (
                    <span key={i} className="topic-tag topic-weak">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Performance summary */}
          {results.performanceSummary && (
            <div className="card result-section">
              <h3>Performance Summary</h3>
              <div className="perf-summary-grid">
                <div className="perf-item">
                  <span className="perf-label">Best Answer</span>
                  <span className="perf-value">{results.performanceSummary.bestAnswer || "N/A"}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Weakest Answer</span>
                  <span className="perf-value">{results.performanceSummary.weakestAnswer || "N/A"}</span>
                </div>
                <div className="perf-item">
                  <span className="perf-label">Consistency</span>
                  <span className="perf-value">{results.performanceSummary.consistency || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Q&A Review tab ──────────────────────────────────────────────── */}
      {activeTab === "questions" && (
        <div className="tab-content fade-in">
          {answered.map((q, i) => (
            <div key={i} className="card qr-card">
              <div className="qr-header">
                <div className="qr-meta">
                  <span className="qr-num">Q{interview.questions.indexOf(q) + 1}</span>
                  <span className="badge badge-primary">{q.topic}</span>
                  <span className={`badge badge-${q.type === "technical" ? "secondary" : "warning"}`}>{q.type}</span>
                  {q.basedOn && <span className="qr-based-on">Based on: {q.basedOn}</span>}
                </div>
                {q.evaluation?.score !== undefined && (
                  <div className="qr-score-badge" style={{ color: getScoreColor(q.evaluation.score), borderColor: getScoreColor(q.evaluation.score) }}>
                    {q.evaluation.score}/10
                  </div>
                )}
              </div>

              <p className="qr-question-text">{q.question}</p>

              <div className="qr-answer-block">
                <span className="qr-block-label">Your Answer</span>
                <p>{q.answer}</p>
              </div>

              {q.evaluation && (
                <>
                  <div className="qr-feedback-block">
                    <span className="qr-block-label">AI Feedback</span>
                    <p>{q.evaluation.feedback}</p>
                  </div>

                  <div className="qr-scores-grid">
                    <ScoreBar label="Technical"     value={q.evaluation.technicalAccuracy} />
                    <ScoreBar label="Clarity"       value={q.evaluation.clarity} />
                    <ScoreBar label="Communication" value={q.evaluation.communication} />
                    <ScoreBar label="Depth"         value={q.evaluation.explanationDepth} />
                  </div>

                  {(q.evaluation.strengths?.length > 0 || q.evaluation.improvements?.length > 0) && (
                    <div className="qr-details-grid">
                      {q.evaluation.strengths?.length > 0 && (
                        <div className="qr-detail-col">
                          <span className="qr-detail-title success">✓ Strengths</span>
                          <ul>{q.evaluation.strengths.map((s, j) => <li key={j}>{s}</li>)}</ul>
                        </div>
                      )}
                      {q.evaluation.improvements?.length > 0 && (
                        <div className="qr-detail-col">
                          <span className="qr-detail-title warning">↑ Improvements</span>
                          <ul>{q.evaluation.improvements.map((s, j) => <li key={j}>{s}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Recommendations tab ─────────────────────────────────────────── */}
      {activeTab === "recommendations" && (
        <div className="tab-content fade-in">
          {results.recommendations?.length > 0 && (
            <div className="card result-section">
              <h3>🎯 Action Plan</h3>
              <div className="rec-list">
                {results.recommendations.map((rec, i) => (
                  <div key={i} className="rec-item">
                    <div className="rec-num">{i + 1}</div>
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card result-section">
            <h3>📚 Next Steps</h3>
            <div className="next-steps">
              <Link to="/interview/setup" className="next-step-card">
                <div className="next-step-icon">🎤</div>
                <div>
                  <h4>Practice Again</h4>
                  <p>Start a new interview session to improve</p>
                </div>
              </Link>
              <Link to="/analytics" className="next-step-card">
                <div className="next-step-icon">📊</div>
                <div>
                  <h4>View Analytics</h4>
                  <p>Track your progress over time</p>
                </div>
              </Link>
              <Link to="/history" className="next-step-card">
                <div className="next-step-icon">📋</div>
                <div>
                  <h4>Interview History</h4>
                  <p>Review all past sessions</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="result-actions">
        <Link to="/interview/setup" className="btn btn-primary btn-lg">Start Another Interview</Link>
        <Link to="/analytics" className="btn btn-outline btn-lg">View Analytics</Link>
      </div>
    </div>
  );
};

export default InterviewResult;
