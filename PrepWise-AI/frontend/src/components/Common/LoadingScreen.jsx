import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">PrepWise AI</span>
        </div>
        <div className="loading-spinner">
          <div className="spinner spinner-lg"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
