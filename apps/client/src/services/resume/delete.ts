import type { DeleteResumeDto, ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";
import { queryClient } from "@/client/libs/query-client";

export const useDeleteResume = () => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    mutateAsync: deleteResumeFn,
  } = useMutation({
    mutationFn: async (data: DeleteResumeDto) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not found");

      const { data: resume, error } = await supabase
        .from('resumes_v3')
        .delete()
        .eq('id', data.id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return resume;
    },
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ["resume", data.id] });

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [];
        return cache.filter((resume) => resume.id !== data.id);
      });
    },
  });

  return { deleteResume: deleteResumeFn, loading, error };
};
