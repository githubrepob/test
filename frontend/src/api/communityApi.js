import api from "./axios";

export const getFeedPosts = (params) => api.get("/posts/feed", { params });
export const createPost = (data) => api.post("/posts", data);
export const toggleLike = (id) => api.post(`/posts/${id}/like`);
export const addComment = (id, content) => api.post(`/posts/${id}/comment`, { content });
export const votePoll = (id, optionIndex) => api.post(`/posts/${id}/vote`, { optionIndex });
export const deletePost = (id) => api.delete(`/posts/${id}`);

export const getGroups = (params) => api.get("/groups", { params });
export const getGroupById = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post("/groups", data);
export const joinGroup = (id) => api.post(`/groups/${id}/join`);
export const leaveGroup = (id) => api.post(`/groups/${id}/leave`);
export const seedGroups = () => api.post("/groups/seed");
