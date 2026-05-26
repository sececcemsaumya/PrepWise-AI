import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for interview timer
 */
const useTimer = (initialSeconds = 120) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsExpired(false);
    startTimeRef.current = Date.now();
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((seconds = initialSeconds) => {
    setIsRunning(false);
    setIsExpired(false);
    setTimeLeft(seconds);
    startTimeRef.current = null;
  }, [initialSeconds]);

  const getElapsed = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsExpired(true);
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const percentage = (timeLeft / initialSeconds) * 100;
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const isDanger = timeLeft <= 10;

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    isExpired,
    isWarning,
    isDanger,
    percentage,
    start,
    pause,
    reset,
    getElapsed,
  };
};

export default useTimer;
