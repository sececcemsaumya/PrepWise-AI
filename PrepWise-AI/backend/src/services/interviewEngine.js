/**
 * Interview Engine - Provides structured interview flows and topic management
 */

const INTERVIEW_FLOWS = {
  dsa: {
    phases: [
      { name: "Resume & Experience", topics: ["projects", "internships"], focus: "Understanding their DSA background", maxQuestions: 2 },
      { name: "Arrays & Strings", topics: ["arrays", "strings"], focus: "Basic data structures", maxQuestions: 3 },
      { name: "Linked Lists & Stacks", topics: ["linked_lists", "stacks_queues"], focus: "Linear data structures", maxQuestions: 2 },
      { name: "Trees & Graphs", topics: ["trees", "graphs"], focus: "Non-linear structures", maxQuestions: 3 },
      { name: "Algorithms", topics: ["sorting", "searching", "dp"], focus: "Algorithm design", maxQuestions: 3 },
      { name: "Problem Solving", topics: ["problem_solving"], focus: "Real-world applications", maxQuestions: 2 }
    ],
    maxDepthPerTopic: 3
  },
  
  mern: {
    phases: [
      { name: "Project Deep Dive", topics: ["projects"], focus: "Understanding their MERN projects", maxQuestions: 2 },
      { name: "MongoDB", topics: ["mongodb", "database"], focus: "Database design and queries", maxQuestions: 2 },
      { name: "Express.js", topics: ["express", "api"], focus: "Backend API development", maxQuestions: 2 },
      { name: "React", topics: ["react", "frontend"], focus: "Component architecture and state", maxQuestions: 3 },
      { name: "Node.js", topics: ["nodejs", "backend"], focus: "Server-side JavaScript", maxQuestions: 2 },
      { name: "System Design", topics: ["scalability", "authentication"], focus: "Architecture decisions", maxQuestions: 2 }
    ],
    maxDepthPerTopic: 3
  },
  
  "system-design": {
    phases: [
      { name: "Requirements Gathering", topics: ["projects"], focus: "Understanding system needs", maxQuestions: 1 },
      { name: "High-Level Architecture", topics: ["architecture"], focus: "System components", maxQuestions: 2 },
      { name: "Database Design", topics: ["mongodb", "database"], focus: "Data storage", maxQuestions: 2 },
      { name: "Caching & Performance", topics: ["redis", "scalability"], focus: "Optimization", maxQuestions: 2 },
      { name: "Security & Auth", topics: ["authentication"], focus: "Security considerations", maxQuestions: 2 },
      { name: "Trade-offs & Decisions", topics: ["problem_solving"], focus: "Design choices", maxQuestions: 2 }
    ],
    maxDepthPerTopic: 4
  },
  
  behavioral: {
    phases: [
      { name: "Work Style", topics: ["teamwork"], focus: "Team collaboration", maxQuestions: 2 },
      { name: "Problem Solving", topics: ["problem_solving"], focus: "Handling challenges", maxQuestions: 2 },
      { name: "Leadership", topics: ["projects"], focus: "Taking initiative", maxQuestions: 2 },
      { name: "Growth & Learning", topics: ["achievements"], focus: "Continuous improvement", maxQuestions: 2 }
    ],
    maxDepthPerTopic: 2
  },
  
  java: {
    phases: [
      { name: "Core Java", topics: ["java_core", "oop"], focus: "Fundamentals", maxQuestions: 3 },
      { name: "Collections & Generics", topics: ["collections"], focus: "Data structures", maxQuestions: 2 },
      { name: "Multithreading", topics: ["concurrency"], focus: "Threading", maxQuestions: 2 },
      { name: "JVM & Performance", topics: ["jvm"], focus: "Memory management", maxQuestions: 2 },
      { name: "Spring Framework", topics: ["spring"], focus: "Enterprise features", maxQuestions: 2 }
    ],
    maxDepthPerTopic: 3
  },
  
  python: {
    phases: [
      { name: "Python Fundamentals", topics: ["python_basics"], focus: "Core syntax", maxQuestions: 2 },
      { name: "Data Structures", topics: ["python_ds"], focus: "Built-in types", maxQuestions: 2 },
      { name: "Advanced Features", topics: ["decorators", "generators"], focus: "Advanced patterns", maxQuestions: 2 },
      { name: "Async Programming", topics: ["asyncio"], focus: "Concurrency", maxQuestions: 2 },
      { name: "Libraries & Tools", topics: ["libraries"], focus: "Ecosystem", maxQuestions: 2 }
    ],
    maxDepthPerTopic: 3
  },
  
  hr: {
    phases: [
      { name: "Introduction & Goals", topics: ["career_goals"], focus: "Career aspirations", maxQuestions: 2 },
      { name: "Experience & Achievements", topics: ["projects", "achievements"], focus: "Past work", maxQuestions: 2 },
      { name: "Culture & Fit", topics: ["teamwork", "values"], focus: "Company culture", maxQuestions: 2 },
      { name: "Logistics", topics: ["availability"], focus: "Practical matters", maxQuestions: 2 }
    ],
    maxDepthPerTopic: 2
  }
};

const getInterviewFlow = (category) => {
  return INTERVIEW_FLOWS[category] || INTERVIEW_FLOWS.dsa;
};

const getNextPhase = (category, currentPhase, performance) => {
  const flow = getInterviewFlow(category);
  const currentIndex = flow.phases.findIndex(p => p.name === currentPhase);
  
  // If performance is excellent, move faster
  if (performance.averageScore >= 8 && currentIndex < flow.phases.length - 1) {
    return flow.phases[currentIndex + 1].name;
  }
  
  // If performance is poor, stay in current phase
  if (performance.averageScore <= 4) {
    return currentPhase;
  }
  
  // Normal progression
  if (currentIndex >= 0 && currentIndex < flow.phases.length - 1) {
    // Check if we've asked enough questions in current phase
    const currentPhaseObj = flow.phases[currentIndex];
    const questionsAskedInPhase = performance.phaseQuestionCounts?.[currentPhase] || 0;
    
    if (questionsAskedInPhase >= currentPhaseObj.maxQuestions) {
      return flow.phases[currentIndex + 1].name;
    }
  }
  
  return currentPhase;
};

const getTopicForPhase = (category, phase, resumeData, askedTopics) => {
  const flow = getInterviewFlow(category);
  const phaseConfig = flow.phases.find(p => p.name === phase);
  
  if (!phaseConfig) return "general";
  
  // Find an unasked topic in this phase
  for (const topic of phaseConfig.topics) {
    if (!askedTopics.includes(topic)) {
      return topic;
    }
  }
  
  // If all topics asked, return first topic
  return phaseConfig.topics[0];
};

const getQuestionDepth = (topic, performance, maxDepth) => {
  const topicPerformance = performance.topicScores?.[topic] || 5;
  const currentDepth = performance.topicDepth?.[topic] || 1;
  
  // If they're doing well, go deeper
  if (topicPerformance >= 7 && currentDepth < maxDepth) {
    return currentDepth + 1;
  }
  
  // If they're struggling, stay at same depth
  if (topicPerformance <= 4) {
    return Math.max(1, currentDepth - 1);
  }
  
  return currentDepth;
};

const shouldTransitionTopic = (topic, performance, phaseConfig) => {
  const questionsAsked = performance.topicQuestionCounts?.[topic] || 0;
  const topicPerformance = performance.topicScores?.[topic] || 5;
  
  // Move on if we've asked enough questions
  if (questionsAsked >= 2) {
    return true;
  }
  
  // Move on if performance is very good or very bad
  if (topicPerformance >= 8 || topicPerformance <= 3) {
    return true;
  }
  
  return false;
};

module.exports = {
  INTERVIEW_FLOWS,
  getInterviewFlow,
  getNextPhase,
  getTopicForPhase,
  getQuestionDepth,
  shouldTransitionTopic
};