import api from "./axios";

export const getNotes = (params) => api.get("/notes", { params });
export const getNoteById = (id) => api.get(`/notes/${id}`);
export const createNote = (data) => api.post("/notes", data);
export const downloadNote = (id) => api.post(`/notes/${id}/download`);
export const generateSummary = (id) => api.get(`/notes/${id}/summary`);
export const rateNote = (id, score) => api.post(`/notes/${id}/rate`, { score });
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const getMyNotes = () => api.get("/notes/my");
