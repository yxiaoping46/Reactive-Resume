import type { ImportResumeDto, ResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/client/providers/supabase.provider";
import { queryClient } from "@/client/libs/query-client";
import { generateRandomName } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";

export const useImportResume = () => {
  const { supabase } = useSupabase();

  const {
    error,
    isPending: loading,
    mutateAsync: importResumeFn,
  } = useMutation({
    mutationFn: async (data: ImportResumeDto) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not found");

      const randomTitle = generateRandomName();

      const { data: resume, error } = await supabase
        .from('resumes_v3')
        .insert({
          user_id: user.user.id,
          visibility: "private",
          data: data.data,
          title: data.title ?? randomTitle,
          slug: data.slug ?? slugify(randomTitle),
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

  return { importResume: importResumeFn, loading, error };
};
