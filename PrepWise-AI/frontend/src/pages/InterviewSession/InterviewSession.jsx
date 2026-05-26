import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useInterview from "../../hooks/useInterview";
import useTimer from "../../hooks/useTimer";
import { initSocket, joinSession, emitTimerTick } from "../../services/socketService";
import "./InterviewSession.css";

const QUESTION_TIME = 180;

const GREETINGS = {
  general:
    "Hi! I'm Alex, your AI interviewer today. I've reviewed your resume and I'm looking forward to our conversation. We'll explore your projects, skills, and experiences in depth. Take your time with each answer — I'm interested in how you think, not just what you know.",
  dsa:
    "Hello! I'm Alex, your technical interviewer. Today we'll work through data structures and algorithm problems. I'll ask you to think out loud — walk me through your reasoning, explain your approach, and discuss time and space complexity as we go.",
  mern:
    "Hey! I'm Alex from the engineering team. We'll be diving into your MERN stack experience today — React patterns, Node.js internals, MongoDB design, and Express architecture. I want to understand how you actually build things, not just what you know.",
  "system-design":
    "Hi! I'm Alex, a senior engineer here. System design interviews are about your thought process — there's rarely one right answer. Think out loud, ask clarifying questions, and walk me through your reasoning and trade-offs.",
  hr:
    "Hello! I'm Alex from the People team. This is a relaxed conversation — I want to understand how you work, how you handle challenges, and how you collaborate with others. Use specific examples from your experience.",
  java:
    "Hi! I'm Alex, your Java technical interviewer. We'll cover core Java concepts, OOP principles, JVM internals, and real-world scenarios. Feel free to ask for clarification — I want to understand how you think.",
  python:
    "Hey! I'm Alex, your Python interviewer. We'll explore Python-specific features, libraries, and how you apply them to real problems. Think out loud — I'm interested in your approach and reasoning.",
  behavioral:
    "Hi! I'm Alex. Behavioral interviews help me understand how you've handled real situations. Use the STAR method — Situation, Task, Action, Result. Be specific and honest about what you did.",
  "role-based":
    "Hello! I'm Alex, your interviewer today. We'll focus on role-specific skills, best practices, and how you approach real engineering challenges. I want to understand how you think and work.",
};

const ACK_MESSAGES = [
  "Got it, thank you for that answer.",
  "Noted. I appreciate the detail.",
  "Thanks for explaining that.",
  "Good, I've noted your response.",
  "Understood. Let's continue.",
  "That's helpful context, thank you.",
  "Great, I've got that down.",
];

const THINKING_MESSAGES = [
  "That's interesting. Let me follow up on that...",
  "Good point. I'd like to dig deeper...",
  "I see. Let me ask something related...",
  "Thanks for that. Here's my next question...",
  "Noted. Let me explore a different angle...",
  "That gives me good context. Moving on...",
];

let ackCounter = 0;

const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { getInterview, submitAnswer, completeInterview } = useInterview();

  const [interview, setInterview]         = useState(null);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [answer, setAnswer]               = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError]                 = useState("");
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [completing, setCompleting]       = useState(false);
  const [showTyping, setShowTyping]       = useState(false);
  const [thinkingMsg, setThinkingMsg]     = useState("");
  const [chatHistory, setChatHistory]     = useState([]);
  const [introComplete, setIntroComplete] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);

  const introRan     = useRef(false);
  const questionsRef = useRef([]);

  const timer        = useTimer(QUESTION_TIME);
  const answerRef    = useRef(null);
  const chatEndRef   = useRef(null);
  const startTimeRef = useRef(Date.now());

  // ── Load session — handles both fresh and resumed sessions ──────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInterview(sessionId);
        const interviewData = data.interview;
        setInterview(interviewData);
        const qs = interviewData.questions || [];
        questionsRef.current = qs;
        const answered = qs.filter((q) => q.answer).length;
        setAnsweredCount(answered);
        setCurrentIndex(interviewData.currentQuestionIndex || 0);

        if (interviewData.status === "ready_to_complete" || interviewData.status === "completed") {
          setIsInterviewComplete(true);
        }

        const greeting = GREETINGS[interviewData.config?.category] || GREETINGS.general;

        if (answered > 0) {
          // ── Resuming session ──
          const history = [];
          qs.slice(0, answered).forEach((q) => {
            history.push({ role: "interviewer", content: q.question, topic: q.topic, type: q.type });
            if (q.answer) {
              history.push({ role: "candidate", content: q.answer });
              history.push({ role: "ack", content: ACK_MESSAGES[ackCounter++ % ACK_MESSAGES.length] });
            }
          });
          if (qs[answered]) {
            history.push({
              role: "interviewer",
              content: qs[answered].question,
              topic: qs[answered].topic,
              type: qs[answered].type,
            });
          }
          setChatHistory(history);
          setIntroComplete(true);
          introRan.current = true;
        } else {
          // ── Fresh session — show greeting then first question ──
          introRan.current = true;
          const firstQ = qs[0];

          // Show greeting immediately
          const initialHistory = [{ role: "intro", content: greeting }];
          setChatHistory(initialHistory);

          // Show typing indicator after 500ms
          setTimeout(() => {
            setShowTyping(true);

            // Show first question after 1s of typing
            setTimeout(() => {
              setShowTyping(false);
              if (firstQ) {
                setChatHistory([
                  { role: "intro", content: greeting },
                  { role: "interviewer", content: firstQ.question, topic: firstQ.topic, type: firstQ.type },
                ]);
                setIntroComplete(true);
                timer.reset(QUESTION_TIME);
                timer.start();
                startTimeRef.current = Date.now();
                setTimeout(() => answerRef.current?.focus(), 100);
              } else {
                // No question yet — still enable input
                setIntroComplete(true);
              }
            }, 1000);
          }, 500);
        }
      } catch {
        setError("Failed to load interview session");
      } finally {
        setSessionLoading(false);
      }
    };
    load();
  }, [sessionId]);

  // ── Socket ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (token) { initSocket(token); joinSession(sessionId); }
  }, [token, sessionId]);

  // ── Timer ticks ──────────────────────────────────────────────────────
  useEffect(() => {
    if (timer.isRunning) emitTimerTick(sessionId, timer.timeLeft, currentIndex);
  }, [timer.timeLeft]);

  // ── Auto scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, showTyping]);

  // ── Submit answer ────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || submitting || !introComplete) return;
    timer.pause();

    const userAnswer = answer.trim();
    setAnswer("");
    setSubmitting(true);
    setError("");

    setChatHistory((prev) => [...prev, { role: "candidate", content: userAnswer }]);

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const result = await submitAnswer(sessionId, currentIndex, userAnswer, timeSpent);

      setAnsweredCount((c) => c + 1);

      const ack = ACK_MESSAGES[ackCounter % ACK_MESSAGES.length];
      ackCounter++;
      setChatHistory((prev) => [...prev, { role: "ack", content: ack }]);

      if (result.isComplete) {
        setIsInterviewComplete(true);
      }

      if (result.nextQuestion) {
        const updated = questionsRef.current.map((q, i) =>
          i === currentIndex ? { ...q, answer: userAnswer, evaluation: result.evaluation } : q
        );
        const next = [...updated, { ...result.nextQuestion, answer: "", evaluation: null }];
        questionsRef.current = next;
      }

      setShowEvaluation(true);
    } catch (err) {
      setError(err.message || "Failed to submit answer");
      timer.start();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Next question ────────────────────────────────────────────────────
  const handleNextQuestion = useCallback(() => {
    const nextIdx = currentIndex + 1;
    const thinking = THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)];

    setShowEvaluation(false);
    setThinkingMsg(thinking);
    setShowTyping(true);
    setCurrentIndex(nextIdx);

    setTimeout(() => {
      setShowTyping(false);
      setThinkingMsg("");

      const nextQ = questionsRef.current[nextIdx];
      if (nextQ) {
        setChatHistory((h) => {
          const lastQ = [...h].reverse().find((m) => m.role === "interviewer");
          if (lastQ?.content === nextQ.question) return h;
          return [...h, {
            role: "interviewer",
            content: nextQ.question,
            topic: nextQ.topic,
            type: nextQ.type,
          }];
        });
        timer.reset(QUESTION_TIME);
        timer.start();
        startTimeRef.current = Date.now();
        setTimeout(() => answerRef.current?.focus(), 100);
      }
    }, 400);
  }, [currentIndex]);

  // ── Finish ───────────────────────────────────────────────────────────
  const handleFinishInterview = async () => {
    setCompleting(true);
    try {
      await completeInterview(sessionId);
      navigate(`/interview/result/${sessionId}`);
    } catch {
      setError("Failed to complete interview");
      setCompleting(false);
    }
  };

  const getTimerClass = () => {
    if (timer.isDanger) return "timer-danger";
    if (timer.isWarning) return "timer-warning";
    return "";
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="session-loading">
        <div className="spinner spinner-lg" />
        <p>Setting up your interview session...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="session-error">
        <h2>Session not found</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/interview/setup")}>
          Start New Interview
        </button>
      </div>
    );
  }

  const progress = Math.min((answeredCount / Math.max(answeredCount + 1, 5)) * 100, 90);

  // Determine what to show in the input area
  const renderInputArea = () => {
    if (showEvaluation) {
      return (
        <div className="post-eval-actions">
          {isInterviewComplete ? (
            <>
              <p className="post-eval-hint">Interview complete! Ready to see your comprehensive feedback and results?</p>
              <div className="post-eval-btns">
                <button
                  className="btn btn-primary"
                  onClick={handleFinishInterview}
                  disabled={completing}
                >
                  {completing ? <><div className="spinner" /> Generating Report...</> : "View Results & Report"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="post-eval-hint">Ready for the next question?</p>
              <div className="post-eval-btns">
                <button
                  className="btn btn-primary"
                  onClick={handleNextQuestion}
                  disabled={completing}
                >
                  Next Question
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <button className="btn btn-outline" onClick={handleFinishInterview} disabled={completing}>
                  {completing ? <><div className="spinner" /> Generating Report...</> : "End & See Results"}
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    if (showTyping) {
      return (
        <div className="waiting-next">
          <div className="spinner" />
          <span>Alex is preparing the next question...</span>
        </div>
      );
    }

    return (
      <div className="answer-input-wrap">
        <div className="answer-input-header">
          <span className="answer-input-label">Your Answer</span>
          <span className="word-count-badge">
            {answer.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <textarea
          ref={answerRef}
          className="chat-textarea"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey && answer.trim()) handleSubmitAnswer();
          }}
          placeholder={
            introComplete
              ? "Type your answer here... Be specific and detailed. Press Ctrl+Enter to submit."
              : "Waiting for the first question..."
          }
          rows={4}
          disabled={submitting || !introComplete}
        />
        <div className="answer-input-footer">
          <span className="input-hint">Ctrl+Enter to submit</span>
          <button
            className="btn btn-primary submit-btn"
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || submitting || !introComplete}
          >
            {submitting ? (
              <><div className="spinner" /> Evaluating...</>
            ) : (
              <>Send Answer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="interview-session">

      {/* Top bar */}
      <div className="session-topbar">
        <div className="interviewer-info">
          <div className="interviewer-avatar">A</div>
          <div>
            <div className="interviewer-name">Alex · AI Interviewer</div>
            <div className="interviewer-status">
              <span className="status-dot" />
              {(interview.config?.category || "general").toUpperCase()} · {interview.config?.difficulty || "intermediate"} · {interview.config?.role || "general"}
            </div>
          </div>
        </div>
        <div className="session-meta">
          <div className="answered-count">
            <span>{answeredCount}</span>
            <span className="answered-label">answered</span>
          </div>
          <div className={`session-timer ${getTimerClass()}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {timer.formattedTime}
          </div>
          <button className="btn btn-outline btn-sm end-btn" onClick={handleFinishInterview} disabled={completing}>
            {completing ? <div className="spinner" /> : "End Interview"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="session-progress-bar">
        <div className="session-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {chatHistory.map((msg, i) => {
          if (msg.role === "intro") {
            return (
              <div key={i} className="chat-message interviewer-message">
                <div className="interviewer-avatar-sm">A</div>
                <div className="chat-bubble interviewer-bubble intro-bubble">
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          }
          if (msg.role === "interviewer") {
            return (
              <div key={i} className="chat-message interviewer-message">
                <div className="interviewer-avatar-sm">A</div>
                <div className="chat-bubble interviewer-bubble">
                  {msg.topic && (
                    <div className="bubble-meta">
                      <span className="bubble-topic">{msg.topic}</span>
                      {msg.type && (
                        <span className={`bubble-type type-${msg.type}`}>{msg.type}</span>
                      )}
                    </div>
                  )}
                  <p className="bubble-question">{msg.content}</p>
                </div>
              </div>
            );
          }
          if (msg.role === "candidate") {
            return (
              <div key={i} className="chat-message candidate-message">
                <div className="chat-bubble candidate-bubble">
                  <p>{msg.content}</p>
                </div>
                <div className="candidate-avatar">You</div>
              </div>
            );
          }
          if (msg.role === "ack") {
            return (
              <div key={i} className="chat-message interviewer-message">
                <div className="interviewer-avatar-sm">A</div>
                <div className="chat-bubble interviewer-bubble ack-bubble">
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          }
          return null;
        })}

        {showTyping && (
          <div className="chat-message interviewer-message">
            <div className="interviewer-avatar-sm">A</div>
            <div className="chat-bubble interviewer-bubble typing-bubble">
              {thinkingMsg && <p className="thinking-msg">{thinkingMsg}</p>}
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "10px" }}>{error}</div>
        )}
        {renderInputArea()}
      </div>
    </div>
  );
};

export default InterviewSession;
