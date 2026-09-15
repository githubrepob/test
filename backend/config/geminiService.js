const axios = require("axios");

/**
 * Server-side Gemini adapter.
 * Keep the API key on the backend only. The frontend never receives it.
 * Default model is a current stable Gemini model; override with GEMINI_MODEL.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const callGeminiAPI = async (prompt, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured on the backend");
  }

  const { systemInstruction = "", responseSchema = null, temperature = 0.2 } = options;
  const body = {
    systemInstruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      ...(responseSchema
        ? { responseMimeType: "application/json", responseSchema }
        : {}),
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    timeout: 30000,
  });

  const text = response.data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned an empty response");
  return text;
};

const parseJsonResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch (_) {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned);
  }
};

module.exports = { callGeminiAPI, parseJsonResponse, GEMINI_MODEL };
