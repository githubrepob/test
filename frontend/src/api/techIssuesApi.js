import api from "./axios";

export const createIssue = (data) =>
  api.post("/tech-issues", data);

export const getAllIssues = () =>
  api.get("/tech-issues");

export const getSingleIssue = (id) =>
  api.get(`/tech-issues/${id}`);
