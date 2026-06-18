"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Table2, Presentation, FileType,
  Shield, Zap, Globe,
} from "lucide-react";
import { Header, EngineBadge } from "@/components/layout/Header";
import { FileDropZone } from "@/components/home/FileDropZone";
import { checkEngineHealth } from "@/lib/engine";
import { listDocuments } from "@/lib/storage";
import { SUPPORTED_FORMATS, formatDate } from "@/lib/utils";
import type { LofficeDocument } from "@/lib/storage";

const FEATURES = [
  { icon: Zap, title: "LibreOffice 엔진", desc: "네이티브 수준의 문서 렌더링 품질" },
  { icon: Globe, title: "웹 브라우저", desc: "설치 없이 브라우저에서 바로 사용" },
  { icon: Shield, title: "광고 없음", desc: "추적·광고·텔레메트리 코드 없음" },
  { icon: FileType, title: "60+ 형식", desc: "Office, OpenDocument, PDF, EPUB 지원" },
];

const APPS = [
  { icon: FileText, name: "Writer", formats: "DOCX, ODT, RTF" },
  { icon: Table2, name: "Calc", formats: "XLSX, ODS, CSV" },
  { icon: Presentation, name: "Impress", formats: "PPTX, ODP" },
];

export default function HomePage() {
  const [engineOk, setEngineOk] = useState(false);
  const [collaboraOk, setCollaboraOk] = useState(false);
  const [recent, setRecent] = useState<LofficeDocument[]>([]);

  useEffect(() => {
    checkEngineHealth().then((h) => {
      setEngineOk(h.ok);
      setCollaboraOk(h.collabora);
    });
    listDocuments().then((docs) => setRecent(docs.slice(0, 5)));
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-loffice-dark via-loffice-teal-dark to-loffice-teal">
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Loffice"
            width={96}
            height={96}
            className="mx-auto mb-6 h-24 w-24 rounded-2xl object-cover shadow-2xl"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Loffice
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            LibreOffice 엔진 기반 웹 브라우저용 종합 문서 뷰어
          </p>
          <div className="mt-6 flex justify-center">
            <EngineBadge online={engineOk} collabora={collaboraOk} />
          </div>
        </div>
      </section>

      {/* Drop Zone */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <FileDropZone />
      </section>

      {/* Apps */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="mb-6 text-center text-xl font-bold text-loffice-dark">
          LibreOffice 모듈
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {APPS.map(({ icon: Icon, name, formats }) => (
            <div key={name} className="card p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-loffice-teal/10">
                <Icon className="h-6 w-6 text-loffice-teal" />
              </div>
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-gray-500">{formats}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <Icon className="mx-auto h-8 w-8 text-loffice-gold" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">최근 문서</h2>
            <Link href="/files" className="text-sm text-loffice-teal hover:underline">
              전체 보기 →
            </Link>
          </div>
          <div className="card divide-y">
            {recent.map((doc) => (
              <Link key={doc.id} href={doc.editable && doc.editorUrl ? `/editor?id=${doc.id}` : `/viewer?id=${doc.id}`}
                className="flex items-center gap-4 px-4 py-3 transition hover:bg-loffice-teal/5">
                <FileText className="h-5 w-5 shrink-0 text-loffice-teal" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                </div>
                <span className="rounded bg-loffice-teal/10 px-2 py-0.5 text-xs font-medium text-loffice-teal uppercase">
                  {doc.ext.replace(".", "")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Formats */}
      <section className="border-t bg-loffice-surface py-8 text-center">
        <p className="text-sm text-gray-500">
          지원 형식: {SUPPORTED_FORMATS.join(" · ")}
        </p>
      </section>
    </div>
  );
}
