"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PdfViewer } from "@/components/viewer/PdfViewer";
import { getDocument } from "@/lib/storage";
import { ENGINE_URL } from "@/lib/utils";
import type { LofficeDocument } from "@/lib/storage";

function ViewerContent() {
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

  const pdfUrl = `${ENGINE_URL}/api/documents/${doc.id}/pdf`;

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
            LibreOffice 엔진 · {doc.ext.toUpperCase().replace(".", "")}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <PdfViewer url={pdfUrl} fileName={doc.name.replace(/\.[^.]+$/, ".pdf")} />
      </div>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-loffice-teal border-t-transparent" />
        </div>
      }>
        <ViewerContent />
      </Suspense>
    </div>
  );
}
