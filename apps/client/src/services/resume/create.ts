import type { CreateResumeDto, ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";
import { defaultResumeData } from "@reactive-resume/schema";
import { queryClient } from "@/client/libs/query-client";

export const useCreateResume = () => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    mutateAsync: createResumeFn,
  } = useMutation({
    mutationFn: async (data: CreateResumeDto) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not found");

      const { data: resume, error } = await supabase
        .from('resumes_v3')
        .insert({
          user_id: user.user.id,
          title: data.title,
          slug: data.slug,
          visibility: data.visibility,
          data: defaultResumeData,
        })
        .select()
        .single();

      if (error) throw error;
      return resume;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ResumeDto>(["resume", { id: data.id }], data);

      queryClient.setQueryData<ResumeDto[]>(["resumes"], (cache) => {
        if (!cache) return [data];
        return [...cache, data];
      });
    },
  });

  return { createResume: createResumeFn, loading, error };
};
