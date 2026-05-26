import { useState, useCallback } from "react";
import api from "../services/api";

/**
 * Custom hook for interview operations
 */
const useInterview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startInterview = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/interview/start", config);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start interview";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (sessionId, questionIndex, answer, timeSpent) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/interview/${sessionId}/answer`, {
        questionIndex,
        answer,
        timeSpent,
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit answer";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeInterview = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/interview/${sessionId}/complete`);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to complete interview";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getInterview = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const res = await api.get(`/interview/${sessionId}`);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch interview";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (page = 1) => {
    try {
      const res = await api.get(`/interview/history?page=${page}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch history");
    }
  }, []);

  const getAnalytics = useCallback(async () => {
    try {
      const res = await api.get("/interview/analytics");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch analytics");
    }
  }, []);

  return {
    loading,
    error,
    startInterview,
    submitAnswer,
    completeInterview,
    getInterview,
    getHistory,
    getAnalytics,
  };
};

export default useInterview;
