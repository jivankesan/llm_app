// api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL,
});

export default apiClient;