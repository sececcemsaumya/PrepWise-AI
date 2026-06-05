const { v4: uuidv4 } = require("uuid");
const Interview = require("../models/Interview");
const User = require("../models/User");
const {
  generateFirstQuestion,
  generateNextQuestion,
  evaluateAnswer,
  generateOverallFeedback,
} = require("../services/geminiService");
const { redisGet, redisSet, redisDel } = require("../config/redis");

const getSessionMemory = async (sessionId) => {
  const data = await redisGet(`memory:${sessionId}`);
  if (data) return JSON.parse(data);
  
  return {
    conversationHistory: [],
    askedQuestions: [],
    coveredTopics: [],
    currentTopic: "",
    interviewPhase: "Discussion",
    difficulty: "intermediate",
    candidateStrengths: [],
    candidateWeaknesses: [],
    previousScores: [],
    questionCount: 0,
    topicQuestionCounts: {},
    phaseQuestionCounts: {},
  };
};

const saveSessionMemory = async (sessionId, memory) => {
  await redisSet(`memory:${sessionId}`, JSON.stringify(memory), 7200);
};

const startInterview = async (req, res) => {
  try {
    const { category, role = "general", difficulty = "intermediate", totalQuestions } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: "Interview category is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user.resume?.parsedData) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume before starting an interview",
      });
    }

    const resumeData = user.resume.parsedData;
    const config = { category, role, difficulty, totalQuestions: totalQuestions ? parseInt(totalQuestions) : 6, candidateName: user.name };

    const firstQuestion = await generateFirstQuestion(resumeData, config);
    
    const sessionId = uuidv4();

    const memory = {
      conversationHistory: [{ role: "assistant", content: firstQuestion.question }],
      askedQuestions: [firstQuestion.question],
      coveredTopics: [firstQuestion.topic],
      currentTopic: firstQuestion.topic,
      interviewPhase: firstQuestion.phase || "Discussion",
      difficulty: difficulty,
      category: category,
      candidateStrengths: [],
      candidateWeaknesses: [],
      previousScores: [],
      questionCount: 1,
      topicQuestionCounts: { [firstQuestion.topic]: 1 },
      phaseQuestionCounts: { [firstQuestion.phase || "Discussion"]: 1 },
    };
    
    await saveSessionMemory(sessionId, memory);

    const interview = await Interview.create({
      userId: req.user.id,
      sessionId,
      config,
      questions: [{
        questionId: firstQuestion.questionId,
        question: firstQuestion.question,
        type: firstQuestion.type,
        topic: firstQuestion.topic,
        phase: firstQuestion.phase,
        basedOn: firstQuestion.basedOn,
        answer: "",
        evaluation: null,
      }],
      status: "active",
      startedAt: new Date(),
      resumeSnapshot: {
        skills: resumeData.skills || [],
        projects: resumeData.projects || [],
        internships: resumeData.internships || [],
        achievements: resumeData.achievements || [],
      },
    });

    res.status(201).json({
      success: true,
      message: "Interview started successfully!",
      interview: {
        sessionId: interview.sessionId,
        config: interview.config,
        currentQuestion: {
          questionId: firstQuestion.questionId,
          question: firstQuestion.question,
          type: firstQuestion.type,
          topic: firstQuestion.topic,
          phase: firstQuestion.phase,
          basedOn: firstQuestion.basedOn,
        },
        status: interview.status,
        startedAt: interview.startedAt,
      },
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to start interview" });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer, timeSpent } = req.body;

    if (!answer) {
      return res.status(400).json({ success: false, message: "Answer is required" });
    }

    const interview = await Interview.findOne({ sessionId, userId: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview session not found" });
    if (interview.status !== "active") return res.status(400).json({ success: false, message: "Interview session is not active" });

    const currentQuestionIndex = interview.currentQuestionIndex;
    if (currentQuestionIndex >= interview.questions.length) {
      return res.status(400).json({ success: false, message: "No active question found" });
    }

    const question = interview.questions[currentQuestionIndex];
    const user = await User.findById(req.user.id);
    const resumeData = user.resume?.parsedData || {};
    
    const memory = await getSessionMemory(sessionId);
    
    memory.conversationHistory.push({ role: "user", content: answer });
    
    const previousQuestions = interview.questions
      .slice(0, currentQuestionIndex)
      .map((q, idx) => `${idx + 1}. ${q.question}`)
      .join("\n") || "None";
    
    const previousAnswers = interview.questions
      .slice(0, currentQuestionIndex)
      .map((q, idx) => `${idx + 1}. ${q.answer}`)
      .join("\n") || "None";

    const evaluation = await evaluateAnswer(question.question, answer, {
      category: interview.config.category,
      difficulty: memory.difficulty,
      previousQuestions,
      previousAnswers,
    });
    
    memory.previousScores.push(evaluation.score);
    
    if (evaluation.strengths?.length) {
      evaluation.strengths.forEach(strength => {
        if (!memory.candidateStrengths.includes(strength)) {
          memory.candidateStrengths.push(strength);
        }
      });
    }
    
    if (evaluation.improvements?.length) {
      evaluation.improvements.forEach(improvement => {
        if (!memory.candidateWeaknesses.includes(improvement)) {
          memory.candidateWeaknesses.push(improvement);
        }
      });
    }
    
    interview.questions[currentQuestionIndex].answer = answer;
    interview.questions[currentQuestionIndex].evaluation = evaluation;
    interview.questions[currentQuestionIndex].answeredAt = new Date();
    interview.questions[currentQuestionIndex].timeSpent = timeSpent || 0;
    
    const MAX_QUESTIONS = interview.config.totalQuestions || 6;
    // All interviews are adaptive and unlimited, completed only when candidate chooses to end.
    const shouldComplete = false;
    
    if (shouldComplete) {
      interview.status = "ready_to_complete";
      await interview.save();
      await saveSessionMemory(sessionId, memory);
      
      return res.json({
        success: true,
        message: "Great interview! Ready to see your results.",
        evaluation: evaluation,
        isComplete: true,
        sessionState: {
          questionsAnswered: memory.questionCount,
          averageScore: memory.previousScores.reduce((a,b) => a+b, 0) / memory.previousScores.length,
          strengths: memory.candidateStrengths.slice(0, 3),
          weaknesses: memory.candidateWeaknesses.slice(0, 3),
        },
      });
    }
    
    const nextQuestionData = await generateNextQuestion(
      resumeData, 
      interview.config, 
      memory,
      evaluation
    );
    
    const newQuestion = {
      questionId: nextQuestionData.questionId,
      question: nextQuestionData.question,
      type: nextQuestionData.type,
      topic: nextQuestionData.topic,
      phase: nextQuestionData.phase,
      basedOn: nextQuestionData.basedOn,
      answer: "",
      evaluation: null,
      isFollowUp: nextQuestionData.isFollowUp || false,
    };
    
    interview.questions.push(newQuestion);
    interview.currentQuestionIndex = currentQuestionIndex + 1;
    await interview.save();
    
    memory.conversationHistory.push({ role: "assistant", content: nextQuestionData.question });
    memory.askedQuestions.push(nextQuestionData.question);
    memory.questionCount++;
    
    if (!memory.coveredTopics.includes(nextQuestionData.topic)) {
      memory.coveredTopics.push(nextQuestionData.topic);
    }
    memory.currentTopic = nextQuestionData.topic;
    memory.topicQuestionCounts[nextQuestionData.topic] = (memory.topicQuestionCounts[nextQuestionData.topic] || 0) + 1;
    
    memory.interviewPhase = nextQuestionData.phase || memory.interviewPhase || "Discussion";
    memory.phaseQuestionCounts = memory.phaseQuestionCounts || {};
    memory.phaseQuestionCounts[memory.interviewPhase] = (memory.phaseQuestionCounts[memory.interviewPhase] || 0) + 1;

    let newDifficulty = nextQuestionData.difficulty || memory.difficulty;
    if (!nextQuestionData.difficulty) {
      const recentScores = memory.previousScores.slice(-3);
      const avgRecent = recentScores.reduce((a,b) => a+b, 0) / recentScores.length;
      if (avgRecent >= 8 && memory.difficulty === "intermediate") newDifficulty = "advanced";
      else if (avgRecent <= 4 && memory.difficulty === "intermediate") newDifficulty = "beginner";
    }
    memory.difficulty = newDifficulty;
    
    await saveSessionMemory(sessionId, memory);
    
    res.json({
      success: true,
      message: nextQuestionData.isFollowUp ? "Following up on your answer..." : "Here's the next question.",
      evaluation: evaluation,
      nextQuestion: {
        questionId: newQuestion.questionId,
        question: newQuestion.question,
        type: newQuestion.type,
        topic: newQuestion.topic,
        phase: newQuestion.phase,
        basedOn: newQuestion.basedOn,
        isFollowUp: newQuestion.isFollowUp || false,
      },
      nextQuestionIndex: currentQuestionIndex + 1,
      isLastQuestion: false,
      sessionState: {
        currentTopic: memory.currentTopic,
        questionsAnswered: memory.questionCount,
        averageScore: memory.previousScores.reduce((a,b) => a+b, 0) / memory.previousScores.length,
        difficulty: memory.difficulty,
        isFollowUp: nextQuestionData.isFollowUp || false,
      },
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to submit answer" });
  }
};

const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const interview = await Interview.findOne({ sessionId, userId: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview session not found" });

    if (interview.status === "completed") {
      return res.json({ success: true, message: "Interview already completed", results: interview.results });
    }

    const answered = interview.questions.filter((q) => q.answer && q.answer.trim().length > 20);
    
    if (answered.length === 0) {
      interview.status = "completed";
      interview.completedAt = new Date();
      interview.duration = Math.floor((new Date() - interview.startedAt) / 1000);
      interview.results = {
        averageScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        overallFeedback: "This interview session was completed without any substantial answers.",
        strongTopics: [],
        weakTopics: [],
        recommendations: ["Ensure you attempt and answer questions to receive detailed feedback."],
        grade: "F",
      };
      await interview.save();
      await redisDel(`memory:${sessionId}`);
      
      return res.json({
        success: true,
        message: "Interview completed with no answers.",
        results: interview.results,
        duration: interview.duration,
        questionsAnswered: 0,
      });
    }
    
    const avgScore = answered.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / answered.length;
    const avgTech = answered.reduce((sum, q) => sum + (q.evaluation?.technicalAccuracy || q.evaluation?.score || 0), 0) / answered.length;
    const avgComm = answered.reduce((sum, q) => sum + (q.evaluation?.communication || q.evaluation?.clarity || 0), 0) / answered.length;

    const overallFeedback = await generateOverallFeedback({
      questions: answered,
      config: interview.config,
      resumeSnapshot: interview.resumeSnapshot,
    });

    interview.status = "completed";
    interview.completedAt = new Date();
    interview.duration = Math.floor((new Date() - interview.startedAt) / 1000);
    interview.results = {
      averageScore: Math.round(avgScore * 10) / 10,
      technicalScore: Math.round(avgTech * 10) / 10,
      communicationScore: Math.round(avgComm * 10) / 10,
      overallFeedback: overallFeedback.overallFeedback,
      strongTopics: overallFeedback.strongTopics || [],
      weakTopics: overallFeedback.weakTopics || [],
      recommendations: overallFeedback.recommendations || [],
      grade: overallFeedback.grade || getGrade(avgScore),
      performanceSummary: overallFeedback.performanceSummary || {},
      questionBreakdown: answered.map((q, i) => ({
        number: i + 1,
        question: q.question,
        topic: q.topic,
        score: q.evaluation?.score,
        feedback: q.evaluation?.feedback,
        strengths: q.evaluation?.strengths,
        improvements: q.evaluation?.improvements,
      })),
    };

    await interview.save();

    const user = await User.findById(req.user.id);
    const newTotal = user.stats.totalInterviews + 1;
    const newAvg = (user.stats.averageScore * user.stats.totalInterviews + avgScore) / newTotal;

    await User.findByIdAndUpdate(req.user.id, {
      "stats.totalInterviews": newTotal,
      "stats.averageScore": Math.round(newAvg * 10) / 10,
      "stats.bestScore": Math.max(user.stats.bestScore, avgScore),
      "stats.totalQuestions": user.stats.totalQuestions + answered.length,
    });

    await redisDel(`memory:${sessionId}`);

    res.json({
      success: true,
      message: "Interview completed successfully!",
      results: interview.results,
      duration: interview.duration,
      questionsAnswered: answered.length,
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to complete interview" });
  }
};

const getGrade = (score) => {
  if (score >= 8.5) return "A";
  if (score >= 7.5) return "B";
  if (score >= 6.5) return "C";
  if (score >= 5.5) return "D";
  return "F";
};

const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ sessionId: req.params.sessionId, userId: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: "Interview session not found" });
    
    const memory = await getSessionMemory(req.params.sessionId);
    
    res.json({ 
      success: true, 
      interview: {
        ...interview.toObject(),
        conversationHistory: memory.conversationHistory,
        sessionState: {
          currentTopic: memory.currentTopic,
          questionsAnswered: memory.questionCount,
          averageScore: memory.previousScores.length > 0 
            ? memory.previousScores.reduce((a,b) => a+b, 0) / memory.previousScores.length 
            : 0,
        }
      }
    });
  } catch (error) {
    console.error("Get interview error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch interview" });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find({
      userId: req.user.id,
      status: "completed",
    }).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .select("sessionId config results duration createdAt completedAt");

    const total = await Interview.countDocuments({
      userId: req.user.id,
      status: "completed",
    });

    res.json({ success: true, interviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch interview history" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id, status: "completed" }).sort({ createdAt: 1 });

    if (interviews.length === 0) {
      return res.json({ success: true, analytics: { 
        totalInterviews: 0, 
        averageScore: 0, 
        bestScore: 0, 
        totalQuestions: 0,
        recentInterviews: [],
        scoreHistory: [],
        categoryBreakdown: {},
        topicPerformance: {},
        strongTopics: [],
        weakTopics: [],
        recommendations: ["Complete your first interview to get insights!"]
      }});
    }

    const scores = interviews.map((i) => i.results?.averageScore || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Calculate category breakdown
    const categoryBreakdown = {};
    interviews.forEach((i) => {
      const cat = i.config?.category || "general";
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, totalScore: 0 };
      }
      categoryBreakdown[cat].count += 1;
      categoryBreakdown[cat].totalScore += i.results?.averageScore || 0;
    });
    Object.keys(categoryBreakdown).forEach((cat) => {
      categoryBreakdown[cat].averageScore = categoryBreakdown[cat].totalScore / categoryBreakdown[cat].count;
    });

    // Calculate topic performance
    const topicPerformance = {};
    interviews.forEach((i) => {
      i.questions.forEach((q) => {
        if (q.answer && q.topic && q.evaluation) {
          const t = q.topic;
          if (!topicPerformance[t]) {
            topicPerformance[t] = { count: 0, totalScore: 0 };
          }
          topicPerformance[t].count += 1;
          topicPerformance[t].totalScore += q.evaluation.score || 0;
        }
      });
    });
    Object.keys(topicPerformance).forEach((t) => {
      topicPerformance[t].averageScore = topicPerformance[t].totalScore / topicPerformance[t].count;
    });

    // Extract strong and weak topics
    const sortedTopics = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      averageScore: data.averageScore,
    })).sort((a, b) => b.averageScore - a.averageScore);

    const strongTopics = sortedTopics.filter((t) => t.averageScore >= 7).map((t) => t.topic);
    const weakTopics = sortedTopics.filter((t) => t.averageScore < 7).map((t) => t.topic);

    // Extract unique recommendations
    let recommendations = [];
    interviews.forEach((i) => {
      if (i.results?.recommendations) {
        recommendations.push(...i.results.recommendations);
      }
    });
    recommendations = [...new Set(recommendations)].slice(0, 5);
    if (recommendations.length === 0) {
      recommendations = ["Continue practicing in different categories to get personalized recommendations."];
    }

    res.json({
      success: true,
      analytics: {
        totalInterviews: interviews.length,
        averageScore: Math.round(avgScore * 10) / 10,
        bestScore: Math.round(Math.max(...scores) * 10) / 10,
        totalQuestions: interviews.reduce((sum, i) => sum + (i.questions.filter((q) => q.answer).length || 0), 0),
        recentInterviews: interviews.slice(-5).reverse().map((i) => ({
          category: i.config?.category || "general",
          difficulty: i.config?.difficulty || "intermediate",
          duration: i.duration,
          date: i.completedAt || i.createdAt,
          score: i.results?.averageScore || 0,
          grade: i.results?.grade,
        })),
        scoreHistory: interviews.map((i) => ({
          score: i.results?.averageScore || 0,
          date: i.completedAt || i.createdAt,
          category: i.config?.category || "general",
        })),
        categoryBreakdown,
        topicPerformance,
        strongTopics,
        weakTopics,
        recommendations,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

module.exports = { 
  startInterview, 
  submitAnswer, 
  completeInterview, 
  getInterview, 
  getInterviewHistory, 
  getAnalytics 
};
// Trigger nodemon restart