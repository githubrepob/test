const axios = require("axios");
const Note = require("../models/Note");
const TechIssue = require("../models/TechIssue");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

// 1. Predict Placement
const predictPlacement = async (req, res) => {
  try {
    const payload = req.body;
    const response = await axios.post(`${ML_SERVICE_URL}/predict/placement`, payload, { timeout: 3000 });
    return res.json(response.data);
  } catch (error) {
    console.error("Placement ML service error:", error.message);
    return res.status(503).json({
      message: "Placement ML service unavailable. Start ml-service on port 8001 and retry.",
      code: "ML_UNAVAILABLE"
    });
  }
};

// 2. Semantic Search Notes
const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      const notes = await Note.find().limit(20).lean();
      return res.json(notes);
    }

    const allNotes = await Note.find().lean();
    if (!allNotes.length) return res.json([]);

    const documents = allNotes.map((n) => ({
      id: n._id.toString(),
      title: n.title || "",
      content: `${n.subject || ""} ${n.description || ""} ${(n.tags || []).join(" ")}`
    }));

    try {
      const mlRes = await axios.post(
        `${ML_SERVICE_URL}/semantic-search`,
        { query: q, documents, top_k: 20 },
        { timeout: 3000 }
      );

      const scoreMap = new Map();
      mlRes.data.results.forEach((r) => scoreMap.set(r.id, r.similarityScore));

      const rankedNotes = allNotes
        .filter((n) => scoreMap.has(n._id.toString()))
        .map((n) => ({ ...n, similarityScore: scoreMap.get(n._id.toString()) }))
        .sort((a, b) => b.similarityScore - a.similarityScore);

      return res.json(rankedNotes);
    } catch (mlErr) {
      console.warn("⚠️ ML Search fallback to regex title search:", mlErr.message);
      const filtered = allNotes.filter((n) =>
        n.title.toLowerCase().includes(q.toLowerCase()) ||
        (n.subject && n.subject.toLowerCase().includes(q.toLowerCase()))
      );
      return res.json(filtered);
    }
  } catch (error) {
    console.error("Search Notes Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Semantic Search Tech Issues
const searchTechIssues = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      const issues = await TechIssue.find().limit(20).lean();
      return res.json(issues);
    }

    const allIssues = await TechIssue.find().lean();
    if (!allIssues.length) return res.json([]);

    const documents = allIssues.map((i) => ({
      id: i._id.toString(),
      title: i.title || "",
      content: `${i.description || ""} ${(i.tags || []).join(" ")}`
    }));

    try {
      const mlRes = await axios.post(
        `${ML_SERVICE_URL}/semantic-search`,
        { query: q, documents, top_k: 20 },
        { timeout: 3000 }
      );

      const scoreMap = new Map();
      mlRes.data.results.forEach((r) => scoreMap.set(r.id, r.similarityScore));

      const rankedIssues = allIssues
        .filter((i) => scoreMap.has(i._id.toString()))
        .map((i) => ({ ...i, similarityScore: scoreMap.get(i._id.toString()) }))
        .sort((a, b) => b.similarityScore - a.similarityScore);

      return res.json(rankedIssues);
    } catch (mlErr) {
      console.warn("⚠️ ML Tech Issue Search fallback to title match:", mlErr.message);
      const filtered = allIssues.filter((i) =>
        i.title.toLowerCase().includes(q.toLowerCase())
      );
      return res.json(filtered);
    }
  } catch (error) {
    console.error("Search Tech Issues Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Duplicate Check
const checkDuplicate = async (req, res) => {
  try {
    const { title, description } = req.body;
    const textToCheck = `${title || ""} ${description || ""}`.trim();

    if (!textToCheck) {
      return res.json({ isDuplicate: false, maxSimilarity: 0 });
    }

    const existing = await TechIssue.find().select("title description").limit(50).lean();
    const existingTexts = existing.map((i) => `${i.title} ${i.description || ""}`.trim());

    try {
      const mlRes = await axios.post(
        `${ML_SERVICE_URL}/duplicate-check`,
        { text: textToCheck, existing_items: existingTexts, threshold: 0.75 },
        { timeout: 3000 }
      );
      return res.json(mlRes.data);
    } catch (mlErr) {
      console.warn("⚠️ ML Duplicate check fallback:", mlErr.message);
      const isDup = existingTexts.some((t) => t.toLowerCase() === textToCheck.toLowerCase());
      return res.json({ isDuplicate: isDup, maxSimilarity: isDup ? 1.0 : 0.0 });
    }
  } catch (error) {
    console.error("Check Duplicate Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const { callGeminiAPI, parseJsonResponse } = require("../config/geminiService");

// 5. Research Summarizer — real Gemini generation, no canned response.
const summarizeResearch = async (req, res) => {
  try {
    const { text, mode = "study" } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Text is required" });

    const schema = {
      type: "object",
      properties: {
        wordCount: { type: "integer" },
        summary: { type: "string" },
        keyTakeaways: { type: "array", items: { type: "string" } },
        eli5Explanation: { type: "string" },
        examQuestions: { type: "array", items: { type: "string" } },
        flashcards: {
          type: "array",
          items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } }, required: ["question", "answer"] }
        }
      },
      required: ["wordCount", "summary", "keyTakeaways", "eli5Explanation", "examQuestions", "flashcards"]
    };
    const prompt = `Analyze the following student-provided academic/research text. Generate original content from the input; never invent claims that are absent from it. Mode: ${mode}. Return 5-8 concise takeaways, 4 exam questions and 5 flashcards.\n\nTEXT:\n${text.slice(0, 20000)}`;
    const raw = await callGeminiAPI(prompt, {
      systemInstruction: "You are an academic study assistant. Be faithful to the supplied text. If evidence is missing, explicitly say so instead of fabricating facts.",
      responseSchema: schema,
      temperature: 0.2,
    });
    return res.json(parseJsonResponse(raw));
  } catch (error) {
    console.error("Gemini research summarizer error:", error.response?.data || error.message);
    return res.status(503).json({ message: "AI service unavailable. Configure GEMINI_API_KEY and retry.", code: "AI_UNAVAILABLE" });
  }
};

// 6. Mock Interview Evaluator — evaluates the student's actual answer.
const evaluateInterview = async (req, res) => {
  try {
    const { domain, question, answer } = req.body;
    if (!question || !answer?.trim()) return res.status(400).json({ message: "Question and answer are required" });
    const schema = {
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 10 },
        rating: { type: "string" },
        feedback: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        missingConcepts: { type: "array", items: { type: "string" } },
        modelAnswer: { type: "string" },
        nextStep: { type: "string" }
      },
      required: ["score", "rating", "feedback", "strengths", "missingConcepts", "modelAnswer", "nextStep"]
    };
    const prompt = `Evaluate this student interview answer for ${domain || "technical interview"}. Score the answer itself, not the student as a person. Consider correctness, completeness, clarity, complexity/trade-offs and examples where relevant.\nQUESTION: ${question}\nSTUDENT ANSWER: ${answer}`;
    const raw = await callGeminiAPI(prompt, {
      systemInstruction: "You are a strict but constructive technical interviewer. Do not give a high score merely because the answer is long.",
      responseSchema: schema,
      temperature: 0.2,
    });
    return res.json(parseJsonResponse(raw));
  } catch (error) {
    console.error("Gemini interview evaluator error:", error.response?.data || error.message);
    return res.status(503).json({ message: "AI service unavailable. Configure GEMINI_API_KEY and retry.", code: "AI_UNAVAILABLE" });
  }
};

// Generate a configurable, original practice set. The client receives answer keys so it can
// provide immediate self-assessment; these must never be presented as verified company PYQs.
const generatePracticeQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty = "medium", count = 5, mode = "interview", company = "" } = req.body;
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 20);

    if (!subject?.trim() || !topic?.trim()) {
      return res.status(400).json({ message: "Subject and topic are required." });
    }

    const isInterview = mode === "interview";
    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: isInterview
              ? {
                  question: { type: "string" },
                  expectedPoints: { type: "array", items: { type: "string" } },
                  followUp: { type: "string" }
                }
              : {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correctIndex: { type: "integer", minimum: 0, maximum: 3 },
                  explanation: { type: "string" }
                },
            required: isInterview
              ? ["question", "expectedPoints", "followUp"]
              : ["question", "options", "correctIndex", "explanation"]
          }
        }
      },
      required: ["title", "questions"]
    };

    const companyContext = company ? ` for a ${company} hiring-style assessment` : "";
    const prompt = isInterview
      ? `Create exactly ${safeCount} original ${difficulty}-difficulty technical interview questions about ${topic} in ${subject}${companyContext}. Each should test deep understanding, trade-offs, edge cases, or practical implementation. Include concise expected answer points and one realistic follow-up. Do not claim the questions are past-year questions.`
      : `Create exactly ${safeCount} original ${difficulty}-difficulty multiple-choice practice questions about ${topic} in ${subject}${companyContext}. Each question must have exactly four plausible options, one correct answer index from 0 to 3, and a concise explanation. Do not claim the questions are past-year questions.`;

    const raw = await callGeminiAPI(prompt, {
      systemInstruction: "You create rigorous, accurate academic and placement-preparation material. Never fabricate a company PYQ, exam statistic, or hiring policy.",
      responseSchema: schema,
      temperature: 0.45,
    });
    const generated = parseJsonResponse(raw);
    return res.json({ ...generated, source: "ai-generated" });
  } catch (error) {
    console.error("Practice question generation error:", error.response?.data || error.message);
    return res.status(503).json({ message: "Question generation is unavailable. Configure GEMINI_API_KEY and retry.", code: "AI_UNAVAILABLE" });
  }
};

// 7. Resume Analyzer — Gemini compares the actual profile against the supplied target role/company context.
const analyzeResume = async (req, res) => {
  try {
    const { targetCompany, targetRole, jobDescription = "", skills = [], cgpa, solvedCount, projects = [] } = req.body;
    const schema = {
      type: "object",
      properties: {
        targetCompany: { type: "string" },
        matchScore: { type: "number", minimum: 0, maximum: 100 },
        strengths: { type: "array", items: { type: "string" } },
        missingSkills: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        suggestedResumeBullets: { type: "array", items: { type: "string" } },
        caveat: { type: "string" }
      },
      required: ["targetCompany", "matchScore", "strengths", "missingSkills", "recommendations", "suggestedResumeBullets", "caveat"]
    };
    const profile = JSON.stringify({ targetCompany, targetRole, jobDescription, skills, cgpa, solvedCount, projects });
    const raw = await callGeminiAPI(`Analyze this student's profile for the target role. Use the job description when supplied; otherwise state that the analysis is generic and should not be treated as an employer's official screening rule.\nPROFILE:\n${profile}`, {
      systemInstruction: "You are a career/resume analyst. Never invent an employer requirement. Distinguish supplied evidence from assumptions.",
      responseSchema: schema,
      temperature: 0.2,
    });
    return res.json(parseJsonResponse(raw));
  } catch (error) {
    console.error("Gemini resume analyzer error:", error.response?.data || error.message);
    return res.status(503).json({ message: "AI service unavailable. Configure GEMINI_API_KEY and retry.", code: "AI_UNAVAILABLE" });
  }
};

// 8. Code Bug Explainer — Gemini analyzes the actual submitted code.
const explainCodeBug = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: "Code is required" });
    const schema = {
      type: "object",
      properties: {
        bugSummary: { type: "string" },
        severity: { type: "string", enum: ["low", "medium", "high", "none"] },
        fixedCode: { type: "string" },
        explanation: { type: "array", items: { type: "string" } },
        testsToRun: { type: "array", items: { type: "string" } }
      },
      required: ["bugSummary", "severity", "fixedCode", "explanation", "testsToRun"]
    };
    const raw = await callGeminiAPI(`Review this ${language} code. Identify real bugs or risks, explain them, and produce a corrected version only when a correction is justified.\n\nCODE:\n${code.slice(0, 30000)}`, {
      systemInstruction: "You are a senior code reviewer. Preserve the user's intended behavior. Do not claim code was executed; reason from static analysis unless execution evidence is provided.",
      responseSchema: schema,
      temperature: 0.1,
    });
    return res.json(parseJsonResponse(raw));
  } catch (error) {
    console.error("Gemini code explainer error:", error.response?.data || error.message);
    return res.status(503).json({ message: "AI service unavailable. Configure GEMINI_API_KEY and retry.", code: "AI_UNAVAILABLE" });
  }
};

module.exports = {
  predictPlacement,
  searchNotes,
  searchTechIssues,
  checkDuplicate,
  summarizeResearch,
  evaluateInterview,
  generatePracticeQuestions,
  analyzeResume,
  explainCodeBug,
};
