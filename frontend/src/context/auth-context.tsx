import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import api from "@/api/axios";

type User = { id: string; role: string; email: string } | null;

interface AuthState {
  user: User;
  accessToken: string | null;
  isLoading: boolean;
  login: (accessToken: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  login: (accessToken) => {
    try {
      const decoded = jwtDecode<{ id: string; role: string; email: string }>(
        accessToken
      );
      set({
        user: { id: decoded.id, role: decoded.role, email: decoded.email },
        accessToken,
      });
    } catch (error) {
      set({ user: null, accessToken: null });
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      set({ user: null, accessToken: null });
    }
  },
  checkAuth: async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      get().login(data.accessToken);
    } catch (error) {
    } finally {
      set({ isLoading: false });
    }
  },
}));
