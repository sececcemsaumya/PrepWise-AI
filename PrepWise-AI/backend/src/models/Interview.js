const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionId: String,
  question: { type: String, required: true },
  type: {
    type: String,
    // Normalize to lowercase in controller — no strict enum here
    default: "technical",
  },
  difficulty: {
    type: String,
    // Normalize to lowercase in controller — no strict enum here
    default: "intermediate",
  },
  topic: String,
  phase: String,
  basedOn: String,
  isFollowUp: { type: Boolean, default: false },
  answer: { type: String, default: "" },
  evaluation: {
    score: { type: Number, min: 0, max: 10, default: 0 },
    technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
    clarity: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    confidence: { type: Number, min: 0, max: 10, default: 0 },
    explanationDepth: { type: Number, min: 0, max: 10, default: 0 },
    feedback: String,
    strengths: [String],
    improvements: [String],
  },
  followUpQuestions: [String],
  answeredAt: Date,
  timeSpent: Number,
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    // Interview configuration
    config: {
      category: {
        type: String,
        enum: [
          "dsa",
          "hr",
          "mern",
          "system-design",
          "java",
          "python",
          "behavioral",
          "role-based",
          "general",
        ],
        required: true,
      },
      role: {
        type: String,
        enum: [
          "frontend",
          "backend",
          "fullstack",
          "software-engineer",
          "general",
        ],
        default: "general",
      },
      difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "intermediate",
      },
      totalQuestions: { type: Number, default: 10 },
      isAdaptive: { type: Boolean, default: false },
      interviewerMode: { type: String, default: "Professional" },
    },
    // Questions and answers
    questions: [questionSchema],
    // Current state
    status: {
      type: String,
      enum: ["pending", "active", "paused", "completed", "abandoned", "ready_to_complete"],
      default: "pending",
    },
    currentQuestionIndex: { type: Number, default: 0 },
    // Timing
    startedAt: Date,
    completedAt: Date,
    duration: Number, // total seconds
    // Overall results
    results: {
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      technicalScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      overallFeedback: String,
      strongTopics: [String],
      weakTopics: [String],
      recommendations: [String],
      grade: {
        type: String,
        enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
        default: "F",
      },
    },
    // Resume snapshot used for this interview
    resumeSnapshot: {
      skills: [String],
      projects: [String],
      internships: [String],
      achievements: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
interviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Interview", interviewSchema);
