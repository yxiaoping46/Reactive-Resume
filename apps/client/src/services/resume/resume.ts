import type { ResumeDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";

export const useResumes = () => {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resumes_v3')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useResume = (id: string) => {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ["resume", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resumes_v3')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const usePublicResume = (username: string, slug: string) => {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ["resume", username, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resumes_v3')
        .select('*, users!inner(username)')
        .eq('users.username', username)
        .eq('slug', slug)
        .eq('visibility', 'public')
        .single();

      if (error) throw error;
      return data;
    },
  });
};
