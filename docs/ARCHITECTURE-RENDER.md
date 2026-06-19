# Loffice 아키텍처 — Render(엔진) + Vercel(화면)

## 왜 Windows MSI를 Render에 설치할 수 없나?

| 환경 | OS | 설치 방식 |
|------|-----|-----------|
| `C:\Program Files\LibreOffice` | Windows | MSI/데스크톱 |
| **Render** | **Linux (Ubuntu)** | **Docker + apt LibreOffice** |
| Vercel | Serverless Node | 설치 불가 (UI만) |

Render는 **데스크톱/Windows가 아닌 Linux 컨테이너**입니다.  
`LibreOffice_26.2.4_Win_x86-64.msi`는 Render에서 실행할 수 없습니다.

## 추천 구조 (현재 구현)

```
[Vercel] loffice-sigma.vercel.app
   │  Next.js UI (Colibre 셸, PDF.js 미리보기)
   │  /engine/* → Render 프록시 (동일 출처)
   ▼
[Render] loffice-engine.onrender.com
   │  Docker: node:22-bookworm + libreoffice-writer/calc/impress/draw
   │  Express API: /api/convert, /api/documents/:id/pdf
   │  soffice --headless → PDF 변환
   ▼
[Supabase lawbox]
   │  loffice_documents (메타)
   │  loffice-files bucket (원본+PDF 영구 저장)
```

## 데이터 흐름

1. 사용자가 Vercel에서 파일 업로드
2. `/engine/api/convert` → Render LibreOffice headless 변환
3. PDF + 원본 → Supabase Storage + Render 로컬 캐시
4. Vercel `/engine/api/documents/:id/pdf` → PDF.js 미리보기
5. Collabora 실시간 편집: 로컬 `docker compose` 또는 VPS (Render 제한)

## 환경 변수

| 위치 | 변수 | 값 |
|------|------|-----|
| Vercel | `NEXT_PUBLIC_ENGINE_URL` | `/engine` |
| Vercel | `ENGINE_BACKEND_URL` | `https://loffice-engine.onrender.com` |
| Render | `WOPI_HOST` | `https://loffice-engine.onrender.com` |
| Render | `SUPABASE_SERVICE_ROLE_KEY` | lawbox service role |
| Render | `FRONTEND_URL` | `https://loffice-sigma.vercel.app` |
