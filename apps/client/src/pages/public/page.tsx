import { t } from "@lingui/macro";
import { useParams } from "react-router-dom";
import { usePublicResume, usePrintResume } from "@/client/services/resume";
import { useSupabase } from "@/client/providers/supabase.provider";
import { useEffect } from "react";
import type { LoaderFunction } from "react-router";
import { redirect } from "react-router";

export const publicLoader: LoaderFunction = async ({ params }) => {
  const { username, slug } = params;
  if (!username || !slug) return redirect("/404");
  return null;
};

export const PublicResumePage = () => {
  const { username = "", slug = "" } = useParams();
  const { data: resume, isPending: loading } = usePublicResume(username, slug);
  const { printResume } = usePrintResume();
  const { supabase } = useSupabase();

  // Update view statistics when the resume is loaded
  useEffect(() => {
    if (resume?.id) {
      void supabase
        .from('resume_v3_statistics')
        .upsert({
          resume_id: resume.id,
          views: 1,
          downloads: 0,
        }, {
          onConflict: 'resume_id',
          count: 'exact'
        });
    }
  }, [resume?.id, supabase]);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{t`Loading Resume`}</div>
          <div className="text-sm text-muted-foreground">{t`Please wait while we load the resume...`}</div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{t`Resume Not Found`}</div>
          <div className="text-sm text-muted-foreground">{t`The resume you're looking for doesn't exist or is private.`}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-x-2">
          <h1 className="text-xl font-bold">{resume.title}</h1>
        </div>
        <button
          onClick={() => printResume({ id: resume.id })}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t`Download PDF`}
        </button>
      </div>
      <iframe
        title={resume.title}
        src={`/artboard/preview?resumeId=${resume.id}`}
        className="h-full w-full"
      />
    </main>
  );
};
