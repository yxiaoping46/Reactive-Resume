import type { ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";
import { queryClient } from "@/client/libs/query-client";

type LockResumeArgs = {
  id: string;
  set: boolean;
};

export const useLockResume = () => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    mutateAsync: lockResumeFn,
  } = useMutation({
    mutationFn: async ({ id, set }: LockResumeArgs) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not found");

      const { data: resume, error } = await supabase
        .from('resumes_v3')
        .update({ locked: set })
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;

      queryClient.setQueryData<ResumeDto>(["resume", { id: resume.id }], resume);

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [resume];
        return cache.map((item) => {
          if (item.id === resume.id) return resume;
          return item;
        });
      });

      return resume;
    },
  });

  return { lockResume: lockResumeFn, loading, error };
};
