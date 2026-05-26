const jwt = require("jsonwebtoken");
const Interview = require("../models/Interview");
const { redisGet, redisSet } = require("../config/redis");

/**
 * Initialize Socket.io for real-time interview features
 */
const initializeSocket = (io) => {
  // Middleware: authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // ─── Interview Session Events ─────────────────────────────────────────────

    // Join interview session room
    socket.on("join:session", async ({ sessionId }) => {
      try {
        const interview = await Interview.findOne({
          sessionId,
          userId: socket.userId,
        });

        if (!interview) {
          socket.emit("error", { message: "Session not found" });
          return;
        }

        socket.join(`session:${sessionId}`);
        socket.sessionId = sessionId;

        socket.emit("session:joined", {
          sessionId,
          status: interview.status,
          currentQuestionIndex: interview.currentQuestionIndex,
          totalQuestions: interview.questions.length,
        });

        console.log(`📋 User ${socket.userId} joined session ${sessionId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join session" });
      }
    });

    // Timer tick - client sends timer updates
    socket.on("timer:tick", ({ sessionId, timeRemaining, questionIndex }) => {
      // Broadcast to all clients in the session (for multi-device support)
      socket.to(`session:${sessionId}`).emit("timer:update", {
        timeRemaining,
        questionIndex,
      });
    });

    // Question navigation
    socket.on("question:navigate", async ({ sessionId, questionIndex }) => {
      try {
        const interview = await Interview.findOne({
          sessionId,
          userId: socket.userId,
        });

        if (!interview) return;

        // Update current question index
        interview.currentQuestionIndex = questionIndex;
        await interview.save();

        io.to(`session:${sessionId}`).emit("question:changed", {
          questionIndex,
          question: interview.questions[questionIndex],
        });
      } catch (error) {
        socket.emit("error", { message: "Navigation failed" });
      }
    });

    // Answer being typed (for real-time feedback)
    socket.on("answer:typing", ({ sessionId, questionIndex, isTyping }) => {
      socket.to(`session:${sessionId}`).emit("answer:typing:update", {
        questionIndex,
        isTyping,
      });
    });

    // Session pause/resume
    socket.on("session:pause", async ({ sessionId }) => {
      try {
        await Interview.findOneAndUpdate(
          { sessionId, userId: socket.userId },
          { status: "paused" }
        );
        io.to(`session:${sessionId}`).emit("session:paused", { sessionId });
      } catch (error) {
        socket.emit("error", { message: "Failed to pause session" });
      }
    });

    socket.on("session:resume", async ({ sessionId }) => {
      try {
        await Interview.findOneAndUpdate(
          { sessionId, userId: socket.userId },
          { status: "active" }
        );
        io.to(`session:${sessionId}`).emit("session:resumed", { sessionId });
      } catch (error) {
        socket.emit("error", { message: "Failed to resume session" });
      }
    });

    // Progress update
    socket.on("progress:update", ({ sessionId, progress }) => {
      io.to(`session:${sessionId}`).emit("progress:updated", { progress });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };
