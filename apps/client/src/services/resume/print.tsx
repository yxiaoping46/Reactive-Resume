import { t } from "@lingui/macro";
import type { UrlDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";
import { toast } from "@/client/hooks/use-toast";

export const usePrintResume = () => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    mutateAsync: printResumeFn,
  } = useMutation({
    mutationFn: async (data: { id: string }) => {
      const { data: resume, error: resumeError } = await supabase
        .from('resumes_v3')
        .select('*')
        .eq('id', data.id)
        .single();

      if (resumeError) throw resumeError;

      // Update statistics
      const { error: statsError } = await supabase
        .from('resume_v3_statistics')
        .upsert({
          resume_id: data.id,
          downloads: 1,
          views: 0,
        }, {
          onConflict: 'resume_id',
          count: 'exact'
        });

      if (statsError) {
        console.error('Failed to update statistics:', statsError);
      }

      // Call the print service
      const response = await fetch(`/api/resume/print/${data.id}`);
      if (!response.ok) throw new Error('Failed to print resume');
      
      const result = await response.json();
      return result as UrlDto;
    },
    onError: (error) => {
      const message = error.message;

      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: message,
      });
    },
  });

  return { printResume: printResumeFn, loading, error };
};
