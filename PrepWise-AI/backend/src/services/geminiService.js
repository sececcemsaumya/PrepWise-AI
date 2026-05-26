const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.warn("⚠️ Gemini API key not configured. Using fallback mode.");
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 1024 },
    });
    console.log("✅ Gemini AI initialized");
    return true;
  } catch (error) {
    console.warn(`⚠️ Gemini initialization failed: ${error.message}`);
    return false;
  }
};

const cleanJSON = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let jsonStr = match[0];
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
  return jsonStr;
};

const buildResumeContext = (resumeData) => {
  const sections = [];
  
  if (resumeData.skills?.length) {
    sections.push(`SKILLS: ${resumeData.skills.slice(0, 10).join(", ")}`);
  }
  
  if (resumeData.projects?.length) {
    sections.push("\nPROJECTS:");
    resumeData.projects.slice(0, 3).forEach(p => {
      sections.push(`- ${p.name}: ${p.description || "No description"}`);
      if (p.technologies?.length) sections.push(`  Technologies: ${p.technologies.join(", ")}`);
    });
  }
  
  return sections.join("\n");
};

// ==================== DSA - PURE ALGORITHM QUESTIONS ONLY ====================
const DSA_QUESTIONS = {
  beginner: [
    "Given an array of integers, find the maximum element. What is the time complexity?",
    "Write a function to reverse a string. Analyze the time and space complexity.",
    "Given a string, check if it's a palindrome. Explain your approach.",
    "Find the factorial of a number using recursion. What's the base case?",
    "Given an array, find the sum of all elements. What's the time complexity?"
  ],
  intermediate: [
    "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. Solve in O(n) time.",
    "Given a string, find the length of the longest substring without repeating characters.",
    "Given two strings s and t, return true if t is an anagram of s, false otherwise.",
    "Given an array, find the maximum sum of any contiguous subarray (Kadane's algorithm).",
    "Given an array of integers, find the first non-repeating element.",
    "Given a linked list, detect if it has a cycle.",
    "Implement a function to check if a binary tree is balanced."
  ],
  advanced: [
    "Implement an LRU (Least Recently Used) cache with get() and put() operations in O(1) time.",
    "Find the longest palindromic substring in a given string.",
    "Given a linked list, find the node where a cycle begins.",
    "Find the median of two sorted arrays in O(log(min(m,n))) time.",
    "Given an array of integers, find the longest increasing subsequence.",
    "Implement a trie (prefix tree) with insert, search, and startsWith methods."
  ]
};

// Keep track of asked questions to avoid repetition
let askedDSAQuestions = [];

const getRandomDSAQuestion = (difficulty, questionsAsked = []) => {
  let level = "intermediate";
  if (difficulty === "beginner") level = "beginner";
  else if (difficulty === "advanced") level = "advanced";
  
  const questions = DSA_QUESTIONS[level];
  
  // Get questions not asked yet
  const availableQuestions = questions.filter(q => {
    return !questionsAsked.some(aq => aq.toLowerCase().includes(q.toLowerCase().trim()));
  });
  
  let selectedQuestion;
  if (availableQuestions.length > 0) {
    selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  } else {
    selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
  }
  
  return {
    question: selectedQuestion + "\n\nExplain your approach and analyze the time and space complexity.",
    topic: level === "beginner" ? "Arrays/Basics" : level === "advanced" ? "Advanced Algorithms" : "Data Structures & Algorithms"
  };
};

// ==================== SYSTEM DESIGN QUESTIONS ====================
const SYSTEM_DESIGN_QUESTIONS = [
  "Design a URL shortener service like TinyURL. Discuss the database schema, API design, and scalability considerations.",
  "How would you design a chat messaging system like WhatsApp? Consider real-time messaging, offline messages, and scalability.",
  "Design a video streaming platform like YouTube. Discuss CDN, video processing, and storage.",
  "How would you design a rate limiter for an API? Discuss different algorithms and their trade-offs.",
  "Design a social media news feed system like Facebook/Twitter. Consider feed generation, caching, and delivery.",
  "How would you design a ride-sharing system like Uber? Consider matching algorithm, location tracking, and pricing.",
  "Design a distributed key-value store. Discuss consistency, partitioning, and replication strategies.",
  "How would you design a web crawler for search engines? Discuss politeness, scalability, and storage."
];

const getRandomSystemDesignQuestion = () => {
  const randomIndex = Math.floor(Math.random() * SYSTEM_DESIGN_QUESTIONS.length);
  return {
    question: SYSTEM_DESIGN_QUESTIONS[randomIndex] + "\n\nThink out loud, ask clarifying questions, and walk me through your reasoning and trade-offs.",
    topic: "System Design"
  };
};

const MERN_FALLBACK_QUESTIONS = [
  "Can you walk me through the architecture of a MERN stack application? How do the client, server, and database communicate?",
  "How do you design and structure your MongoDB schemas? What is the difference between embedding documents and referencing them?",
  "What is the role of Express.js middleware? Give an example of custom middleware you've written.",
  "How does React's Virtual DOM work, and how does it optimize UI rendering?",
  "What are React Hooks? Explain the difference between useEffect, useMemo, and useCallback.",
  "Explain Node.js event-driven, non-blocking I/O model. How does the event loop work?",
  "How do you handle user authentication and authorization in a MERN application? Explain JWT structure.",
  "What are some backend optimization techniques you would use for a Node.js/Express API (e.g. indexing, caching)?",
  "How do you manage application state in a React frontend? When would you use Context API vs. Redux?",
  "How do you handle file uploads in a MERN stack application? What packages or storage solutions do you use?"
];

const JAVA_FALLBACK_QUESTIONS = [
  "What are the core pillars of Object-Oriented Programming (OOP) and how are they implemented in Java?",
  "Explain the Java Collections Framework. What is the difference between HashMap, TreeMap, and LinkedHashMap?",
  "How does memory management work in Java? Explain the JVM Heap and Stack memory, and how Garbage Collection operates.",
  "What is the difference between an Interface and an Abstract Class in Java? When would you use one over the other?",
  "How do you handle multithreading and concurrency in Java? Explain the difference between Runnable and Thread.",
  "What is the Spring Framework? Explain Dependency Injection (DI) and Inversion of Control (IoC).",
  "How does Spring Boot auto-configuration work under the hood?",
  "Explain exception handling in Java. What is the difference between checked and unchecked exceptions?",
  "What are Java Streams and Lambda Expressions? How do they improve code readability and performance?",
  "How do you implement transaction management in Spring Boot? What does the @Transactional annotation do?"
];

const PYTHON_FALLBACK_QUESTIONS = [
  "What are Python decorators? How do you write a custom decorator?",
  "Explain the difference between List, Tuple, Set, and Dictionary in Python. What are their time complexities for basic operations?",
  "How does memory management work in Python? Explain reference counting and garbage collection.",
  "What is the difference between a Generator and an Iterator in Python? What keyword is used to create a generator?",
  "Explain the Global Interpreter Lock (GIL) in Python. How does it affect CPU-bound and I/O-bound multithreaded tasks?",
  "How do you write asynchronous code in Python using asyncio? What is the role of async and await?",
  "What is the difference between deep copy and shallow copy in Python?",
  "Explain how list comprehensions and generator expressions work, and discuss their memory footprint differences.",
  "What are Python magic/dunder methods (like __str__, __init__, __repr__)? Give an example of how you've used them.",
  "How do you handle errors and exceptions in Python? Explain the purpose of try, except, else, and finally blocks."
];

const HR_FALLBACK_QUESTIONS = [
  "Can you tell me about yourself and walk me through your professional background?",
  "Why are you interested in joining our company? What aspects of our vision or culture align with your goals?",
  "Where do you see yourself professionally in the next three to five years?",
  "What are your key professional strengths, and what is one area you are actively working to improve?",
  "Describe your ideal work environment. Do you prefer working independently or in a close-knit team?",
  "How do you handle tight deadlines or pressure when multiple projects demand your attention?",
  "What are your compensation expectations for this role, and what is your availability to start?",
  "How do you stay motivated and keep your skills up to date in a rapidly changing industry?",
  "Why should we hire you for this role over other candidates?",
  "Do you have any questions for me about the company, the team, or the day-to-day responsibilities of this position?"
];

const BEHAVIORAL_FALLBACK_QUESTIONS = [
  "Describe a time when you faced a major technical challenge. How did you identify the issue and resolve it?",
  "Tell me about a time you had a disagreement or conflict with a team member or stakeholder. How did you resolve it?",
  "Can you give an example of a project where you had to adapt quickly to changing requirements? What was your approach?",
  "Describe a situation where you had to work with a difficult coworker or manager. How did you handle that relationship?",
  "Tell me about a time when you made a mistake on a project. How did you address it, and what did you learn from the experience?",
  "Describe a time when you took the initiative to improve a process or system at work. What was the impact?",
  "Give an example of a goal you set and how you achieved it. What obstacles did you encounter along the way?",
  "Tell me about a time you had to explain a complex technical concept to a non-technical stakeholder. How did you do it?",
  "Describe a time when you were overloaded with tasks. How did you prioritize your workload and manage expectations?",
  "Tell me about a time you had to deliver bad news to a client or team lead. How did you communicate the message?"
];

const GENERAL_FALLBACK_QUESTIONS = [
  "Tell me about the most complex technical project you've worked on. What was your role and the key design decisions?",
  "How do you go about learning a new programming language, framework, or tool when required for a project?",
  "What is your approach to testing and code quality? How do you ensure your code is maintainable and robust?",
  "Explain the software development lifecycle (SDLC) models you are most familiar with. How do you participate in them?",
  "How do you handle debugging when you encounter a complex issue in production without clear logs?",
  "Describe a time when you had to optimize an application's performance. What tools and techniques did you use?",
  "What is your experience with version control systems like Git? How do you handle merge conflicts or branching strategies?",
  "How do you ensure security best practices are followed during the development of web applications?",
  "What is your preference regarding monolithic architectures versus microservices? What trade-offs do you see?",
  "Describe a project where you had to work with a legacy codebase. How did you navigate and improve it?"
];

// ==================== MERN - PROJECT BASED ========================
const getMERNQuestion = (resumeData) => {
  const projects = resumeData.projects || [];
  const project = projects.length > 0 ? projects[0] : null;
  
  if (project) {
    return {
      question: `I see you worked on "${project.name}". Can you walk me through the architecture? How did you structure the MongoDB schemas, what API endpoints did you create, and how did you handle state management in React?`,
      topic: project.name,
      basedOn: project.name
    };
  }
  
  return {
    question: "Tell me about a MERN stack project you've built. Walk me through the architecture, database design, API structure, and frontend state management.",
    topic: "MERN Stack",
    basedOn: "Experience"
  };
};

const getMERNFollowUp = (lastAnswer, lastScore, projectName) => {
  if (lastScore >= 7) {
    return {
      question: `Great insights about "${projectName}"! How did you optimize performance? What specific techniques did you use for reducing database queries and improving React rendering?`,
      topic: projectName,
      isFollowUp: true
    };
  } else if (lastScore <= 4) {
    return {
      question: `Let's focus on "${projectName}". Can you explain how you connected MongoDB to your Express backend? What package did you use and how did you define your schemas?`,
      topic: projectName,
      isFollowUp: true
    };
  } else {
    return {
      question: `Interesting! For "${projectName}", what was the most challenging bug you faced and how did you debug it?`,
      topic: projectName,
      isFollowUp: true
    };
  }
};

// ==================== GENERAL QUESTIONS ====================
const getGeneralQuestion = (resumeData) => {
  const projects = resumeData.projects || [];
  const project = projects.length > 0 ? projects[0] : null;
  
  if (project) {
    return {
      question: `Tell me about your project "${project.name}". What was your specific role and what was the most challenging technical problem you solved?`,
      topic: project.name,
      basedOn: project.name
    };
  }
  
  return {
    question: "Tell me about your most significant technical achievement. What was your role and what made it challenging?",
    topic: "Experience",
    basedOn: "General"
  };
};

// ==================== MAIN GENERATION FUNCTIONS ====================
const generateFirstQuestion = async (resumeData, config) => {
  const { category, role = "general", difficulty = "intermediate" } = config;
  
  console.log(`Generating first question for category: ${category}, difficulty: ${difficulty}`);
  
  if (genAI && model) {
    try {
      const resumeContext = buildResumeContext(resumeData);
      
      const categoryNames = {
        dsa: "Data Structures & Algorithms (DSA)",
        mern: "MERN Stack (MongoDB, Express, React, Node.js)",
        "system-design": "System Design & Architecture",
        hr: "Human Resources (HR) & Cultural Fit",
        java: "Java Technical (Core Java, OOP, Spring)",
        python: "Python Technical",
        behavioral: "Behavioral & Situational",
        "role-based": "Role-Specific Technical",
        general: "General Technical"
      };
      const categoryName = categoryNames[category] || "Technical";

      const systemPrompt = `You are an AI mock interviewer conducting a professional interview.
Category: ${categoryName}
Target Role: ${role}
Difficulty Level: ${difficulty}

Candidate Resume Context:
${resumeContext || "No resume details available."}

Generate the very FIRST question of the interview.
Guidelines:
1. Make it a professional, welcoming starting question.
2. If it's a technical category (like Java, Python, MERN), start by asking about a relevant project on their resume or their experience with that technology.
3. If it's DSA, start with a coding/algorithmic problem matching the difficulty level.
4. If it's Behavioral/HR, start with a situational/work-style question or career goals.
5. Identify the initial Phase of the interview (e.g., "Resume & Experience", "Introduction & Goals", "Project Discussion", etc.).
6. Specify what the question is based on (e.g. project name, skill, or "General").

Return STRICT JSON format:
{
  "question": "string (the question text)",
  "topic": "string (specific topic e.g. Arrays, React, OOP, teamwork)",
  "phase": "string (the current phase of the interview)",
  "basedOn": "string (e.g. the project name, skill name, or 'General')"
}`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
      
      const text = result.response.text();
      const jsonStr = cleanJSON(text);
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        if (data.question) {
          return {
            questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            question: data.question,
            type: category === "behavioral" || category === "hr" ? "behavioral" : "technical",
            topic: data.topic || category,
            phase: data.phase || "Introduction",
            basedOn: data.basedOn || "General",
            difficulty: difficulty,
          };
        }
      }
    } catch (err) {
      console.warn("⚠️ Dynamic generateFirstQuestion failed, falling back to static questions:", err.message);
    }
  }

  // Fallback to static questions
  // DSA - PURE ALGORITHM
  if (category === "dsa") {
    askedDSAQuestions = []; // Reset for new interview
    const { question, topic } = getRandomDSAQuestion(difficulty);
    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      question: question,
      type: "technical",
      topic: topic,
      phase: "Coding Problem",
      basedOn: null,
      difficulty: difficulty,
    };
  }
  
  // System Design
  if (category === "system-design") {
    const { question, topic } = getRandomSystemDesignQuestion();
    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      question: question,
      type: "technical",
      topic: topic,
      phase: "System Design",
      basedOn: null,
      difficulty: difficulty,
    };
  }
  
  // MERN Stack
  if (category === "mern") {
    const { question, topic, basedOn } = getMERNQuestion(resumeData);
    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      question: question,
      type: "technical",
      topic: topic,
      phase: "Project Discussion",
      basedOn: basedOn || "Project",
      difficulty: difficulty,
    };
  }
  
  // General / Role-based / Other
  const { question, topic, basedOn } = getGeneralQuestion(resumeData);
  return {
    questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    question: question,
    type: "technical",
    topic: topic,
    phase: "Discussion",
    basedOn: basedOn || "Experience",
    difficulty: difficulty,
  };
};

const generateNextQuestion = async (resumeData, config, sessionMemory, lastEvaluation) => {
  const { category, role = "general" } = config;
  const lastScore = lastEvaluation?.score || 5;
  const lastAnswer = sessionMemory.conversationHistory?.filter(h => h.role === "user").pop()?.content || "";
  const questionsAsked = sessionMemory.askedQuestions || [];
  const currentTopic = sessionMemory.currentTopic || "";
  const difficulty = sessionMemory.difficulty || "intermediate";
  const currentPhase = sessionMemory.interviewPhase || "Discussion";
  
  console.log(`Generating next question for category: ${category}, lastScore: ${lastScore}, questionsAsked: ${questionsAsked.length}`);

  if (genAI && model) {
    try {
      const resumeContext = buildResumeContext(resumeData);
      
      const categoryNames = {
        dsa: "Data Structures & Algorithms (DSA)",
        mern: "MERN Stack (MongoDB, Express, React, Node.js)",
        "system-design": "System Design & Architecture",
        hr: "Human Resources (HR) & Cultural Fit",
        java: "Java Technical (Core Java, OOP, Spring)",
        python: "Python Technical",
        behavioral: "Behavioral & Situational",
        "role-based": "Role-Specific Technical",
        general: "General Technical"
      };
      const categoryName = categoryNames[category] || "Technical";

      const historyStr = sessionMemory.conversationHistory?.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`).join("\n") || "None";

      const systemPrompt = `You are a senior ${categoryName} interviewer conducting a realistic mock interview.
Category: ${categoryName}
Target Role: ${role}
Current Difficulty: ${difficulty}
Current Phase: ${currentPhase}
Current Topic: ${currentTopic}

Candidate Resume Context:
${resumeContext || "No resume details available."}

Previously Asked Questions (DO NOT repeat or ask anything very similar to these):
${questionsAsked.map((q, idx) => `${idx + 1}. ${q}`).join("\n") || "None"}

Full Conversation History:
${historyStr}

Last Evaluation:
- Last Question: ${sessionMemory.conversationHistory?.filter(h => h.role === 'assistant').pop()?.content || "None"}
- Candidate's Answer: ${lastAnswer}
- Score: ${lastScore}/10
- Strengths: ${JSON.stringify(lastEvaluation?.strengths || [])}
- Weaknesses: ${JSON.stringify(lastEvaluation?.improvements || [])}

Generate the NEXT question of the interview.
Guidelines:
1. Make it a natural, conversational continuation of the interview.
2. If the candidate's last answer lacked depth or has areas for improvement, ask a follow-up question to clarify, probe, or challenge them.
3. If they answered well, either dive deeper into the technical implementation/trade-offs or transition to a new phase/topic.
4. Keep the tone professional, realistic, and recruiter-like.
5. Strictly avoid asking the same questions or topics already asked.

Return STRICT JSON format:
{
  "question": "string (the question text)",
  "topic": "string (specific topic e.g. React hooks, JVM memory, database indices)",
  "phase": "string (current phase e.g. Project Discussion, Technical Concepts, Scenario-Based, Behavioral, etc.)",
  "isFollowUp": boolean (true if follow-up on last answer, false if transitioning to a new topic/phase)",
  "basedOn": "string (e.g. 'previous answer', 'resume', or 'general concept')",
  "difficulty": "string (suggested difficulty level: beginner/intermediate/advanced)"
}`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
      
      const text = result.response.text();
      const jsonStr = cleanJSON(text);
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        if (data.question && !questionsAsked.includes(data.question)) {
          let newDifficulty = data.difficulty || difficulty;
          if (newDifficulty === "easy") newDifficulty = "beginner";
          if (newDifficulty === "medium") newDifficulty = "intermediate";
          if (newDifficulty === "hard") newDifficulty = "advanced";

          return {
            questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            question: data.question,
            type: category === "behavioral" || category === "hr" ? "behavioral" : "technical",
            topic: data.topic || currentTopic,
            phase: data.phase || currentPhase,
            basedOn: data.basedOn || "Previous answer",
            isFollowUp: data.isFollowUp === true || data.isFollowUp === "true",
            difficulty: newDifficulty,
          };
        }
      }
    } catch (err) {
      console.warn("⚠️ Dynamic generateNextQuestion failed, falling back to static questions:", err.message);
    }
  }

  // Fallback to static questions
  
  const hasAsked = (qText) => {
    return questionsAsked.some(aq => aq.toLowerCase().includes(qText.toLowerCase().trim()));
  };

  const getFallbackQuestion = (questionList, fallbackTopic) => {
    const available = questionList.filter(q => !hasAsked(q));
    const selected = available.length > 0 
      ? available[Math.floor(Math.random() * available.length)] 
      : questionList[Math.floor(Math.random() * questionList.length)];
    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      question: selected,
      type: category === "behavioral" || category === "hr" ? "behavioral" : "technical",
      topic: fallbackTopic,
      phase: currentPhase || "Discussion",
      basedOn: "General Concept",
      isFollowUp: false,
      difficulty: difficulty,
    };
  };

  // DSA - PURE ALGORITHM
  if (category === "dsa") {
    if (lastEvaluation && lastEvaluation.needsFollowUp && lastEvaluation.followUpQuestion) {
      return {
        questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        question: lastEvaluation.followUpQuestion,
        type: "technical",
        topic: currentTopic || "Algorithms",
        phase: "Coding Problem",
        basedOn: "Previous answer",
        isFollowUp: true,
        difficulty: lastEvaluation.difficultyLevel || difficulty,
      };
    } else if (lastEvaluation && lastEvaluation.nextQuestion) {
      return {
        questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        question: lastEvaluation.nextQuestion,
        type: "technical",
        topic: currentTopic || "Algorithms",
        phase: "Coding Problem",
        basedOn: null,
        isFollowUp: false,
        difficulty: lastEvaluation.difficultyLevel || difficulty,
      };
    }

    const { question, topic } = getRandomDSAQuestion(difficulty, questionsAsked);
    
    let conversationalQuestion = "";
    if (lastScore >= 8) {
      conversationalQuestion = `Great solution! Here's another problem to test your skills:\n\n${question}`;
    } else if (lastScore <= 4) {
      conversationalQuestion = `Let's try a different problem:\n\n${question}\n\nTake your time - think through the approach step by step.`;
    } else {
      conversationalQuestion = `Good attempt! Here's another problem:\n\n${question}`;
    }
    
    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      question: conversationalQuestion,
      type: "technical",
      topic: topic,
      phase: "Coding Problem",
      basedOn: null,
      isFollowUp: false,
      difficulty: difficulty,
    };
  }
  
  // System Design
  if (category === "system-design") {
    const available = SYSTEM_DESIGN_QUESTIONS.filter(q => !hasAsked(q));
    const selected = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : SYSTEM_DESIGN_QUESTIONS[Math.floor(Math.random() * SYSTEM_DESIGN_QUESTIONS.length)];
      
    return {
      questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      question: selected + "\n\nThink out loud, ask clarifying questions, and walk me through your reasoning and trade-offs.",
      type: "technical",
      topic: "System Design",
      phase: "System Design",
      basedOn: "Architecture",
      isFollowUp: false,
      difficulty: difficulty,
    };
  }
  
  // MERN Stack
  if (category === "mern") {
    return getFallbackQuestion(MERN_FALLBACK_QUESTIONS, "MERN Stack");
  }
  
  // Java
  if (category === "java") {
    return getFallbackQuestion(JAVA_FALLBACK_QUESTIONS, "Java Technical");
  }

  // Python
  if (category === "python") {
    return getFallbackQuestion(PYTHON_FALLBACK_QUESTIONS, "Python Technical");
  }

  // HR
  if (category === "hr") {
    return getFallbackQuestion(HR_FALLBACK_QUESTIONS, "HR & Culture");
  }

  // Behavioral
  if (category === "behavioral") {
    return getFallbackQuestion(BEHAVIORAL_FALLBACK_QUESTIONS, "Behavioral");
  }

  // General / Role-based / Other
  return getFallbackQuestion(GENERAL_FALLBACK_QUESTIONS, "General Technical");
};

// ==================== EVALUATION ====================
const fallbackEvaluateAnswer = async (question, answer, context = {}) => {
  if (!answer || answer.trim().length < 30) {
    return {
      score: 3,
      technicalAccuracy: 3,
      completeness: 2,
      clarity: 3,
      relevance: 3,
      examples: 2,
      feedback: "⚠️ Your answer was brief. Please provide more details about your approach, step-by-step reasoning, and complexity analysis.",
      strengths: [],
      improvements: ["Provide detailed explanation", "Include time/space complexity", "Give concrete examples"],
      strongTopics: [],
      weakTopics: ["Answer completeness"],
    };
  }
  
  const wordCount = answer.split(/\s+/).length;
  const hasComplexity = answer.toLowerCase().includes("time complexity") || answer.toLowerCase().includes("space complexity") || answer.toLowerCase().includes("o(n");
  const hasExample = answer.includes("example") || answer.includes("e.g.") || answer.includes("like");
  const hasCode = answer.includes("function") || answer.includes("const") || answer.includes("let") || answer.includes("return") || answer.includes("=>");
  
  let score = 5;
  let feedback = "";
  let strengths = [];
  let improvements = [];
  
  if (wordCount > 100 && hasComplexity && (hasCode || hasExample)) {
    score = 8;
    feedback = "✅ Excellent answer! You provided a clear solution with complexity analysis and good examples.";
    strengths = ["Good complexity analysis", "Clear explanation", "Concrete examples"];
    improvements = ["Consider edge cases", "Discuss alternative approaches"];
  } else if (wordCount > 60 && (hasComplexity || hasCode)) {
    score = 6;
    feedback = "👍 Good answer! To improve, add more detailed complexity analysis and consider edge cases.";
    strengths = ["Good structure", "Clear reasoning"];
    improvements = ["Add time/space complexity", "Discuss edge cases", "Provide example"];
  } else if (wordCount > 40) {
    score = 4;
    feedback = "📝 You're on the right track. Next time, include complexity analysis and a concrete example.";
    strengths = ["Made good attempt"];
    improvements = ["Add complexity analysis", "Provide example", "Explain step by step"];
  } else {
    score = 3;
    feedback = "📚 Your answer needs more detail. Please explain your approach step by step with complexity analysis.";
    strengths = [];
    improvements = ["Detailed explanation needed", "Add complexity analysis", "Provide example"];
  }
  
  if (hasComplexity) score += 0.5;
  if (hasExample) score += 0.5;
  if (hasCode) score += 0.5;
  score = Math.min(10, Math.max(0, score));
  
  return {
    score: Math.round(score * 10) / 10,
    technicalAccuracy: Math.min(10, score + 0.5),
    clarity: Math.min(10, score),
    communication: Math.min(10, score),
    confidence: Math.min(10, score),
    explanationDepth: Math.min(10, score),
    feedback: feedback,
    strengths: strengths.length ? strengths : ["Attempted to answer"],
    improvements: improvements.length ? improvements : ["Provide more technical depth", "Include complexity analysis"],
    strongTopics: [],
    weakTopics: hasComplexity ? [] : ["Complexity analysis"],
  };
};

const evaluateAnswer = async (question, answer, context = {}) => {
  if (!genAI || !model) {
    console.warn("⚠️ Gemini AI not initialized, using fallback evaluation.");
    return fallbackEvaluateAnswer(question, answer, context);
  }

  const { category = "dsa", difficulty = "intermediate", previousQuestions = "None", previousAnswers = "None" } = context;

  const categoryNames = {
    dsa: "Data Structures & Algorithms (DSA)",
    mern: "MERN Stack (MongoDB, Express, React, Node.js)",
    "system-design": "System Design & Architecture",
    hr: "Human Resources (HR) & Cultural Fit",
    java: "Java Technical (Core Java, OOP, Spring)",
    python: "Python Technical",
    behavioral: "Behavioral & Situational",
    "role-based": "Role-Specific Technical",
    general: "General Technical"
  };
  const categoryName = categoryNames[category] || "Technical";

  const systemPrompt = `You are a senior ${categoryName} interviewer conducting a realistic mock interview.

Your role is to:
* analyze the candidate's answer deeply,
* evaluate technical accuracy, depth of knowledge, best practices, and communication,
* identify strengths and areas for improvement,
* determine if a follow-up question is needed on the same topic/answer, or if the interview should transition,
* generate contextual feedback.

==================================================
INTERVIEW RULES
===============
1. Analyze answer quality before scoring.
2. Evaluate technical depth, completeness, and clarity.
3. Behave like a real, experienced interviewer for ${categoryName}.
4. Do not offer generic praise or repeated boilerplate feedback.

==================================================
PREVIOUS QUESTIONS
==================
${previousQuestions}

==================================================
PREVIOUS ANSWERS
================
${previousAnswers}

==================================================
CURRENT QUESTION
================
${question}

==================================================
CANDIDATE ANSWER
================
${answer}

==================================================
TASKS
=====
1. Evaluate the candidate's response to the CURRENT QUESTION.
2. Determine their score on a scale of 0-10 for Technical Accuracy, Clarity, Communication, and Depth.
3. Provide constructive, specific feedback referencing their actual response.
4. Specify if a follow-up is needed based on their answer (e.g. if they missed key details, edge cases, trade-offs, or best practices).
5. Suggest the appropriate difficulty level for subsequent questions based on their performance.

==================================================
SCORING CRITERIA
================
Evaluate STRICTLY on:
1. Technical Accuracy (0-10): correctness, best practices, framework/language details, or structural accuracy.
2. Clarity (0-10): structured explanation, readability, explanation organization.
3. Communication (0-10): articulation, confidence, professional tone.
4. Depth (0-10): knowledge of edge cases, trade-offs, optimizations, or real-world applicability.

==================================================
RETURN STRICT JSON
==================
{
  "technicalScore": number,
  "clarityScore": number,
  "communicationScore": number,
  "depthScore": number,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "feedback": "...",
  "needsFollowUp": true/false,
  "followUpQuestion": "...",
  "nextQuestion": "...",
  "difficultyLevel": "beginner/intermediate/advanced"
}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });
    const text = result.response.text();
    const jsonStr = cleanJSON(text);
    if (!jsonStr) {
      throw new Error("Could not parse JSON from Gemini response");
    }

    const data = JSON.parse(jsonStr);

    const technicalScore = Number(data.technicalScore ?? data.technical_score ?? data.technicalScore ?? 0);
    const clarityScore = Number(data.clarityScore ?? data.clarity_score ?? data.clarityScore ?? 0);
    const communicationScore = Number(data.communicationScore ?? data.communication_score ?? data.communicationScore ?? 0);
    const depthScore = Number(data.depthScore ?? data.depth_score ?? data.depthScore ?? 0);

    const avgScore = (technicalScore + clarityScore + communicationScore + depthScore) / 4;

    const needsFollowUpVal = data.needsFollowUp ?? data.needs_follow_up ?? data.needsfollowup;
    const needsFollowUp = needsFollowUpVal === true || needsFollowUpVal === "true";

    const followUpQuestion = data.followUpQuestion ?? data.follow_up_question ?? data.followupQuestion ?? data.followup_question ?? "";
    const nextQuestion = data.nextQuestion ?? data.next_question ?? data.nextquestion ?? "";
    let difficultyLevel = data.difficultyLevel ?? data.difficulty_level ?? data.difficulty ?? difficulty;
    if (difficultyLevel === "easy") difficultyLevel = "beginner";
    if (difficultyLevel === "medium") difficultyLevel = "intermediate";
    if (difficultyLevel === "hard") difficultyLevel = "advanced";

    return {
      score: Math.round(avgScore * 10) / 10,
      technicalAccuracy: technicalScore,
      clarity: clarityScore,
      communication: communicationScore,
      confidence: communicationScore, // map to communication score
      explanationDepth: depthScore,
      feedback: data.feedback || "",
      strengths: data.strengths || ["Attempted to answer"],
      improvements: data.weaknesses || data.improvements || [],
      strongTopics: [],
      weakTopics: data.weaknesses || [],
      
      // Conversational details for generateNextQuestion
      needsFollowUp,
      followUpQuestion,
      nextQuestion,
      difficultyLevel,
    };
  } catch (error) {
    console.error("❌ Gemini evaluateAnswer error:", error.message);
    return fallbackEvaluateAnswer(question, answer, context);
  }
};

const generateOverallFeedback = async (interviewData) => {
  const { questions, config } = interviewData;
  const answered = questions.filter(q => q.answer && q.answer.trim().length > 30);
  
  if (answered.length === 0) {
    return {
      overallFeedback: "No detailed answers provided. Next time, focus on explaining your thought process with specific examples and complexity analysis.",
      strongTopics: [],
      weakTopics: ["Answer quality", "Technical depth", "Complexity analysis"],
      recommendations: [
        "Always explain your thought process step by step",
        "Include time AND space complexity analysis",
        "Use concrete examples to illustrate your approach"
      ],
      grade: "F",
      performanceSummary: { bestAnswer: "None", weakestAnswer: "None", consistency: "N/A" }
    };
  }
  
  const avgScore = answered.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / answered.length;
  const hasComplexity = answered.some(q => q.answer?.toLowerCase().includes("complexity"));
  
  let grade = "F";
  if (avgScore >= 8.5) grade = "A";
  else if (avgScore >= 7.5) grade = "B+";
  else if (avgScore >= 6.5) grade = "B";
  else if (avgScore >= 5.5) grade = "C+";
  else if (avgScore >= 4.5) grade = "C";
  
  let feedback = "";
  if (avgScore >= 8) {
    feedback = `🎉 Excellent performance! Average score: ${avgScore.toFixed(1)}/10. Your answers were detailed and well-structured. Keep up this level of preparation!`;
  } else if (avgScore >= 6) {
    feedback = `👍 Good job! Average score: ${avgScore.toFixed(1)}/10. ${!hasComplexity ? "Focus on adding complexity analysis to reach the next level." : "Keep practicing to improve further!"}`;
  } else {
    feedback = `📚 You averaged ${avgScore.toFixed(1)}/10. Focus on providing more detailed solutions with complexity analysis. Practice is key!`;
  }
  
  return {
    overallFeedback: feedback,
    strongTopics: [],
    weakTopics: !hasComplexity ? ["Complexity analysis"] : [],
    recommendations: [
      "Always include time AND space complexity analysis",
      "Explain your thought process step by step",
      "Consider edge cases in your solutions",
      "Use concrete examples to illustrate your approach",
      "Practice solving problems on a whiteboard or paper"
    ],
    grade: grade,
    performanceSummary: {
      bestAnswer: `Question ${answered.reduce((best, q, i) => (q.evaluation?.score || 0) > (answered[best]?.evaluation?.score || 0) ? i : best, 0) + 1}`,
      weakestAnswer: `Question ${answered.reduce((worst, q, i) => (q.evaluation?.score || 0) < (answered[worst]?.evaluation?.score || 0) ? i : worst, 0) + 1}`,
      consistency: avgScore > 7 ? "Consistent performer" : "Room for improvement",
    }
  };
};

const adjustDifficulty = (score, currentDifficulty) => {
  if (!score) return currentDifficulty;
  if (score >= 8) {
    if (currentDifficulty === "beginner") return "intermediate";
    if (currentDifficulty === "intermediate") return "advanced";
  } else if (score <= 4) {
    if (currentDifficulty === "advanced") return "intermediate";
    if (currentDifficulty === "intermediate") return "beginner";
  }
  return currentDifficulty;
};

module.exports = {
  initGemini,
  generateFirstQuestion,
  generateNextQuestion,
  evaluateAnswer,
  generateOverallFeedback,
};