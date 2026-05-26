/**
 * Format seconds to MM:SS
 */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/**
 * Get score color based on value
 */
export const getScoreColor = (score) => {
  if (score >= 7) return "var(--success)";
  if (score >= 5) return "var(--warning)";
  return "var(--error)";
};

/**
 * Get grade from score
 */
export const getGrade = (score) => {
  if (score >= 9) return "A+";
  if (score >= 8) return "A";
  if (score >= 7) return "B+";
  if (score >= 6) return "B";
  if (score >= 5) return "C+";
  if (score >= 4) return "C";
  if (score >= 3) return "D";
  return "F";
};

/**
 * Format duration in seconds to human readable
 */
export const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

/**
 * Truncate text to max length
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Get category display label
 */
export const getCategoryLabel = (cat) => {
  const labels = {
    dsa: "DSA Interview",
    hr: "HR Interview",
    mern: "MERN Stack",
    "system-design": "System Design",
    java: "Java Technical",
    python: "Python Technical",
    behavioral: "Behavioral",
    "role-based": "Role-Based",
  };
  return labels[cat] || cat;
};
