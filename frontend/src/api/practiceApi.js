import api from "./axios";

export const generatePracticeQuestions = (config) =>
  api.post("/ml/practice/generate", config);
