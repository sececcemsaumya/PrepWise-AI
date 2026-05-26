import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";
import useInterview from "../../hooks/useInterview";
import "./Analytics.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { getAnalytics } = useInterview();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data.analytics);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner spinner-lg"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics || analytics.totalInterviews === 0) {
    return (
      <div className="analytics-empty">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No Analytics Yet</h3>
          <p>Complete your first interview to see performance analytics here</p>
          <a href="/interview/setup" className="btn btn-primary">Start Interview</a>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const scoreHistoryData = analytics.scoreHistory?.map((item, i) => ({
    name: `Interview ${i + 1}`,
    score: item.score,
    date: new Date(item.date).toLocaleDateString(),
    category: item.category,
  })) || [];

  const categoryData = Object.entries(analytics.categoryBreakdown || {}).map(([cat, data]) => ({
    name: cat.toUpperCase(),
    count: data.count,
    avgScore: Math.round(data.averageScore * 10) / 10,
  }));

  const topicData = Object.entries(analytics.topicPerformance || {})
    .slice(0, 8)
    .map(([topic, data]) => ({
      topic: topic.length > 15 ? topic.substring(0, 15) + "..." : topic,
      score: Math.round(data.averageScore * 10) / 10,
    }));

  const radarData = Object.entries(analytics.topicPerformance || {})
    .slice(0, 6)
    .map(([topic, data]) => ({
      subject: topic.length > 12 ? topic.substring(0, 12) + "..." : topic,
      score: Math.round(data.averageScore * 10) / 10,
      fullMark: 10,
    }));

  const getScoreColor = (score) => {
    if (score >= 7) return "var(--success)";
    if (score >= 5) return "var(--warning)";
    return "var(--error)";
  };

  return (
    <div className="analytics fade-in">
      <div className="analytics-header">
        <h1>Performance Analytics</h1>
        <p>Track your interview performance and identify areas for improvement</p>
      </div>

      {/* Overview Stats */}
      <div className="analytics-stats">
        {[
          { label: "Total Interviews", value: analytics.totalInterviews, icon: "🎯", color: "var(--accent-primary)" },
          { label: "Average Score", value: `${analytics.averageScore}/10`, icon: "⭐", color: getScoreColor(analytics.averageScore) },
          { label: "Best Score", value: `${analytics.bestScore}/10`, icon: "🏆", color: "var(--warning)" },
          { label: "Questions Answered", value: analytics.totalQuestions, icon: "💬", color: "var(--accent-secondary)" },
        ].map((stat) => (
          <div key={stat.label} className="card analytics-stat">
            <div className="analytics-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="analytics-stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="analytics-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Score History */}
        <div className="card chart-card">
          <h3>Score History</h3>
          <p className="chart-desc">Your performance trend over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--accent-primary)", r: 4 }}
                activeDot={{ r: 6 }}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="card chart-card">
          <h3>Category Performance</h3>
          <p className="chart-desc">Average scores by interview category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgScore" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Topic Performance */}
        {topicData.length > 0 && (
          <div className="card chart-card">
            <h3>Topic Performance</h3>
            <p className="chart-desc">Average scores by topic</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topicData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis dataKey="topic" type="category" tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Radar Chart */}
        {radarData.length > 2 && (
          <div className="card chart-card">
            <h3>Skill Radar</h3>
            <p className="chart-desc">Performance across different topics</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="var(--accent-primary)"
                  fill="var(--accent-primary)"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Strong & Weak Topics */}
      <div className="topics-analysis">
        {analytics.strongTopics?.length > 0 && (
          <div className="card topics-analysis-card">
            <h3>💪 Strong Topics</h3>
            <div className="topic-tags">
              {analytics.strongTopics.map((topic, i) => (
                <span key={i} className="topic-tag-strong">{topic}</span>
              ))}
            </div>
          </div>
        )}

        {analytics.weakTopics?.length > 0 && (
          <div className="card topics-analysis-card">
            <h3>📈 Topics to Improve</h3>
            <div className="topic-tags">
              {analytics.weakTopics.map((topic, i) => (
                <span key={i} className="topic-tag-weak">{topic}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Interviews Table */}
      {analytics.recentInterviews?.length > 0 && (
        <div className="card recent-table-card">
          <h3>Recent Interviews</h3>
          <div className="table-wrapper">
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Duration</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentInterviews.map((interview, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-primary">{(interview.category || "general").toUpperCase()}</span></td>
                    <td style={{ textTransform: "capitalize" }}>{interview.difficulty || "intermediate"}</td>
                    <td style={{ color: getScoreColor(interview.score), fontWeight: 600 }}>
                      {interview.score.toFixed(1)}/10
                    </td>
                    <td>
                      <span className={`badge badge-${interview.score >= 7 ? "success" : interview.score >= 5 ? "warning" : "error"}`}>
                        {interview.grade}
                      </span>
                    </td>
                    <td>{interview.duration ? `${Math.floor(interview.duration / 60)}m` : "N/A"}</td>
                    <td>{new Date(interview.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
