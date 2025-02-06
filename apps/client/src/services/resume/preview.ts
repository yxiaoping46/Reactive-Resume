import type { UrlDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";

import { RESUME_PREVIEW_KEY } from "@/client/constants/query-keys";

export const useResumePreview = (id: string) => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    data,
  } = useQuery({
    queryKey: [RESUME_PREVIEW_KEY, { id }],
    queryFn: async () => {
      const { data: resume, error: resumeError } = await supabase
        .from('resumes_v3')
        .select('*')
        .eq('id', id)
        .single();

      if (resumeError) throw resumeError;

      // Call the preview service
      const response = await fetch(`/api/resume/print/${id}/preview`);
      if (!response.ok) throw new Error('Failed to generate preview');
      
      const result = await response.json();
      return result as UrlDto;
    },
  });

  return { url: data?.url, loading, error };
};
