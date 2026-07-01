"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LofficeDesktopShell } from "@/components/office/LofficeDesktopShell";
import { WorkspacePanel } from "@/components/workspace/WorkspacePanel";
import { LoCommandProvider } from "@/context/LoCommandContext";
import { getDocument, type LofficeDocument } from "@/lib/storage";
import { fixFilename } from "@/lib/filename";

function WorkspaceContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const [doc, setDoc] = useState<LofficeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.replace("/"); return; }
    getDocument(id).then((d) => {
      if (!d) router.replace("/");
      else setDoc({ ...d, name: fixFilename(d.name) });
      setLoading(false);
    });
  }, [id, router]);

  if (loading || !doc) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f0f0]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-loffice-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <LoCommandProvider doc={doc}>
      <LofficeDesktopShell
        fileName={doc.name}
        ext={doc.ext}
        previewPanel={<WorkspacePanel doc={doc} />}
      />
    </LoCommandProvider>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f0f0f0]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-loffice-teal border-t-transparent" />
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}
