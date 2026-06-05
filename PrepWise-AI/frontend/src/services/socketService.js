import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "https://prepwise-ai-backend-up1w.onrender.com";

let socket = null;

/**
 * Initialize socket connection
 */
export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.warn("Socket connection error:", error.message);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join interview session room
 */
export const joinSession = (sessionId) => {
  if (socket) {
    socket.emit("join:session", { sessionId });
  }
};

/**
 * Emit timer tick
 */
export const emitTimerTick = (sessionId, timeRemaining, questionIndex) => {
  if (socket) {
    socket.emit("timer:tick", { sessionId, timeRemaining, questionIndex });
  }
};

/**
 * Emit progress update
 */
export const emitProgress = (sessionId, progress) => {
  if (socket) {
    socket.emit("progress:update", { sessionId, progress });
  }
};

export default { initSocket, getSocket, disconnectSocket, joinSession };
