import api from "./axios";

export const getHackathons = (params) => api.get("/hackathons", { params });
export const getHackathonById = (id) => api.get(`/hackathons/${id}`);
export const createHackathon = (data) => api.post("/hackathons", data);
export const toggleInterest = (id) => api.post(`/hackathons/${id}/interest`);
export const registerTeam = (id, data) => api.post(`/hackathons/${id}/register`, data);
export const withdrawTeam = (id) => api.delete(`/hackathons/${id}/register`);
export const getMyHackathons = () => api.get("/hackathons/my/organized");
export const markAttendance = (id) => api.post(`/hackathons/${id}/attend`);
export const seedHackathons = () => api.post("/hackathons/seed");
