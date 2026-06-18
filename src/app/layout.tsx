import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loffice — LibreOffice 기반 웹 오피스",
  description: "LibreOffice 엔진 기반 웹 브라우저용 종합 문서 뷰어 및 편집기",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
