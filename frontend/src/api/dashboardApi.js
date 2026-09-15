import api from "./axios";

// Dashboard
export const getDashboardData = () => api.get("/dashboard");
export const updateCodingStats = (data) => api.put("/dashboard/coding-stats", data);
export const syncCodingProfile = (data) => api.post("/dashboard/sync-coding-profile", data);
export const updateAcademicStats = (data) => api.put("/dashboard/academic-stats", data);
export const updateProfile = (data) => api.put("/dashboard/profile", data);
export const updateNotificationPrefs = (data) => api.put("/dashboard/notification-prefs", data);
export const getCompanyReadiness = (company) => api.get("/dashboard/company-readiness", { params: { company } });
export const getAllCompanyReadiness = () => api.get("/dashboard/company-readiness");

// Public profile
export const getUserPublicProfile = (userId) => api.get(`/dashboard/user/${userId}`);

// Personal Notes
export const getPersonalNotes = () => api.get("/dashboard/notes");
export const createPersonalNote = (data) => api.post("/dashboard/notes", data);
export const updatePersonalNote = (id, data) => api.put(`/dashboard/notes/${id}`, data);
export const deletePersonalNote = (id) => api.delete(`/dashboard/notes/${id}`);
