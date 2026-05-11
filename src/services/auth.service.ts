import api from "../lib/api";

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    name: string;
    email: string;
  };
  accessToken?: string;
}

export const authService = {
  login: async (email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", { email, password, rememberMe });
    return response.data;
  },

  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signup", { name, email, password });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/logout");
    return response.data;
  },
};
