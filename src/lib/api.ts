import axios from "axios";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

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
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (!isLoginRequest) {
        console.error("Unauthorized or Session Expired! Redirecting to login...");
        const authState = useAuthStore.getState();
        if (authState.isAuthenticated) {
          authState.logout();
          toast.error("Your session has expired. Please log in again.");
        }
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
