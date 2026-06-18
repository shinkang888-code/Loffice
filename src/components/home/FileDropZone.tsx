"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { convertAndSave, getDocumentRoute } from "@/lib/engine";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  className?: string;
}

export function FileDropZone({ className }: FileDropZoneProps) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await convertAndSave(file);
      router.push(getDocumentRoute(doc));
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("relative", className)}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "card flex cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed p-12 transition",
          dragging ? "border-loffice-teal bg-loffice-teal/5" : "border-loffice-silver/50 hover:border-loffice-teal/50",
          loading && "pointer-events-none opacity-60"
        )}
      >
        <input type="file" className="hidden" onChange={onFileInput} disabled={loading}
          accept="*/*" />

        {loading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-loffice-teal" />
            <p className="text-lg font-semibold text-loffice-teal">LibreOffice 변환 중...</p>
            <p className="text-sm text-gray-500">문서를 PDF로 렌더링하고 있습니다</p>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-loffice-teal/10">
              <Upload className="h-8 w-8 text-loffice-teal" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">문서를 여기에 드래그하거나 클릭</p>
              <p className="mt-1 text-sm text-gray-500">
                모든 파일 형식 지원 — LibreOffice 엔진 미리보기 + 편집
              </p>
            </div>
            <span className="btn-primary">
              <FileUp className="h-4 w-4" />
              파일 선택
            </span>
          </>
        )}
      </label>

      {error && (
        <p className="mt-3 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
