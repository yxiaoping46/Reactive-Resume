import { t } from "@lingui/macro";
import { useParams } from "react-router-dom";
import { useResume } from "@/client/services/resume";
import { BuilderHeader } from "./_components/header";
import { Helmet } from "react-helmet-async";
import type { LoaderFunction } from "react-router";
import { redirect } from "react-router";
import { createClient } from "@supabase/supabase-js";
import { useResumeStore } from "@/client/stores/resume";
import { useEffect, useRef } from "react";

export const BuilderPage = () => {
  const { id = "" } = useParams();
  const { data: resume, isPending: loading } = useResume(id);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (resume && iframeRef.current) {
      const onIframeLoad = () => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "SET_RESUME", payload: resume.data },
          window.location.origin
        );
      };

      iframeRef.current.addEventListener('load', onIframeLoad);
      return () => {
        iframeRef.current?.removeEventListener('load', onIframeLoad);
      };
    }
  }, [resume]);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{t`Loading Resume`}</div>
          <div className="text-sm text-muted-foreground">{t`Please wait while we load your resume...`}</div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{t`Resume Not Found`}</div>
          <div className="text-sm text-muted-foreground">{t`The resume you're looking for doesn't exist.`}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex h-screen w-screen overflow-hidden">
      <Helmet>
        <title>{resume.title} - {t`Reactive Resume`}</title>
      </Helmet>

      <div className="flex w-80 flex-col border-r">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">{t`Sections`}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Sections list will go here */}
        </div>
      </div>

      <div className="relative flex grow flex-col">
        <BuilderHeader />
        <iframe
          ref={iframeRef}
          title={resume.title}
          src={`/artboard/builder?resumeId=${resume.id}`}
          className="h-full w-full"
        />
      </div>

      <div className="flex w-80 flex-col border-l">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">{t`Properties`}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Properties panel will go here */}
        </div>
      </div>
    </main>
  );
};

export const builderLoader: LoaderFunction = async ({ params }) => {
  try {
    // Create a new Supabase client
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const id = params.id!;

    // Get the resume and verify ownership
    const { data: resume, error } = await supabase
      .from('resumes_v3')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !resume) {
      return redirect("/dashboard");
    }

    // Set the resume in the store
    useResumeStore.setState({ resume });
    useResumeStore.temporal.getState().clear();

    return resume;
  } catch {
    return redirect("/dashboard");
  }
};
