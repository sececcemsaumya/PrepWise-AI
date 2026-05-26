const express = require("express");
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getInterviewHistory,
  getAnalytics,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.post("/start", startInterview);
router.get("/history", getInterviewHistory);
router.get("/analytics", getAnalytics);
router.get("/:sessionId", getInterview);
router.post("/:sessionId/answer", submitAnswer);
router.post("/:sessionId/complete", completeInterview);

module.exports = router;
