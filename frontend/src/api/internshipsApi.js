import api from "./axios";

// ═══════════════════════════════════════
// INTERNSHIPS
// ═══════════════════════════════════════
export const getInternships = (params) => api.get("/internships", { params });
export const getInternshipById = (id) => api.get(`/internships/${id}`);
export const createInternship = (data) => api.post("/internships", data);
export const applyToInternship = (id, data) => api.post(`/internships/${id}/apply`, data);
export const applyExternally = (id) => api.post(`/internships/${id}/apply-external`);
export const getMyInternships = () => api.get("/internships/my");
export const getMyApplications = () => api.get("/internships/my-applications");
export const seedInternships = () => api.post("/internships/seed");
export const fetchExternalInternships = () => api.post("/internships/fetch-external");
export const updateApplicantStatus = (id, data) => api.patch(`/internships/${id}/applicant-status`, data);

// ═══════════════════════════════════════
// INTERNSHIP CHAT
// ═══════════════════════════════════════
export const getMyChats = () => api.get("/internships/chat/list");
export const getChatMessages = (chatId) => api.get(`/internships/chat/${chatId}`);
export const sendChatMessage = (data) => api.post("/internships/chat/send", data);

// ═══════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════
export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch("/notifications/read-all");

// ═══════════════════════════════════════
// USER PROFILE (for fresh aura points)
// ═══════════════════════════════════════
export const getMyProfile = () => api.get("/auth/me");
