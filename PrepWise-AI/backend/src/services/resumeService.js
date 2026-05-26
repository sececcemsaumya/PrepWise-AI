const pdfParse = require("pdf-parse");
const fs = require("fs");
const { parseResume } = require("./geminiService");

/**
 * Extract text from PDF file or Buffer
 */
const extractTextFromPDF = async (fileInput) => {
  try {
    const dataBuffer = Buffer.isBuffer(fileInput) ? fileInput : fs.readFileSync(fileInput);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Process uploaded resume - extract text and parse with AI
 */
const processResume = async (fileInput, fileName) => {
  // Extract raw text from PDF
  const rawText = await extractTextFromPDF(fileInput);

  if (!rawText || rawText.trim().length < 50) {
    throw new Error("Could not extract meaningful text from the PDF. Please ensure the PDF contains readable text.");
  }

  // Use Gemini to parse and structure the resume data
  const parsedData = await parseResume(rawText);

  return {
    fileName,
    filePath: Buffer.isBuffer(fileInput) ? "in-memory" : fileInput,
    uploadedAt: new Date(),
    parsedData: {
      ...parsedData,
      rawText: rawText.substring(0, 5000), // Store first 5000 chars
    },
  };
};

/**
 * Delete old resume file
 */
const deleteResumeFile = (filePath) => {
  try {
    if (filePath && filePath !== "in-memory" && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting resume file:", error.message);
  }
};

module.exports = { processResume, extractTextFromPDF, deleteResumeFile };
