import type { ResumeDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";

import { RESUMES_KEY } from "@/client/constants/query-keys";

export const useResumes = () => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    data: resumes,
  } = useQuery({
    queryKey: RESUMES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resumes_v3')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return { resumes, loading, error };
};
