import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./UploadResume.css";

const UploadResume = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [progress, setProgress] = useState(0);

  // Load existing resume data
  useEffect(() => {
    const loadResume = async () => {
      if (user?.hasResume) {
        try {
          const res = await api.get("/resume");
          setResumeData(res.data.resume);
        } catch {
          // No resume yet
        }
      }
    };
    loadResume();
  }, [user]);

  const handleFileSelect = (selectedFile) => {
    setError("");
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFileSelect(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    setProgress(0);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setResumeData(res.data.resume);
      setSuccess("Resume uploaded and analyzed successfully!");
      setFile(null);
      updateUser({ hasResume: true });

      // Redirect after 2 seconds
      setTimeout(() => navigate("/interview/setup"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) return;
    try {
      await api.delete("/resume");
      setResumeData(null);
      updateUser({ hasResume: false });
      setSuccess("Resume deleted successfully");
    } catch {
      setError("Failed to delete resume");
    }
  };

  return (
    <div className="upload-resume fade-in">
      <div className="upload-header">
        <h1>Resume Upload</h1>
        <p>Upload your PDF resume for AI-powered analysis and personalized interview questions</p>
      </div>

      <div className="upload-layout">
        {/* Upload Area */}
        <div className="upload-section">
          <div className="card upload-card">
            <h2>Upload Your Resume</h2>
            <p className="upload-desc">
              Our AI will extract your skills, projects, internships, and achievements to generate personalized questions.
            </p>

            {/* Drop Zone */}
            <div
              className={`drop-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: "none" }}
              />
              {file ? (
                <div className="file-selected">
                  <span className="file-icon">📄</span>
                  <div>
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="drop-content">
                  <div className="drop-icon">📤</div>
                  <p className="drop-title">Drop your PDF here</p>
                  <p className="drop-subtitle">or click to browse files</p>
                  <span className="drop-hint">PDF only • Max 5MB</span>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && progress > 0 && (
              <div className="upload-progress">
                <div className="flex-between" style={{ marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {progress < 100 ? "Uploading..." : "Analyzing with AI..."}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--accent-primary)" }}>{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="alert alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {success}
              </div>
            )}

            {/* Upload Button */}
            <button
              className="btn btn-primary btn-full"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  {progress < 100 ? "Uploading..." : "Analyzing Resume..."}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload & Analyze Resume
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="card tips-card">
            <h3>💡 Tips for Best Results</h3>
            <ul className="tips-list">
              <li>Use a text-based PDF (not scanned image)</li>
              <li>Include your skills, projects, and work experience</li>
              <li>Mention technologies and tools you've used</li>
              <li>List your achievements and accomplishments</li>
              <li>Keep the resume clear and well-structured</li>
            </ul>
          </div>
        </div>

        {/* Resume Data Preview */}
        <div className="resume-preview-section">
          {resumeData ? (
            <div className="card resume-preview">
              <div className="resume-preview-header">
                <div>
                  <h2>Analyzed Resume</h2>
                  <p className="resume-filename">📄 {resumeData.fileName}</p>
                  {resumeData.uploadedAt && (
                    <p className="resume-date">
                      Uploaded: {new Date(resumeData.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  Delete
                </button>
              </div>

              <div className="resume-sections">
                {/* Skills */}
                {resumeData.parsedData?.skills?.length > 0 && (
                  <div className="resume-section">
                    <h3>🛠️ Skills</h3>
                    <div className="tags-list">
                      {resumeData.parsedData.skills.map((skill, i) => (
                        <span key={i} className="tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {resumeData.parsedData?.technologies?.length > 0 && (
                  <div className="resume-section">
                    <h3>⚙️ Technologies</h3>
                    <div className="tags-list">
                      {resumeData.parsedData.technologies.map((tech, i) => (
                        <span key={i} className="tag tag-secondary">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.parsedData?.projects?.length > 0 && (
                  <div className="resume-section">
                    <h3>🚀 Projects</h3>
                    <div className="items-list">
                      {resumeData.parsedData.projects.map((project, i) => (
                        <div key={i} className="item-card">
                          <h4>{project.name}</h4>
                          {project.description && <p>{project.description}</p>}
                          {project.technologies?.length > 0 && (
                            <div className="tags-list" style={{ marginTop: "6px" }}>
                              {project.technologies.map((t, j) => (
                                <span key={j} className="tag tag-sm">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internships */}
                {resumeData.parsedData?.internships?.length > 0 && (
                  <div className="resume-section">
                    <h3>💼 Internships</h3>
                    <div className="items-list">
                      {resumeData.parsedData.internships.map((intern, i) => (
                        <div key={i} className="item-card">
                          <h4>{intern.role} at {intern.company}</h4>
                          {intern.duration && <p className="item-meta">{intern.duration}</p>}
                          {intern.description && <p>{intern.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {resumeData.parsedData?.achievements?.length > 0 && (
                  <div className="resume-section">
                    <h3>🏆 Achievements</h3>
                    <ul className="achievements-list">
                      {resumeData.parsedData.achievements.map((ach, i) => (
                        <li key={i}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "20px" }}>
                <a href="/interview/setup" className="btn btn-primary btn-full">
                  Start Interview with This Resume →
                </a>
              </div>
            </div>
          ) : (
            <div className="card resume-empty">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No Resume Analyzed Yet</h3>
                <p>Upload your resume to see the extracted data here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
