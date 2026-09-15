import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* REGISTER */
export const registerUser = async (userData) => {
  const res = await API.post("/auth/register", userData);
  return res.data;
};

/* LOGIN */
export const loginUser = async (credentials) => {
  const res = await API.post("/auth/login", credentials);
  return res.data;
};
