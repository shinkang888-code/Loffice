"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Trash2, Upload } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FileDropZone } from "@/components/home/FileDropZone";
import { listDocuments, deleteDocument } from "@/lib/storage";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { LofficeDocument } from "@/lib/storage";

export default function FilesPage() {
  const [docs, setDocs] = useState<LofficeDocument[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const refresh = () => listDocuments().then(setDocs);
  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("이 문서를 삭제하시겠습니까?")) return;
    await deleteDocument(id);
    fetch(`/engine/api/documents/${id}`, { method: "DELETE" }).catch(() => {});
    refresh();
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">내 문서</h1>
          <button onClick={() => setShowUpload(!showUpload)} className="btn-primary">
            <Upload className="h-4 w-4" />
            문서 열기
          </button>
        </div>

        {showUpload && (
          <div className="mb-8">
            <FileDropZone />
          </div>
        )}

        {docs.length === 0 ? (
          <div className="card flex flex-col items-center gap-4 p-12 text-center">
            <FileText className="h-12 w-12 text-loffice-silver" />
            <p className="text-gray-500">아직 문서가 없습니다.</p>
            <button onClick={() => setShowUpload(true)} className="btn-primary">
              첫 문서 열기
            </button>
          </div>
        ) : (
          <div className="card divide-y">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-loffice-teal" />
                <Link href={`/workspace?id=${doc.id}`} className="min-w-0 flex-1 hover:text-loffice-teal">
                  <p className="truncate font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(doc.createdAt)} · {formatFileSize(doc.size)}
                  </p>
                </Link>
                <span className="hidden rounded bg-loffice-teal/10 px-2 py-0.5 text-xs font-medium text-loffice-teal uppercase sm:inline">
                  {doc.ext.replace(".", "")}
                </span>
                <button onClick={() => handleDelete(doc.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
