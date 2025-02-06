import type { StatisticsDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";

import { RESUME_KEY } from "@/client/constants/query-keys";

export const useResumeStatistics = (id: string, enabled = false) => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    data: statistics,
  } = useQuery({
    queryKey: [...RESUME_KEY, "statistics", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resume_v3_statistics')
        .select('views, downloads')
        .eq('resume_id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore not found error
        throw error;
      }

      return {
        views: data?.views ?? 0,
        downloads: data?.downloads ?? 0,
      };
    },
    enabled,
  });

  return { statistics, loading, error };
};
