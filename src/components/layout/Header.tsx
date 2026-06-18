"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderOpen, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "홈", icon: Home },
  { href: "/files", label: "내 문서", icon: FolderOpen },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-loffice-silver/30 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Loffice" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <span className="text-lg font-bold text-loffice-teal">Loffice</span>
            <span className="ml-2 hidden text-xs text-loffice-silver sm:inline">
              LibreOffice Engine
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname === href
                  ? "bg-loffice-teal/10 text-loffice-teal"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function EngineBadge({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", online ? "bg-green-500" : "bg-red-500")} />
      {online ? "LibreOffice 엔진 연결됨" : "엔진 오프라인"}
    </span>
  );
}
