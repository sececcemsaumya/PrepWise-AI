import React from "react";
import "./Logo.css";

/**
 * PrepWise AI Logo Component
 * Uses a clean SVG mark + wordmark — no emojis
 *
 * Props:
 *  size: "sm" | "md" | "lg"  (default: "md")
 *  variant: "full" | "icon"  (default: "full")
 *  light: bool               (default: false — use on dark bg)
 */
const Logo = ({ size = "md", variant = "full", light = false }) => {
  const sizes = {
    sm: { icon: 24, font: 15 },
    md: { icon: 30, font: 18 },
    lg: { icon: 40, font: 24 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`logo logo--${size} ${light ? "logo--light" : ""}`}>
      {/* SVG Icon Mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Rounded background */}
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />

        {/* "P" letterform — bold, geometric */}
        {/* Vertical stem */}
        <rect x="9" y="9" width="5" height="22" rx="2.5" fill="white" />
        {/* Top bar */}
        <rect x="9" y="9" width="15" height="5" rx="2.5" fill="white" />
        {/* Middle bar */}
        <rect x="9" y="18" width="13" height="5" rx="2.5" fill="white" />
        {/* Right curve cap */}
        <rect x="19" y="9" width="5" height="14" rx="2.5" fill="white" />

        {/* Accent dot — bottom right */}
        <circle cx="30" cy="30" r="4" fill="white" opacity="0.9" />
        <circle cx="30" cy="30" r="2" fill="url(#logoGrad)" />
      </svg>

      {/* Wordmark */}
      {variant === "full" && (
        <span className="logo-wordmark" style={{ fontSize: s.font }}>
          PrepWise <span className="logo-ai">AI</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
