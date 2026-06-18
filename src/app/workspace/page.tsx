"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LofficeDesktopShell } from "@/components/office/LofficeDesktopShell";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { UniversalPreview } from "@/components/preview/UniversalPreview";
import { getDocument, type LofficeDocument } from "@/lib/storage";

function WorkspaceContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const [doc, setDoc] = useState<LofficeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.replace("/");
      return;
    }
    getDocument(id).then((d) => {
      if (!d) router.replace("/");
      setDoc(d);
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
    <LofficeDesktopShell
      fileName={doc.name}
      ext={doc.ext}
      previewPanel={<UniversalPreview doc={doc} />}
      editorPanel={<EditorCanvas doc={doc} />}
    >
      <EditorCanvas doc={doc} />
    </LofficeDesktopShell>
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
