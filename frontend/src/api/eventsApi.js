import api from "./axios";

// Events CRUD
export const getEvents = (params) => api.get("/events", { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post("/events", data);
export const getTrendingEvents = () => api.get("/events/trending");
export const getEventsByMonth = (year, month) => api.get("/events/calendar", { params: { year, month } });
export const getMyEvents = () => api.get("/events/my");
export const getMyRegistrations = () => api.get("/events/my-registrations");
export const seedEvents = () => api.post("/events/seed");

// Interactions
export const toggleLikeEvent = (id) => api.post(`/events/${id}/like`);
export const toggleInterested = (id) => api.post(`/events/${id}/interested`);
export const toggleBookmark = (id) => api.post(`/events/${id}/bookmark`);
export const registerForEvent = (id) => api.post(`/events/${id}/register`);
export const markAttendance = (id) => api.post(`/events/${id}/attend`);
export const withdrawFromEvent = (id) => api.delete(`/events/${id}/register`);
export const getEventRegistrations = (id) => api.get(`/events/${id}/registrations`);

// Comments
export const getEventComments = (id) => api.get(`/events/${id}/comments`);
export const addEventComment = (id, data) => api.post(`/events/${id}/comments`, data);
