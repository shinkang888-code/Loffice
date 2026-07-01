"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { UniversalPreview } from "@/components/preview/UniversalPreview";
import { checkEngineHealth, getEditorUrl } from "@/lib/engine";
import type { LofficeDocument } from "@/lib/storage";

type PanelMode = "loading" | "editor" | "preview";

interface WorkspacePanelProps {
  doc: LofficeDocument;
}

export function WorkspacePanel({ doc }: WorkspacePanelProps) {
  const [mode, setMode] = useState<PanelMode>("loading");
  const [editorDoc, setEditorDoc] = useState<LofficeDocument>(doc);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (doc.editorUrl) {
        if (!cancelled) {
          setEditorDoc(doc);
          setMode("editor");
        }
        return;
      }

      const health = await checkEngineHealth();
      const canEdit = doc.editable !== false && health.collabora;

      if (canEdit) {
        const url = await getEditorUrl(doc.id).catch(() => null);
        if (!cancelled && url) {
          setEditorDoc({ ...doc, editorUrl: url, collabora: true, editable: true });
          setMode("editor");
          return;
        }
      }

      if (!cancelled) setMode("preview");
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  if (mode === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#525659] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-loffice-teal" />
      </div>
    );
  }

  if (mode === "editor") {
    return <EditorCanvas doc={editorDoc} />;
  }

  return <UniversalPreview doc={doc} />;
}
