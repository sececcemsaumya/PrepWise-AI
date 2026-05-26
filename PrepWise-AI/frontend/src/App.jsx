import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layout
import AppLayout from "./routes/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import UploadResume from "./pages/UploadResume/UploadResume";
import InterviewSetup from "./pages/InterviewSession/InterviewSetup";
import InterviewSession from "./pages/InterviewSession/InterviewSession";
import InterviewResult from "./pages/InterviewResult/InterviewResult";
import Analytics from "./pages/Dashboard/Analytics";
import InterviewHistory from "./pages/Dashboard/InterviewHistory";
import Profile from "./pages/Profile/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Home />} />

          {/* Auth routes - redirect if already logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected app routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload-resume" element={<UploadResume />} />
            <Route path="/interview/setup" element={<InterviewSetup />} />
            <Route path="/interview/session/:sessionId" element={<InterviewSession />} />
            <Route path="/interview/result/:sessionId" element={<InterviewResult />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<InterviewHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
