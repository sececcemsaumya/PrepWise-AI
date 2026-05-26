import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Profile.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getInitials = (n) => {
    if (!n) return "U";
    return n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put("/auth/profile", { name: name.trim() });
      updateUser({ name: res.data.user.name });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile fade-in">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div>
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
              <span className="badge badge-primary">Candidate</span>
            </div>
          </div>

          <div className="divider"></div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); setSuccess(""); }}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ""}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
              <span className="form-error" style={{ color: "var(--text-muted)" }}>
                Email cannot be changed
              </span>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: "16px" }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{success}</div>}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner"></div> Saving...</> : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Stats Card */}
        <div className="profile-right">
          <div className="card stats-overview">
            <h3>Your Statistics</h3>
            <div className="profile-stats">
              {[
                { label: "Total Interviews", value: user?.stats?.totalInterviews || 0, icon: "🎯" },
                { label: "Average Score", value: `${user?.stats?.averageScore || 0}/10`, icon: "⭐" },
                { label: "Best Score", value: `${user?.stats?.bestScore || 0}/10`, icon: "🏆" },
                { label: "Questions Answered", value: user?.stats?.totalQuestions || 0, icon: "💬" },
              ].map((stat) => (
                <div key={stat.label} className="profile-stat">
                  <span className="profile-stat-icon">{stat.icon}</span>
                  <div>
                    <span className="profile-stat-value">{stat.value}</span>
                    <span className="profile-stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card account-info">
            <h3>Account Information</h3>
            <div className="info-items">
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
                    : "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Resume Status</span>
                <span className={`badge badge-${user?.hasResume ? "success" : "warning"}`}>
                  {user?.hasResume ? "Uploaded" : "Not Uploaded"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Type</span>
                <span className="badge badge-primary">Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
