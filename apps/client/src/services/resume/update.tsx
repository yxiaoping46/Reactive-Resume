import type { ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useSupabase } from "@/client/providers/supabase.provider";
import { queryClient } from "@/client/libs/query-client";
import { createClient } from "@supabase/supabase-js";

// Standalone debounced function for use in stores
export const debouncedUpdateResume = debounce(async (data: UpdateResumeDto) => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not found");

  const { data: resume, error } = await supabase
    .from('resumes_v3')
    .update({
      title: data.title,
      slug: data.slug,
      visibility: data.visibility,
      data: data.data,
    })
    .eq('id', data.id)
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
}, 500);

// React hook for use in components
export const useUpdateResume = () => {
  const { supabase } = useSupabase();

  const updateResume = async (data: UpdateResumeDto) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not found");

    const { data: resume, error } = await supabase
      .from('resumes_v3')
      .update({
        title: data.title,
        slug: data.slug,
        visibility: data.visibility,
        data: data.data,
      })
      .eq('id', data.id)
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
  };

  const {
    error,
    isPending: loading,
    mutateAsync: updateResumeFn,
  } = useMutation({
    mutationFn: updateResume,
  });

  return { updateResume: updateResumeFn, loading, error };
};
