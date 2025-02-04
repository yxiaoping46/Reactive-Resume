import type { UserDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSupabase } from "@/client/providers/supabase.provider";
import { useAuthStore } from "@/client/stores/auth";

export const useUser = () => {
  const { supabase } = useSupabase();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    error,
    isPending: loading,
    data: user,
  } = useQuery<UserDto | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return null;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Create UserDto with required fields
      const userDto: UserDto = {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.full_name || session.user.user_metadata?.full_name || '',
        picture: profile?.picture || session.user.user_metadata?.picture,
        username: profile?.username || '',
        locale: profile?.locale || 'en',
        emailVerified: session.user.email_confirmed_at ? true : false,
        twoFactorEnabled: false,
        provider: 'email',
        createdAt: new Date(session.user.created_at),
        updatedAt: profile?.updated_at ? new Date(profile.updated_at) : new Date(),
      };

      return userDto;
    },
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return { user, loading, error };
};
