import api from "./axios";

// ═══════════════════════════════════════
// REFERRAL CRUD
// ═══════════════════════════════════════
export const createReferral = (data) => api.post("/referrals", data);
export const getReferrals = (params) => api.get("/referrals", { params });
export const getReferralById = (id) => api.get(`/referrals/${id}`);
export const getMyReferrals = () => api.get("/referrals/my");
export const updateReferral = (id, data) => api.put(`/referrals/${id}`, data);
export const deleteReferral = (id) => api.delete(`/referrals/${id}`);

// ═══════════════════════════════════════
// REQUESTS
// ═══════════════════════════════════════
export const sendReferralRequest = (id, data) => api.post(`/referrals/${id}/request`, data);
export const respondToReferralRequest = (id, data) => api.patch(`/referrals/${id}/respond`, data);

// ═══════════════════════════════════════
// PROVIDER INITIATE CHAT
// ═══════════════════════════════════════
export const initiateReferralChat = (data) => api.post("/referrals/chat/initiate", data);

// ═══════════════════════════════════════
// CHAT
// ═══════════════════════════════════════
export const getMyReferralChats = () => api.get("/referrals/chat/list");
export const getReferralChatMessages = (chatId) => api.get(`/referrals/chat/${chatId}`);
export const sendReferralChatMessage = (data) => api.post("/referrals/chat/send", data);
