"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CollaboraEditor } from "@/components/editor/CollaboraEditor";
import { getDocument, type LofficeDocument } from "@/lib/storage";

function EditorContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [doc, setDoc] = useState<LofficeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getDocument(id).then((d) => { setDoc(d); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-loffice-teal border-t-transparent" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-gray-500">문서를 찾을 수 없습니다.</p>
        <Link href="/" className="btn-primary">홈으로</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="flex items-center gap-3 border-b bg-white px-4 py-2">
        <Link href="/files" className="rounded p-1.5 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <FileText className="h-5 w-5 text-loffice-teal" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{doc.name}</p>
          <p className="text-xs text-gray-500">
            LibreOffice 편집기 · {doc.ext.toUpperCase().replace(".", "")}
          </p>
        </div>
        <Link href={`/viewer?id=${doc.id}`} className="btn-secondary text-xs">
          <Eye className="h-4 w-4" />
          미리보기
        </Link>
      </div>
      <div className="flex-1 overflow-hidden bg-[#f5f5f5]">
        <CollaboraEditor doc={doc} />
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-loffice-teal border-t-transparent" />
        </div>
      }>
        <EditorContent />
      </Suspense>
    </div>
  );
}
