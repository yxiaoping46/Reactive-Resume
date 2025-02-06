import type { Language } from "@reactive-resume/utils";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";

import { LANGUAGES_KEY } from "@/client/constants/query-keys";

export const useLanguages = () => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    data: languages,
  } = useQuery({
    queryKey: [LANGUAGES_KEY],
    queryFn: async () => {
      // Since languages are not stored in Supabase, we'll use the API endpoint
      const response = await fetch('/api/translation/languages');
      if (!response.ok) throw new Error('Failed to fetch languages');
      
      const result = await response.json();
      return result as Language[];
    },
  });

  return { languages: languages ?? [], loading, error };
};
