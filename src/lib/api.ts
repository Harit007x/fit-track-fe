import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // Required for httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., redirect to login)
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting...");
      // You could clear store and redirect here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
