"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { getDocument, type LofficeDocument } from "@/lib/storage";
import { getEditorUrl } from "@/lib/engine";

interface CollaboraEditorProps {
  doc: LofficeDocument;
}

export function CollaboraEditor({ doc }: CollaboraEditorProps) {
  const [editorUrl, setEditorUrl] = useState<string | null>(doc.editorUrl ?? null);
  const [loading, setLoading] = useState(!doc.editorUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editorUrl) return;
    getEditorUrl(doc.id).then((url) => {
      if (url) setEditorUrl(url);
      else setError("Collabora 편집 엔진에 연결할 수 없습니다.");
      setLoading(false);
    });
  }, [doc.id, doc.editorUrl, editorUrl]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-loffice-teal" />
        <p className="text-sm text-gray-500">LibreOffice 편집기 로딩 중...</p>
      </div>
    );
  }

  if (error || !editorUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-loffice-gold" />
        <h2 className="text-lg font-semibold">편집 엔진이 실행되지 않았습니다</h2>
        <p className="max-w-md text-sm text-gray-500">
          LibreOffice 편집기(Collabora Online)를 시작해야 합니다.
        </p>
        <code className="rounded bg-gray-100 px-4 py-2 text-sm">docker compose up -d</code>
        <div className="flex gap-3">
          <Link href={`/viewer?id=${doc.id}`} className="btn-secondary">뷰어로 보기</Link>
          <button onClick={() => window.location.reload()} className="btn-primary">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={editorUrl}
      className="h-full w-full border-0"
      title={`Loffice Editor — ${doc.name}`}
      allow="clipboard-read; clipboard-write"
    />
  );
}
