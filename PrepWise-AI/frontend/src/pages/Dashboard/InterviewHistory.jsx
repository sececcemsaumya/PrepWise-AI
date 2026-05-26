import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useInterview from "../../hooks/useInterview";
import "./InterviewHistory.css";

const InterviewHistory = () => {
  const { getHistory } = useInterview();
  const [interviews, setInterviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getHistory(page);
        setInterviews(data.interviews);
        setPagination(data.pagination);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  const getScoreColor = (score) => {
    if (score >= 7) return "var(--success)";
    if (score >= 5) return "var(--warning)";
    return "var(--error)";
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getCategoryLabel = (cat) => {
    if (!cat) return "General";
    const labels = {
      dsa: "DSA",
      hr: "HR",
      mern: "MERN Stack",
      "system-design": "System Design",
      java: "Java",
      python: "Python",
      behavioral: "Behavioral",
      "role-based": "Role-Based",
    };
    return labels[cat] || cat.toUpperCase();
  };

  return (
    <div className="interview-history fade-in">
      <div className="history-header">
        <div>
          <h1>Interview History</h1>
          <p>Review all your past interview sessions and performance</p>
        </div>
        <Link to="/interview/setup" className="btn btn-primary">
          New Interview
        </Link>
      </div>

      {loading ? (
        <div className="history-loading">
          <div className="spinner spinner-lg"></div>
          <p>Loading history...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No Interviews Yet</h3>
            <p>Start your first mock interview to see your history here</p>
            <Link to="/interview/setup" className="btn btn-primary">Start Interview</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="history-list">
            {interviews.map((interview) => (
              <div key={interview.sessionId} className="card history-item">
                <div className="history-item-header">
                  <div className="history-item-info">
                    <div className="history-badges">
                      <span className="badge badge-primary">
                        {getCategoryLabel(interview.config.category)}
                      </span>
                      <span className="badge badge-secondary" style={{ textTransform: "capitalize" }}>
                        {interview.config.difficulty}
                      </span>
                      <span className="badge badge-secondary" style={{ textTransform: "capitalize" }}>
                        {interview.config.role}
                      </span>
                    </div>
                    <span className="history-date">
                      {new Date(interview.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="history-score-section">
                    <div
                      className="history-score"
                      style={{ color: getScoreColor(interview.results?.averageScore || 0) }}
                    >
                      {interview.results?.averageScore?.toFixed(1) || "0.0"}/10
                    </div>
                    <span
                      className={`badge badge-${
                        (interview.results?.averageScore || 0) >= 7
                          ? "success"
                          : (interview.results?.averageScore || 0) >= 5
                          ? "warning"
                          : "error"
                      }`}
                    >
                      {interview.results?.grade || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="history-item-body">
                  {/* Score Breakdown */}
                  <div className="history-metrics">
                    <div className="history-metric">
                      <span className="hm-label">Technical</span>
                      <span className="hm-value" style={{ color: getScoreColor(interview.results?.technicalScore || 0) }}>
                        {interview.results?.technicalScore?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className="history-metric">
                      <span className="hm-label">Communication</span>
                      <span className="hm-value" style={{ color: getScoreColor(interview.results?.communicationScore || 0) }}>
                        {interview.results?.communicationScore?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className="history-metric">
                      <span className="hm-label">Questions</span>
                      <span className="hm-value">
                        {interview.questions?.filter((q) => q.answer).length || 0}/{interview.questions?.length || 0}
                      </span>
                    </div>
                    <div className="history-metric">
                      <span className="hm-label">Duration</span>
                      <span className="hm-value">{formatDuration(interview.duration)}</span>
                    </div>
                  </div>

                  {/* Feedback Preview */}
                  {interview.results?.overallFeedback && (
                    <p className="history-feedback">
                      {interview.results.overallFeedback.substring(0, 150)}
                      {interview.results.overallFeedback.length > 150 ? "..." : ""}
                    </p>
                  )}

                  {/* Strong/Weak Topics */}
                  <div className="history-topics">
                    {interview.results?.strongTopics?.slice(0, 3).map((topic, i) => (
                      <span key={i} className="topic-chip topic-strong">{topic}</span>
                    ))}
                    {interview.results?.weakTopics?.slice(0, 2).map((topic, i) => (
                      <span key={i} className="topic-chip topic-weak">{topic}</span>
                    ))}
                  </div>
                </div>

                <div className="history-item-footer">
                  <Link
                    to={`/interview/result/${interview.sessionId}`}
                    className="btn btn-outline btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewHistory;
