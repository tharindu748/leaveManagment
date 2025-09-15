import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import api from "@/api/axios";

type User = {
  id: number;
  email: string;
  isAdmin: boolean;
  employeeId: string | null;
} | null;

interface AuthState {
  user: User;
  accessToken: string | null;
  isLoading: boolean;
  login: (accessToken: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

type JwtPayload = {
  sub: number;
  email: string;
  isAdmin: boolean;
  employeeId: string | null;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  login: (accessToken) => {
    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      set({
        user: {
          id: decoded.sub,
          email: decoded.email,
          isAdmin: decoded.isAdmin,
          employeeId: decoded.employeeId,
        },
        accessToken,
      });
    } catch {
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
