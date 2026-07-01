# Loffice Engine — 고객 납품 (Writer/Calc 전체 메뉴)

## 빠른 시작

```powershell
docker compose up -d
npm run dev:engine
npm run dev:web
```

## /workspace

- `WorkspacePanel`: Collabora 연결 시 **EditorCanvas** (전체 LO UI)
- 미연결 시 PDF **UniversalPreview** 폴백
- `libreoffice-ui.json`: swriter/scalc **전체 menubar** (parse-lo-ui.mjs)

## UI 파싱 갱신

```powershell
npm run parse:ui
npm run sync:icons
```

LibreOffice 설치 경로: `LO_SHARE=C:\Program Files\LibreOffice\share`

## Desktop EXE 연동

lofice Desktop → `NEXT_PUBLIC_LOFFICE_ENGINE_URL=http://127.0.0.1:9982`

CORS: Electron `127.0.0.1:*` 허용 (`engine/server.mjs`)

## Phase E (장기)

Collabora 제거 → 자체 LOK — `docs/PHASE-E-BUILD.md`
