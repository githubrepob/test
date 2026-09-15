import api from "./axios";

export const getMyConversations = () => api.get("/dm/conversations");
export const getOrCreateConversation = (userId) => api.get(`/dm/conversation/${userId}`);
export const getMessages = (conversationId) => api.get(`/dm/${conversationId}/messages`);
export const sendMessage = (conversationId, content) => api.post(`/dm/${conversationId}/send`, { content });
export const searchUsers = (q) => api.get("/dm/search-users", { params: { q } });
