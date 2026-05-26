const User = require("../models/User");
const { processResume, deleteResumeFile } = require("../services/resumeService");
const { redisSet, redisDel } = require("../config/redis");

/**
 * @desc    Upload and parse resume
 * @route   POST /api/resume/upload
 * @access  Private
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // Delete old resume file if exists
    const user = await User.findById(req.user.id);
    if (user.resume?.filePath) {
      deleteResumeFile(user.resume.filePath);
    }

    // Process the uploaded resume using buffer or path
    const fileInput = req.file.buffer || req.file.path;
    const resumeData = await processResume(fileInput, req.file.originalname);

    // Update user with resume data
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { resume: resumeData },
      { new: true }
    );

    // Cache parsed resume data in Redis (1 hour TTL)
    await redisSet(
      `resume:${req.user.id}`,
      JSON.stringify(resumeData.parsedData),
      3600
    );

    // Invalidate any cached questions for this user
    await redisDel(`questions:${req.user.id}`);

    res.json({
      success: true,
      message: "Resume uploaded and analyzed successfully",
      resume: {
        fileName: resumeData.fileName,
        uploadedAt: resumeData.uploadedAt,
        parsedData: {
          skills: resumeData.parsedData.skills,
          technologies: resumeData.parsedData.technologies,
          projects: resumeData.parsedData.projects,
          internships: resumeData.parsedData.internships,
          achievements: resumeData.parsedData.achievements,
          education: resumeData.parsedData.education,
        },
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    // Clean up uploaded file on error if it was saved on disk
    if (req.file?.path) {
      deleteResumeFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process resume",
    });
  }
};

/**
 * @desc    Get current user's resume data
 * @route   GET /api/resume
 * @access  Private
 */
const getResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.resume?.fileName) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload your resume.",
      });
    }

    res.json({
      success: true,
      resume: {
        fileName: user.resume.fileName,
        uploadedAt: user.resume.uploadedAt,
        parsedData: user.resume.parsedData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch resume" });
  }
};

/**
 * @desc    Delete resume
 * @route   DELETE /api/resume
 * @access  Private
 */
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.resume?.fileName) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    // Delete file from disk
    deleteResumeFile(user.resume.filePath);

    // Remove from database
    await User.findByIdAndUpdate(req.user.id, { $unset: { resume: 1 } });

    // Remove from Redis cache
    await redisDel(`resume:${req.user.id}`);

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete resume" });
  }
};

module.exports = { uploadResume, getResume, deleteResume };
