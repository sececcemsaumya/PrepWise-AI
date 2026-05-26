const express = require("express");
const router = express.Router();
const { uploadResume, getResume, deleteResume } = require("../controllers/resumeController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// All routes are protected
router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/", getResume);
router.delete("/", deleteResume);

module.exports = router;
