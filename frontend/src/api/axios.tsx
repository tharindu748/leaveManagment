import axios, { AxiosError } from "axios";
import { useAuth } from "@/context/auth-context";

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL||"http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuth.getState();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      config.headers["Accept-Language"] = "en";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const error = err as AxiosError;
    const originalRequest: any = error.config || {};
    const status = error.response?.status;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest?.url !== "/auth/refresh" &&
      useAuth.getState().accessToken
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        useAuth.getState().login(data.accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuth.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
