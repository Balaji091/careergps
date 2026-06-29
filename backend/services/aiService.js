import axios from 'axios';

// Helper to call Grok/Groq chat completions
const callGrokAPI = async (messages, expectJson = true) => {
  const apiKey = process.env.GROK_API_KEY;
  const model = process.env.GROK_MODEL || 'grok-2-1212';

  if (!apiKey) {
    throw new Error('CGPS Primary LLM API Key not configured');
  }

  const isGroq = apiKey.startsWith('gsk_');
  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.x.ai/v1/chat/completions';

  const modelToUse = isGroq ? 'llama-3.3-70b-versatile' : model;

  console.log(`[AI SERVICE] Invoking LLM (Primary): model=${modelToUse}, jsonMode=${expectJson}`);

  try {
    const payload = {
      model: modelToUse,
      messages,
      temperature: 0.4,
    };

    if (expectJson) {
      payload.response_format = { type: 'json_object' };
    }

    const response = await axios.post(
      endpoint,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 25000,
      }
    );

    const contentText = response.data.choices[0].message.content.trim();
    if (expectJson) {
      return JSON.parse(contentText);
    }
    return contentText;
  } catch (error) {
    console.error('[AI SERVICE] Primary LLM API call failed:', error.response?.data || error.message);
    throw error;
  }
};

// Helper to call Gemini chat completions as fallback
const callGeminiAPI = async (messages, expectJson = true) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  if (!apiKey) {
    throw new Error('Gemini API Key not configured');
  }

  console.log(`[AI SERVICE] Invoking Gemini: model=${model}, jsonMode=${expectJson}`);

  let systemInstructionText = '';
  const contents = [];

  messages.forEach(msg => {
    if (msg.role === 'system') {
      systemInstructionText += msg.content + '\n';
    } else {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      contents.push({
        role: role,
        parts: [{ text: msg.content }]
      });
    }
  });

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.4
    }
  };

  if (systemInstructionText) {
    payload.systemInstruction = {
      parts: [{ text: systemInstructionText.trim() }]
    };
  }

  if (expectJson) {
    payload.generationConfig.responseMimeType = 'application/json';
  }

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 25000
    });

    if (!response.data.candidates || response.data.candidates.length === 0) {
      throw new Error('No content returned from Gemini API');
    }

    const contentText = response.data.candidates[0].content.parts[0].text.trim();
    
    if (expectJson) {
      // Strip markdown code block wrapper if present
      let cleaned = contentText;
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return JSON.parse(cleaned.trim());
    }

    return contentText;
  } catch (error) {
    console.error('[AI SERVICE] Gemini API call failed:', error.response?.data || error.message);
    throw error;
  }
};

// Orchestrator with retries and fallback
const callLLMWithRetryAndFallback = async (messages, expectJson = true) => {
  const maxRetries = 2;
  const delayMs = 1000;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Try Grok/Groq if API key is configured
  const grokApiKey = process.env.GROK_API_KEY;
  if (grokApiKey) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await callGrokAPI(messages, expectJson);
      } catch (error) {
        console.warn(`[AI SERVICE] Primary LLM attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          await delay(delayMs * attempt);
        }
      }
    }
  }

  // 2. If Grok/Groq failed or wasn't configured, fall back to Gemini
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    console.log(`[AI SERVICE] Falling back to Gemini API...`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await callGeminiAPI(messages, expectJson);
      } catch (error) {
        console.warn(`[AI SERVICE] Gemini attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          await delay(delayMs * attempt);
        }
      }
    }
  }

  throw new Error('All configured LLM providers failed or no API keys were configured.');
};

const isCodingOrITDomain = (value = '') => {
  const text = value.toLowerCase();
  return /(software|developer|development|engineer|frontend|front-end|backend|back-end|full stack|fullstack|programmer|coding|data engineer|devops|cloud|cyber|security engineer|qa|sre|database|web|mobile|android|ios|react|node|python|java|javascript|kubernetes|docker|api|machine learning|ml engineer|ai engineer)/.test(text);
};

/**
 * GENERATE CAREER ROADMAP
 */
export const generateRoadmap = async (role, level, timeline, dailyHours) => {
  const totalDays = parseTimelineToDays(timeline);
  
  // Provide specific subject guides depending on the selected role to align with user expectations
  let subjectGuides = '';
  const lowerRole = role?.toLowerCase() || '';
  const isCodingRole = isCodingOrITDomain(role);
  if (lowerRole.includes('full stack') || lowerRole.includes('fullstack')) {
    subjectGuides = `For a Full Stack Developer, do NOT group HTML, CSS, JavaScript, and React together as simple topics under a single subject. Instead, make them separate subjects. Generate subjects like:
1. HTML & CSS Layouts (Lessons: HTML5 Semantics, CSS Layouts, CSS Responsive Design)
2. JavaScript Core Foundations (Lessons: JS Execution Context, Data Types & Functions)
3. Advanced JavaScript Internals (Lessons: Asynchronous JS & Promises, Event Loop & V8 Engine, DOM & Browser APIs)
4. Git, GitHub & Collaboration (Lessons: Version Control, Workflows)
5. React.js Essentials (Lessons: Component Lifecycle, React Hooks)
6. React.js Advanced & State Management (Lessons: Context API & Redux Toolkit, Performance Optimization)
7. Node.js & Express API Foundations (Lessons: Event Loop & File System, Middleware & Routing)
8. REST APIs & Databases (Lessons: API Design, SQL vs NoSQL, MongoDB & Mongoose)
9. Authentication & Security (Lessons: JWT Authentication, Security Best Practices)
10. Full Stack MERN Integration & Project (Lessons: MERN Communication, Final Capstone Project)
11. CS Foundations & DSA Basics (Lessons: DBMS & OS, Core Data Structures)
12. System Design & Deployment (Lessons: High Availability Architecture, CI/CD & DevOps)`;
  } else if (lowerRole.includes('front')) {
    subjectGuides = `For a Frontend Developer, do NOT group HTML, CSS, JavaScript, and React together as simple topics under a single subject. Instead, make them separate subjects. Generate subjects like:
1. HTML & CSS Core (Lessons: HTML5 Semantics & Accessibility, CSS Box Model & Selectors)
2. Advanced CSS & Layouts (Lessons: Flexbox & Grid, CSS Preprocessors & Tailwind, Responsive Design & Animation)
3. JavaScript Core Foundations (Lessons: Variables & Scopes, ES6+ Features & OOP)
4. Advanced JavaScript Internals (Lessons: Event Loop & V8, Promises & Async/Await, DOM Manipulation & Browser APIs)
5. React.js Essentials (Lessons: JSX & Virtual DOM, Component Lifecycle, Core React Hooks)
6. React.js Advanced & State Management (Lessons: Redux Toolkit & Context API, React Router, Performance Optimization)
7. API Integration & Tooling (Lessons: Fetching & Axios, Webpack & Vite, Jest & React Testing Library)
8. Frontend System Design & Deployment (Lessons: Web Performance, Security best practices, Deployment & Hosting)`;
  } else if (lowerRole.includes('back')) {
    subjectGuides = `For a Backend Developer, generate separate subjects like:
1. Node.js Basics & Runtime (Lessons: Node.js Architecture, Event Loop & V8 Engine, Event Emitters & Buffers)
2. Express.js API Foundations (Lessons: Routing & HTTP Methods, Middleware & Error Boundaries)
3. RESTful API Design (Lessons: REST Standards, Request/Response Handling, Input Validation)
4. Relational Databases (SQL) (Lessons: PostgreSQL/MySQL Design, Joins & Subqueries, Indexing & Transactions)
5. NoSQL Databases (Lessons: MongoDB Modeling, Mongoose Schemas, Aggregations)
6. Authentication & Security (Lessons: JWT & Cookies, Password Hashing, CORS & Helmet)
7. Caching & Message Queues (Lessons: Redis Caching, RabbitMQ/Kafka Messaging)
8. Backend System Design & Scaling (Lessons: Load Balancing & Nginx, Microservices Architecture, Docker Containerization)
9. Testing & Deployment (Lessons: Unit & Integration Testing, Cloud Hosting, CI/CD Pipelines)`;
  } else if (lowerRole.includes('devops')) {
    subjectGuides = `For a DevOps Engineer, generate separate subjects like:
1. Linux Administration (Lessons: File Systems & User Access, Shell Scripting & Automation)
2. Networking & Security (Lessons: OSI Model & Protocols, SSH & Firewalls, DNS & Load Balancing)
3. Docker Containerization (Lessons: Dockerfile & Multi-stage Builds, Docker Compose & Networking)
4. Kubernetes Orchestration (Lessons: K8s Core Components, Pods & Services, Deployments & Volumes)
5. Infrastructure as Code (Terraform) (Lessons: Terraform State & Variables, Modules & Providers)
6. CI/CD Pipeline Automation (Lessons: GitHub Actions/Jenkins, Build & Test Automation, Deployment Strategies)
7. Monitoring, Logging & Observability (Lessons: Prometheus & Grafana, ELK/PLG Stack, Alerting)
8. Cloud Platforms & Architecture (Lessons: AWS Core Services, IAM & VPC Security, High Availability Design)`;
  } else if (lowerRole.includes('data')) {
    subjectGuides = `For a Data Engineer, generate separate subjects like:
1. Python Programming for Data (Lessons: Data Structures & OOP, Functional Programming, Pandas & NumPy)
2. Advanced SQL & Database Systems (Lessons: Complex Joins & Subqueries, Window Functions, Indexing & Query Tuning)
3. Data Warehousing & Modeling (Lessons: Star/Snowflake Schemas, Dimensional Modeling, Slowly Changing Dimensions)
4. Distributed Computing (Spark) (Lessons: Spark Architecture & RDDs, DataFrames & SQL, Spark Streaming)
5. NoSQL & Big Data Storage (Lessons: HDFS & MapReduce, Cassandra/HBase, Data Lakes & Delta Lake)
6. ETL Pipeline Orchestration (Airflow) (Lessons: DAGs & Tasks, Airflow Operators, Scheduling & Monitoring)
7. Data Ingestion & Streaming (Kafka) (Lessons: Kafka Producers & Consumers, Kafka Topics & Partitions, Spark/Flink Streaming Integration)
8. Cloud Data Engineering (Lessons: Cloud Data Warehouses, Identity & Security, Data Governance & Testing)`;
  } else {
    subjectGuides = `For a ${role}, generate a role-specific professional curriculum. Use the actual domain of the role, such as strategy, communication, tools, workflows, industry knowledge, portfolio work, metrics, stakeholder management, ethics, regulations, and practical deliverables. Do not force software engineering, programming, DSA, system design, APIs, databases, Git, or coding topics unless the role explicitly requires them.`;
  }

  const domainInstructions = isCodingRole
    ? `This is a coding/IT-adjacent role. Include coding, architecture, tooling, debugging, deployment, and technical interview practice only where they are genuinely relevant to the role.`
    : `This is NOT a coding/IT role. The curriculum must match the selected role's real-world responsibilities and course domain. Do NOT include code snippets, programming projects, DSA, software architecture, APIs, databases, Git, DevOps, system design, technical interviewer wording, or coding objectives. Projects should be role-appropriate deliverables such as reports, campaigns, case studies, portfolios, audits, presentations, SOPs, research briefs, negotiation plans, financial models, lesson plans, design systems, or operational playbooks.`;

  try {
    const systemPrompt = `You are a world-class education curriculum director and career planner.
Generate a structured, highly comprehensive, and progressive learning roadmap for a ${level} level "${role}" target role to be completed in EXACTLY ${totalDays} days, studying ${dailyHours} hours per day.

CRITICAL INSTRUCTIONS:
1. The curriculum MUST contain important topics, core foundations, practical workflows, domain principles, tools, quality standards, ethics, and advanced concepts appropriate to "${role}". ${domainInstructions}
2. Progressive Subjects: Generate between 8 to 12 progressive, comprehensive subjects/modules to cover the domain exhaustively. ${subjectGuides}
3. Highly Granular & Deep Topics:
   - Each subject must contain between 8 to 12 highly focused, granular topics to ensure maximum depth (yielding 80 to 120 topics across the entire roadmap). The curriculum must be extremely comprehensive so the student can master the role completely.
   - Do NOT group unrelated or broad concepts into a single topic. Break them down into specific conceptual units (e.g. instead of a broad topic "CSS Layouts", generate individual topics like "Flexbox Flex-Grow & Alignment Properties", "CSS Grid Template Areas", "Positioning Contexts & Z-Index").
4. Lesson Module Groupings: A subject must be divided into exactly 3 to 4 logical, concept-focused lesson modules (representing structured learning units). Multiple topics MUST share the exact same "lessonName" to be grouped under that lesson. Do NOT create a single generic lesson name (like "General Fundamentals") for all topics, and do NOT put topics from unrelated domains under the same lesson. Topics inside each lesson must be progressive, ordered from basic concept to advanced application, covering role-relevant assessment or interview questions.
5. The LAST topic of every subject MUST be a project-based module detailing concrete project objectives. For non-coding roles, the project MUST be a role-specific deliverable, not an app, codebase, or software project.
6. Duration/Time Matching, Splitting & Smart Allocation:
   - The user has committed to studying ${dailyHours} hours per day for a total of ${totalDays} days.
   - Split this daily time budget as follows:
     * 60% (${Math.round(dailyHours * 0.6 * 10) / 10} hours/day) is dedicated solely to Core Concept Learning. The topics' estimatedHours represent ONLY this learning portion, and their grand total across all subjects must sum up EXACTLY to ${Math.round(totalDays * dailyHours * 0.6)} hours.
     * 20% (${Math.round(dailyHours * 0.2 * 10) / 10} hours/day) is dedicated to Active Practice (e.g. 30 minutes to practice mock interviews and quizzes).
     * 20% (${Math.round(dailyHours * 0.2 * 10) / 10} hours/day) is dedicated to Active Note-taking and Spaced Repetition revisions.
   - Subject Days Distribution: The total days of all subjects combined must sum up EXACTLY to ${totalDays} days. Do NOT distribute days equally (e.g., do not give 23 days to all subjects). Allocate days realistically based on complexity: simple introductory subjects (like basic layout syntax or version control) should take only 4 to 8 days, while core advanced subjects (like React internals, databases, system design) should take 15 to 25 days.
   - Topic Hours Allocation: Allocate estimatedHours realistically based on concept complexity:
     * Simple/fundamental topics (syntax, basic concepts) should take only 1 to 2 hours of concept learning.
     * Complex core concepts should be allocated 4 to 8 hours. If a topic has >= 6 hours, you MUST add deep conceptual details and specific hands-on objectives appropriate to "${role}" so the student has sufficient material to justify the time.
     * Hands-on Capstone Projects (the last topic in each subject module) must be allocated the largest portion of hours (e.g., 10 to 18 hours) to plan, create, test, present, and refine a comprehensive role-specific deliverable.
   - You must distribute the estimatedHours across topics such that their grand total matches exactly ${Math.round(totalDays * dailyHours * 0.6)} hours. This mathematical equality is extremely strict and critical.
7. Your output MUST be a valid JSON object matching the following structure:
{
  "role": "${role}",
  "estimatedDays": ${totalDays},
  "difficulty": "${level}",
  "subjects": [
    {
      "name": "Subject Name (e.g. Node.js & Express API Foundations)",
      "estimatedTime": "15 days",
      "topics": [
        {
          "name": "Topic Name (e.g. Express Custom Middleware & Error Boundaries)",
          "lessonName": "Lesson Module Name (e.g. Express Middleware & Filter Pipelines)",
          "difficulty": "Beginner|Intermediate|Advanced",
          "estimatedHours": 6,
          "learningObjectives": ["Explain execution order in middleware chains", "Write a centralized error handler", "Use custom request properties"],
          "prerequisites": ["Node.js Runtime & V8 Event Loop"],
          "summary": "Detailed concept explanation summary for this specific syllabus unit."
        }
      ]
    }
  ]
}
Return ONLY the JSON payload. Do not include markdown codeblocks or wrapper formatting.`;

    const messages = [
      { role: 'system', content: 'You are an educational assistant that outputs JSON ONLY.' },
      { role: 'user', content: systemPrompt }
    ];

    const data = await callLLMWithRetryAndFallback(messages, true);
    
    // Post-process to guarantee exact mathematical match
    if (data && data.subjects && Array.isArray(data.subjects)) {
      data.estimatedDays = totalDays;
      
      // 1. Normalise Subject Days
      let totalGeneratedDays = 0;
      data.subjects.forEach(subject => {
        const match = (subject.estimatedTime || '').match(/(\d+)/);
        const days = match ? parseInt(match[1], 10) : 10;
        subject.tempDays = days;
        totalGeneratedDays += days;
      });
      
      if (totalGeneratedDays > 0) {
        const subjectScaleFactor = totalDays / totalGeneratedDays;
        let accumulatedDays = 0;
        data.subjects.forEach((subject, sIdx) => {
          let finalDays = 0;
          if (sIdx === data.subjects.length - 1) {
            finalDays = Math.max(1, totalDays - accumulatedDays);
          } else {
            finalDays = Math.max(1, Math.round(subject.tempDays * subjectScaleFactor));
            accumulatedDays += finalDays;
          }
          subject.estimatedTime = `${finalDays} days`;
          delete subject.tempDays;
        });
      }
      
      // 2. Normalise Topic Hours (Concept Learning = 60% of total study time)
      const hoursPerDay = Number(dailyHours) || 2;
      const targetTotalHours = Math.round(totalDays * (hoursPerDay * 0.6));
      let totalGeneratedHours = 0;
      let totalTopicsCount = 0;
      
      data.subjects.forEach(subject => {
        if (subject.topics && Array.isArray(subject.topics)) {
          subject.topics.forEach(topic => {
            totalGeneratedHours += Number(topic.estimatedHours) || 0;
            totalTopicsCount++;
          });
        }
      });
      
      if (totalTopicsCount > 0 && totalGeneratedHours > 0) {
        const scaleFactor = targetTotalHours / totalGeneratedHours;
        let accumulatedHours = 0;
        let topicIdx = 0;
        
        data.subjects.forEach(subject => {
          if (subject.topics && Array.isArray(subject.topics)) {
            subject.topics.forEach(topic => {
              topicIdx++;
              if (topicIdx === totalTopicsCount) {
                topic.estimatedHours = Math.max(1, targetTotalHours - accumulatedHours);
              } else {
                const hours = Math.round((Number(topic.estimatedHours) || 4) * scaleFactor);
                topic.estimatedHours = Math.max(1, hours);
                accumulatedHours += topic.estimatedHours;
              }
            });
          }
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('[AI SERVICE] generateRoadmap failed:', error.message);
    throw error;
  }
};

/**
 * DYNAMIC LEARN CONTENT
 */
export const generateLearnContent = async (topicName, subjectName, experienceLevel) => {
  try {
    const isCodingSubject = isCodingOrITDomain(`${subjectName} ${topicName}`);
    const contentMode = isCodingSubject
      ? `This is a coding/IT-adjacent topic. Include code snippets only when they directly teach the topic.`
      : `This is a non-coding course topic. Do NOT include code snippets, programming syntax, software architecture, APIs, databases, debugging, or developer-only framing. Use role-specific examples, workflows, templates, checklists, scenarios, and deliverables instead.`;

    const systemPrompt = `You are an expert instructor teaching a course on "${subjectName}".
Generate comprehensive, production-grade educational learn content for the topic "${topicName}" tailored for a "${experienceLevel}" level learner.

Ensure the content is highly detailed and clear. The "detailedExplanation" must contain complete structural details, practical explanations, and step-by-step guides using rich Markdown. ${contentMode}

CRITICAL CONTENT INSTRUCTIONS:
- The explanation must be written in a highly narrative, engaging, story-based format.
- Use a relatable role-specific scenario or case study to anchor the concepts.
- Use strong analogies, metaphors, and clear step-by-step breakdowns rather than dry documentation.
- For coding/IT topics, provide concrete code examples only when useful. For non-coding topics, provide concrete templates, examples, decision checklists, exercises, or deliverable outlines instead of code.

Your response MUST be a JSON object with this structure:
{
  "definition": "Clear, concise definition of the concept.",
  "detailedExplanation": "A detailed, step-by-step breakdown of the concept in Markdown formatting. Include relevant mechanisms, pros/cons, examples, and best practices.",
  "realWorldExample": "An engaging real-world analogy or practical example illustrating the topic.",
  "useCases": ["Why we use it in production", "Specific production scenario 1", "Specific production scenario 2"],
  "commonMistakes": ["Detail on mistake 1 and how to avoid it", "Detail on mistake 2 and how to avoid it"],
  "interviewTips": ["Key points that interviewers focus on", "How to approach answering questions about this topic"],
  "keyTakeaways": ["Key takeaway summary 1", "Key takeaway summary 2"]
}

CRITICAL FOR JSON VALIDATION:
Since this is JSON mode, all double quotes inside the JSON string values (especially inside code blocks and detailedExplanation Markdown) MUST be escaped with a backslash (e.g. \\" instead of ") or replaced with single quotes ('). Otherwise, JSON parsing will fail. Double check that the final output is 100% valid parseable JSON.
Return ONLY JSON. Do not wrap in markdown tags.`;

    const messages = [
      { role: 'system', content: 'You are an expert instructor that outputs JSON ONLY.' },
      { role: 'user', content: systemPrompt }
    ];

    return await callLLMWithRetryAndFallback(messages, true);
  } catch (error) {
    console.error('[AI SERVICE] generateLearnContent failed:', error.message);
    throw error;
  }
};

/**
 * AI ASSISTED NOTES
 */
export const generateNotesAssisted = async (type, existingContent, topicName, subjectName = 'Computer Science', userLevel = 'Beginner') => {
  try {
    let promptContent = '';
    if (type === 'generate') {
      promptContent = `Generate comprehensive, professional, and highly detailed study notes for the topic "${topicName}" within the subject "${subjectName}" tailored for a "${userLevel}" level learner.
Make sure the notes cover:
1. Deep-dive technical explanations of the core mechanics and foundations of "${topicName}".
2. Precise structural diagrams or step-by-step lifecycle flows (rendered in clean Markdown or ASCII/text tables).
3. Production-ready code implementations in the primary language or framework of "${subjectName}".
4. Crucial design patterns, scalability constraints, latency trade-offs, and memory-optimization strategies.
Format with clean, rich markdown headings, bold text, lists, and syntax-highlighted codeblocks. Make this a complete, high-yield learning asset.`;
    } else if (type === 'revision') {
      promptContent = `Create a highly condensed, high-yield spaced repetition revision card (cheat sheet) for the topic "${topicName}" in "${subjectName}" for a "${userLevel}" level learner.
Include:
- The absolute core definition.
- A concise syntax cheatsheet or critical production code snippet (max 5 lines).
- Top 3 critical rules, edge-case gotchas, or latency concerns.
- 3 high-probability interview questions with quick-fire answers.
Keep it extremely concise for rapid review before an interview.`;
    } else if (type === 'summary') {
      promptContent = `Write a professional executive summary of "${topicName}" as it applies to "${subjectName}" for a "${userLevel}" engineer.
Explain the core concept, its system design implications, why it is critical to modern engineering architectures, and standard trade-offs. Keep it to 3-4 dense, well-structured paragraphs.`;
    } else if (type === 'examples') {
      promptContent = `Generate 3 diverse, production-ready concrete code examples or database schemas illustrating "${topicName}" in "${subjectName}".
Each example must include:
1. Clear description of the use-case (e.g. high-throughput logging, transactional inventory check).
2. Production-grade code with thorough comments and error handling.
3. A brief breakdown of the design choices and execution complexity (Time/Space).
Current notes content for reference:\n${existingContent}`;
    } else if (type === 'flashcards') {
      promptContent = `Create a list of 5 high-yield technical Q&A flashcards for testing recall of "${topicName}" in "${subjectName}" at a "${userLevel}" level.
Format:
**Q**: [Core conceptual question testing mechanics or syntax]
**A**: [Detailed, exact technical answer]
---`;
    }

    const messages = [
      { role: 'system', content: 'You are a markdown editor helper. Return your output in clean Markdown only.' },
      { role: 'user', content: promptContent }
    ];

    return await callLLMWithRetryAndFallback(messages, false);
  } catch (error) {
    console.error('[AI SERVICE] generateNotesAssisted failed:', error.message);
    throw error;
  }
};

/**
 * INTERVIEW QUESTIONS
 */
export const generateInterviewQuestions = async (topicName, subjectName) => {
  try {
    const isCodingSubject = isCodingOrITDomain(`${subjectName} ${topicName}`);
    const questionStyle = isCodingSubject
      ? 'The questions should challenge core coding skills, architectural trade-offs, and practical debugging capabilities.'
      : 'The questions should challenge role-specific judgment, communication, decision-making, applied workflows, ethics, metrics, and practical scenario handling. Do not ask coding, debugging, DSA, API, database, or software architecture questions.';
    const prompt = `Generate exactly 3 typical interview or assessment questions for the topic "${topicName}" in "${subjectName}".
${questionStyle}
Return a JSON object:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}
Return only JSON.`;

    const messages = [
      { role: 'system', content: 'You are an interviewer that outputs JSON.' },
      { role: 'user', content: prompt }
    ];

    const res = await callLLMWithRetryAndFallback(messages, true);
    return res.questions || [];
  } catch (error) {
    console.error('[AI SERVICE] generateInterviewQuestions failed:', error.message);
    throw error;
  }
};

/**
 * DRILL QUESTIONS
 */
export const generateDrillQuestions = async (role) => {
  try {
    const prompt = `Generate exactly 2 quick drill questions for someone preparing for the role of "${role}".
The questions should test core technical knowledge, problem-solving, and practical understanding relevant to this role.
Return a JSON object:
{
  "questions": [
    { "question": "Question text?", "expectedAnswer": "Ideal concise answer" }
  ]
}
Return only JSON.`;

    const messages = [
      { role: 'system', content: 'You are a technical interviewer that outputs JSON.' },
      { role: 'user', content: prompt }
    ];

    const res = await callLLMWithRetryAndFallback(messages, true);
    return res.questions || [];
  } catch (error) {
    console.error('[AI SERVICE] generateDrillQuestions failed:', error.message);
    throw error;
  }
};

/**
 * DRILL ANSWER EVALUATION
 */
export const evaluateDrillAnswers = async (questions) => {
  try {
    const qaPairs = questions.map((q, i) => `Q${i + 1}: ${q.question}\nExpected: ${q.expectedAnswer}\nUser Answer: ${q.answer}`).join('\n\n');

const prompt = `You are a friendly AI tutor providing personalized feedback directly to the learner.

Compare the learner's answers with the expected answers below.

${qaPairs}

Guidelines:
- Speak directly to the learner using "you" and "your". Never use "the student", "the learner", or third-person language.
- Your feedback should feel like a personal tutor talking to the user after reviewing their work.
- If some answers are incorrect or missing, politely point that out and encourage improvement.
- If the user skipped questions, mention that they should attempt every question next time.
- Highlight one positive aspect before giving one improvement.
- Keep the feedback concise, supportive, and actionable.
- Do not mention AI, evaluation process, or expected answers.

Return ONLY this JSON:

{
  "score": <number between 0 and 100>,
  "verdict": "<one encouraging sentence addressed directly to the user>",
  "strengths": "<one sentence starting with 'You...' describing what you did well>",
  "improvements": "<one sentence starting with 'Try...' or 'Focus on...' telling the user exactly what to improve next>"
}

Return only valid JSON.`;
    const messages = [
      { role: 'system', content: 'You are a technical evaluator that outputs JSON.' },
      { role: 'user', content: prompt }
    ];

    return await callLLMWithRetryAndFallback(messages, true);
  } catch (error) {
    console.error('[AI SERVICE] evaluateDrillAnswers failed:', error.message);
    throw error;
  }
};

/**
 * MOCK INTERVIEW ANSWER EVALUATION
 */
export const evaluateInterviewAnswer = async ({ topicName, question, answer }) => {
  try {
    const isCodingTopic = isCodingOrITDomain(topicName);
    const evaluationStyle = isCodingTopic
      ? 'Evaluate technical accuracy, trade-offs, edge cases, implementation constraints, and practical examples.'
      : 'Evaluate role-specific accuracy, clarity, judgment, stakeholder awareness, ethics, metrics, practical examples, and communication quality. Do not expect code, algorithms, APIs, databases, or software architecture unless the question explicitly asks for them.';
    const prompt = `Evaluate this mock interview or assessment answer for the topic "${topicName}".

Question:
${question}

Candidate answer:
${answer}

${evaluationStyle}

Return ONLY valid JSON:
{
  "score": <number between 0 and 100>,
  "verdict": "<short verdict>",
  "strengths": "<one concise sentence about what is strong>",
  "gaps": "<one concise sentence about what is missing or weak>",
  "explanation": "<2-3 concise sentences explaining the ideal answer and what to improve>"
}`;

    const messages = [
      { role: 'system', content: 'You are a senior role-specific interviewer and evaluator that outputs JSON.' },
      { role: 'user', content: prompt }
    ];

    const evaluation = await callLLMWithRetryAndFallback(messages, true);
    return {
      score: Math.max(0, Math.min(100, Number(evaluation.score) || 0)),
      verdict: evaluation.verdict || 'Answer reviewed',
      strengths: evaluation.strengths || 'You addressed part of the question clearly.',
      gaps: evaluation.gaps || 'Add more detail about trade-offs, edge cases, and implementation constraints.',
      explanation: evaluation.explanation || 'A strong answer should cover the main concept, practical trade-offs, and a concrete example.',
    };
  } catch (error) {
    console.error('[AI SERVICE] evaluateInterviewAnswer failed:', error.message);
    return {
      score: 60,
      verdict: 'Needs more depth',
      strengths: 'You made a valid attempt and covered part of the topic.',
      gaps: 'Add concrete trade-offs, edge cases, and implementation details.',
      explanation: 'A stronger interview answer should define the concept, explain why it matters, discuss trade-offs, and close with a practical example.',
    };
  }
};

/**
 * DAILY PLANNER AI TASKS
 */

export const generateDailyTasks = async (pendingTopics, revisionDue, studyHours, progress) => {
  try {
    const prompt = `Generate a personalized daily study checklist.
Pending topics: ${JSON.stringify(pendingTopics)}
Revisions due: ${JSON.stringify(revisionDue)}
Available Study Hours: ${studyHours} hours
Current Course Progress: ${progress}%

Generate exactly 3-4 tasks matching the available hours. Each task must belong to one of these types: 'learn', 'revise', 'review_notes', 'interview'.
Return a JSON object:
{
  "tasks": [
    { "name": "Learn: Normalization Forms", "type": "learn" },
    { "name": "Revise: SQL Join Queries", "type": "revise" },
    { "name": "Practice: Write 3NF Answers", "type": "interview" }
  ]
}
Return only JSON.`;

    const messages = [
      { role: 'system', content: 'You are a career planner assistant.' },
      { role: 'user', content: prompt }
    ];

    const res = await callLLMWithRetryAndFallback(messages, true);
    return res.tasks || [];
  } catch (error) {
    console.error('[AI SERVICE] generateDailyTasks failed:', error.message);
    throw error;
  }
};

/**
 * LINKEDIN CONTENT GENERATOR
 */
export const generateLinkedInPost = async (type, topicName, noteContent) => {
  try {
    let prompt = '';
    if (type === 'learning_post') {
      prompt = `Write an engaging LinkedIn learning post about my study session on "${topicName}". Add bullet points explaining the core concept, what I learned today, and relevant professional hashtags. Base it on these study notes:\n${noteContent}`;
    } else if (type === 'takeaways') {
      prompt = `Write a short, punchy LinkedIn post highlighting the top 3 key takeaways from learning "${topicName}". Add hashtags.`;
    } else if (type === 'summary') {
      prompt = `Write a summary post explaining why "${topicName}" is critical for modern software engineering career paths.`;
    } else if (type === 'career_update') {
      prompt = `Write a milestone celebration post. I just completed learning the subject "${topicName}". Share my commitment to continuous learning and career readiness.`;
    }

    const messages = [
      { role: 'system', content: 'You are a professional technical advocate writing posts for LinkedIn. Make them clean, informative, and professional.' },
      { role: 'user', content: prompt }
    ];

    return await callLLMWithRetryAndFallback(messages, false);
  } catch (error) {
    console.error('[AI SERVICE] generateLinkedInPost failed:', error.message);
    throw error;
  }
};

/**
 * AI TOPIC TUTOR CHATBOT SERVICE
 */
export const generateTopicTutorResponse = async (topicName, userMessage, learnContent) => {
  try {
    const learnContextText = typeof learnContent === 'string' ? learnContent : JSON.stringify(learnContent || {});
    const isCodingTopic = isCodingOrITDomain(`${topicName} ${learnContextText}`);
    const responseMode = isCodingTopic
      ? 'For coding/IT topics, include clean, commented code snippets only when the user asks for implementation or when code is essential.'
      : 'This appears to be a non-coding course topic. Do NOT include code snippets, programming syntax, debugging steps, APIs, databases, or software-engineering framing. Use practical role-specific examples, checklists, templates, case studies, and exercises.';
    const prompt = `You are a world-class course tutor helping a student master "${topicName}".
Below is the cached learning content context for reference:
---
${learnContent}
---

The student's message is: "${userMessage}"

CRITICAL INSTRUCTIONS:
1. GREETINGS: If the student's message is a greeting (e.g. "hi", "hello", "hey", "good morning"), greet them warmly and ask them what questions they have about "${topicName}". Do NOT explain the entire topic from scratch, and do NOT include any quiz or question. Keep it brief.
2. ANSWERING QUESTIONS: If the student asks a question about "${topicName}" (e.g., "what is it?", "explain this", "how do I use X?"), answer their question directly, thoroughly, and clearly. Format your response in a ChatGPT-style structural breakdown: use bold markdown headings, numbered steps, and bulleted key points. ${responseMode}
3. QUIZ REGULATION: Only if the student's message explicitly and directly requests a quiz, test, or review question (e.g., "give me a quiz", "test me", "give me a question"), you must append an interactive multiple-choice quiz question at the end of your explanation.
If they do not explicitly request a quiz, test, or question, DO NOT output any :::quiz block.

If you generate a quiz, it MUST be structured in this exact JSON format enclosed inside a ":::quiz" block:

:::quiz
{
  "question": "Write a clear, conceptual multiple-choice question testing the core concepts explained above.",
  "options": [
    "A) First option description",
    "B) Second option description",
    "C) Third option description",
    "D) Fourth option description"
  ],
  "correctIndex": 1, // 0-based index of the correct option
  "explanation": "Provide a detailed, story-based explanation explaining why the correct option is right and the others are wrong."
}
:::

Format your text response (except the quiz block) using rich markdown (headers, bold, lists, and code blocks).`;

    const messages = [
      { role: 'system', content: 'You are an expert course tutor. Return clear, concise markdown explanations. Do not generate a quiz unless the user explicitly requests one.' },
      { role: 'user', content: prompt }
    ];

    return await callLLMWithRetryAndFallback(messages, false);
  } catch (error) {
    console.error('[AI SERVICE] generateTopicTutorResponse failed:', error.message);
    throw error;
  }
};

/**
 * TOPIC QUIZ QUESTIONS
 */
export const generateTopicQuizQuestions = async (topicName, subjectName, experienceLevel) => {
  try {
    const isCodingSubject = isCodingOrITDomain(`${subjectName} ${topicName}`);
    const assessmentMode = isCodingSubject
      ? 'Each question must test deep conceptual understanding, syntax edge cases, performance trade-offs, or error scenarios.'
      : 'Each question must test deep conceptual understanding, role-specific scenarios, decision trade-offs, professional judgment, terminology, metrics, and practical application. Do not include coding, syntax, DSA, API, database, debugging, or software architecture questions.';
    const prompt = `You are an elite course assessment writer.
Generate exactly 5 challenging multiple-choice questions (MCQs) for the topic "${topicName}" within the course "${subjectName}", tailored for a "${experienceLevel}" level learner.

${assessmentMode}

Your response MUST be a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "A clear, conceptual multiple-choice question testing the core mechanics.",
      "options": [
        "A) Option A description",
        "B) Option B description",
        "C) Option C description",
        "D) Option D description"
      ],
      "correctIndex": 2, // 0-based index of the correct option (e.g. 2 for Option C)
      "explanation": "Provide a detailed, narrative story-based explanation explaining why the correct option is right and others are wrong."
    }
  ]
}

CRITICAL: Return ONLY JSON. Do not write markdown tags or pre-ambles. Ensure correctIndex is a number. Ensure all double quotes inside the JSON values are properly escaped.`;

    const messages = [
      { role: 'system', content: 'You are an assessment writer that outputs JSON.' },
      { role: 'user', content: prompt }
    ];

    const res = await callLLMWithRetryAndFallback(messages, true);
    return res.questions || [];
  } catch (error) {
    console.error('[AI SERVICE] generateTopicQuizQuestions failed:', error.message);
    throw error;
  }
};

const classifyLearningActivityType = (topicName = '') => {
  const name = topicName.toLowerCase();
  if (/(merge sort|quick sort|binary search|dfs|bfs|algorithm|sorting|searching)/.test(name)) return 'algorithm';
  if (/(dns|tcp|http|packet|network|osi)/.test(name)) return 'packet';
  if (/(react lifecycle|git|version control|timeline|history)/.test(name)) return 'timeline';
  if (/(database join|joins|normalization|match)/.test(name)) return 'matching';
  if (/(scheduling|deadlock|operating system|cpu|process)/.test(name)) return 'simulation';
  if (/(oop|inheritance|polymorphism|encapsulation|class)/.test(name)) return 'relationship';
  if (/(compiler|pipeline|ci\/cd|build process)/.test(name)) return 'pipeline';
  if (/(heap|trie|tree|graph|hash table)/.test(name)) return 'visualization';
  if (/(bug|debug|exception|error handling)/.test(name)) return 'bugfix';
  return 'flow';
};

const createFallbackLearningActivity = (topicName, subjectName, experienceLevel) => {
  const activityType = classifyLearningActivityType(topicName);
  const flow = [
    { id: 'problem', step: 1, label: 'Problem', icon: 'error', description: 'Spot the real need.' },
    { id: 'concept', step: 2, label: topicName, icon: 'psychology_alt', description: 'Apply the core idea.' },
    { id: 'example', step: 3, label: 'Example', icon: 'deployed_code', description: 'Test with one case.' },
    { id: 'result', step: 4, label: 'Result', icon: 'verified', description: 'Explain the outcome.' },
  ];

  return {
    activityType,
    title: `${topicName} Concept Lab`,
    subtitle: `Learn ${topicName} through a visual ${activityType} activity.`,
    difficulty: experienceLevel || 'Beginner',
    scenario: `A ${subjectName || 'software'} team must use ${topicName} correctly in a product decision.`,
    objective: 'Arrange, test, and explain the concept in one minute.',
    estimatedTime: '3 min',
    flow,
    exercise: {
      prompt: 'Arrange the concept flow.',
      correctOrder: flow.map(item => item.id),
      choices: flow.map(item => item.label),
      pairs: [
        { left: 'Real product', right: 'Use the concept in context' },
        { left: 'Interview answer', right: 'Explain trade-offs clearly' },
      ],
      decisionOptions: [
        { id: 'guess', label: 'Guess', result: 'The concept stays abstract.', isCorrect: false },
        { id: 'example', label: 'Use example', result: 'The idea becomes testable.', isCorrect: true },
        { id: 'memorize', label: 'Memorize', result: 'Recall may fail under pressure.', isCorrect: false },
      ],
      bugLines: [
        { line: 1, code: `const concept = "${topicName}";`, isBug: false },
        { line: 2, code: 'skipConcreteExample();', isBug: true, explanation: 'A concept needs a concrete test case.' },
        { line: 3, code: 'explainTradeoff();', isBug: false },
      ],
    },
    memoryHack: `Remember ${topicName}: problem, rule, example, trade-off.`,
    realWorldExample: `${topicName} appears in everyday engineering decisions.`,
    commonMistake: 'Memorizing the definition without testing an example.',
    interviewTip: 'Start with purpose, then explain one trade-off.',
    summary: `${topicName} becomes easier when shown as a sequence of choices.`,
    successMessage: 'Concept locked. You can explain the visual path.',
    retryHint: 'Focus on cause, action, then outcome.',
  };
};

/**
 * AI LEARNING ACTIVITY ENGINE
 */
export const generateLearningActivity = async (topicName, subjectName, experienceLevel) => {
  const fallbackActivity = createFallbackLearningActivity(topicName, subjectName, experienceLevel);

  try {
    const prompt = `Create one AI-powered Concept Lab activity for the topic "${topicName}" in "${subjectName}" for a "${experienceLevel}" learner.

First classify the topic and choose the best activity type.
Allowed activityType values:
flow, algorithm, timeline, matching, simulation, packet, decision, pipeline, relationship, memory, bugfix, visualization.

Classification examples:
Frontend Backend -> flow
JWT -> flow
OAuth -> flow
DNS -> packet
TCP Handshake -> packet
HTTP -> packet
Merge Sort -> algorithm
Quick Sort -> algorithm
Binary Search -> algorithm
DFS -> algorithm
BFS -> algorithm
Heap -> visualization
Trie -> visualization
Compiler -> pipeline
Operating System Scheduling -> simulation
Deadlock -> simulation
Database Joins -> matching
Normalization -> matching
OOP -> relationship
React Lifecycle -> timeline
Git -> timeline
Docker -> flow
Kubernetes -> flow
REST API -> flow
Caching -> flow

Return ONLY valid JSON with this exact shape:
{
  "activityType": "flow",
  "title": "",
  "subtitle": "",
  "difficulty": "",
  "scenario": "",
  "objective": "",
  "estimatedTime": "",
  "flow": [
    {
      "id": "lowercase-id",
      "step": 1,
      "label": "",
      "icon": "material symbol icon name",
      "description": ""
    }
  ],
  "exercise": {
    "prompt": "",
    "correctOrder": ["step-id"],
    "choices": ["short option"],
    "pairs": [{ "left": "", "right": "" }],
    "decisionOptions": [{ "id": "", "label": "", "result": "", "isCorrect": true }],
    "bugLines": [{ "line": 1, "code": "", "isBug": false, "explanation": "" }]
  },
  "memoryHack": "",
  "realWorldExample": "",
  "commonMistake": "",
  "interviewTip": "",
  "summary": "",
  "successMessage": "",
  "retryHint": ""
}

Rules:
- Produce only valid JSON. No markdown.
- Never generate long theory.
- Teach visually.
- Use fewer than 12 words for each flow.description.
- Prefer diagrams and steps over paragraphs.
- Generate 4 to 7 flow nodes.
- Include Memory Hack, Real World Example, Interview Tip, Common Mistake.
- Include a 60-second practice task in exercise.prompt.
- For matching activities, fill pairs.
- For decision activities, fill decisionOptions.
- For bugfix activities, fill bugLines with exactly one isBug true.
- For flow, packet, algorithm, timeline, pipeline, simulation, relationship, memory, and visualization activities, fill correctOrder with the flow ids.
- Do not include markdown or comments.`;

    const messages = [
      { role: 'system', content: 'You are an AI Activity Engine. Classify the topic, choose the best activity, and output JSON only.' },
      { role: 'user', content: prompt }
    ];

    const activity = await callLLMWithRetryAndFallback(messages, true);
    return activity?.title && activity?.activityType && Array.isArray(activity.flow) ? activity : fallbackActivity;
  } catch (error) {
    console.error('[AI SERVICE] generateLearningActivity failed:', error.message);
    return fallbackActivity;
  }
};

export const generateTopicPracticeBoard = generateLearningActivity;

// Timeline/days parsing utility
function parseTimelineToDays(timeline) {
  if (!timeline) return 90;
  const cleaned = timeline.toLowerCase().trim();
  const numMatch = cleaned.match(/(\d+)/);
  const num = numMatch ? parseInt(numMatch[1], 10) : null;

  if (num === null) {
    if (cleaned.includes('year') || cleaned.includes('yr')) return 360;
    if (cleaned.includes('month') || cleaned.includes('mo')) return 90;
    if (cleaned.includes('week') || cleaned.includes('wk')) return 28;
    return 90;
  }

  if (cleaned.includes('year') || cleaned.includes('yr')) {
    return num * 360;
  }
  if (cleaned.includes('month') || cleaned.includes('mo') || cleaned.includes('mth')) {
    return num * 30;
  }
  if (cleaned.includes('week') || cleaned.includes('wk')) {
    return num * 7;
  }
  if (cleaned.includes('day')) {
    return num;
  }
  return 90;
}
