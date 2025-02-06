import { User } from '@supabase/supabase-js';
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: User | null;
};

type AuthActions = {
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => {
        set({ user });
      },
    }),
    { name: "auth" },
  ),
);
