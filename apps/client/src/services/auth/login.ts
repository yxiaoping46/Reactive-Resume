import type { AuthResponseDto, LoginDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useSupabase } from "@/client/providers/supabase.provider";
import { useAuthStore } from "@/client/stores/auth";

export const useLogin = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    error,
    isPending: loading,
    mutateAsync: loginFn,
  } = useMutation({
    mutationFn: async (data: LoginDto) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.identifier,
        password: data.password,
      });

      if (error) throw error;
      return authData;
    },
    onSuccess: (data) => {
      setUser(data.user);
      void navigate("/dashboard/resumes");
    },
  });

  return { login: loginFn, loading, error };
};
