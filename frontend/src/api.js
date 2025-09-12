// src/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || ""; // '' uses relative URL (dev with proxy)

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// optional: automatically attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
