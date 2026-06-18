# Loffice 아키텍처

## 1. 프로젝트 정의

**Loffice** = LibreOffice 엔진 + 현대적 웹 UI

기존 [lofice](https://github.com/shinkang888-code/lofice)가 WASM/JS 라이브러리 조합으로 문서를 처리했다면,  
Loffice는 **LibreOffice Core를 headless 서버로 구동**하여 네이티브 수준의 렌더링·편집 품질을 제공합니다.

---

## 2. 시스템 구성

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Next.js 15 App (TypeScript + Tailwind + shadcn/ui)     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │   │
│  │  │ Writer  │ │  Calc   │ │ Impress │ │ File Manager│  │   │
│  │  │ Canvas  │ │ Canvas  │ │ Canvas  │ │  (IndexedDB)│  │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └─────────────┘  │   │
│  │       └───────────┼───────────┘                          │   │
│  │                   │ loffice-client SDK                   │   │
│  └───────────────────┼─────────────────────────────────────┘   │
│                      │ WebSocket + REST                          │
├──────────────────────┼──────────────────────────────────────────┤
│                 API Gateway (Next.js API Routes / tRPC)          │
├──────────────────────┼──────────────────────────────────────────┤
│                   Engine Layer (Docker)                          │
│  ┌───────────────────┴───────────────────────────────────────┐  │
│  │  loffice-engine (C++ / Collabora CODE 패턴)               │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  loolwsd-equivalent: WebSocket 문서 세션 관리        │  │  │
│  │  │  - 문서 로드/저장/편집 이벤트                        │  │  │
│  │  │  - 타일 캐시 (PNG/TIFF)                             │  │  │
│  │  │  - 다중 사용자 협업 (Phase 4)                       │  │  │
│  │  └──────────────────────┬──────────────────────────────┘  │  │
│  │                         │ LibreOfficeKit C API              │  │
│  │  ┌──────────────────────┴──────────────────────────────┐  │  │
│  │  │  LibreOffice Core (커스텀 빌드)                      │  │  │
│  │  │  - mergedlo: Writer+Calc+Impress 통합               │  │  │
│  │  │  - Filter: DOCX/XLSX/PPTX/ODT/PDF/HWP            │  │  │
│  │  │  - Skia 렌더러                                      │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  loffice-convert (보조 서비스)                            │  │
│  │  - unoserver / soffice CLI 기반 일괄 변환               │  │
│  │  - PDF보내기, 썸네일 생성                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 컴포넌트 상세

### 3.1 loffice-client (TypeScript SDK)

```typescript
// packages/loffice-client/src/LofficeDocument.ts
class LofficeDocument {
  connect(wsUrl: string, docId: string): Promise<void>;
  renderTile(x: number, y: number, zoom: number): Promise<ImageBitmap>;
  postKeyEvent(type: KeyEventType, char: number, key: number): void;
  save(format?: SaveFormat): Promise<Blob>;
  onTileInvalidated(cb: (x, y, w, h) => void): void;
}
```

### 3.2 loffice-engine (C++ WebSocket 서버)

Collabora Online의 `loolwsd` 아키텍처를 참조:

| 컴포넌트 | 역할 |
|----------|------|
| `DocumentBroker` | 문서 세션 생명주기 |
| `TileCache` | 렌더링 타일 LRU 캐시 |
| `ClientSession` | WebSocket per-client |
| `LOKitWrapper` | LOK C API 래퍼 |

### 3.3 LibreOffice Core 빌드

```bash
# WSL2 Ubuntu 권장
git clone --depth 1 https://github.com/shinkang888-code/libreoffice.git
cd libreoffice
./autogen.sh --with-distro=LibreOfficeOnline
make
```

빌드 산출물:
- `instdir/program/libmergedlo.so` — headless 엔진
- `instdir/program/libsofficeapp.so` — LOK 진입점

---

## 4. 문서 처리 흐름

### 뷰어 (읽기)

```
1. 사용자가 파일 업로드 → IndexedDB / Supabase Storage
2. POST /api/documents → Engine에 문서 전달
3. Engine: lok_document_load() → 페이지 수·크기 반환
4. Client: 뷰포트 타일 요청 (WebSocket)
5. Engine: lok_document_paint_tile() → PNG 반환
6. Client: Canvas에 타일 합성 → 스크롤·줌
```

### 편집기 (쓰기)

```
1. 키보드/마우스 이벤트 → postKeyEvent / postMouseEvent
2. Engine: LOK에 이벤트 전달 → 문서 수정
3. onTileInvalidated 콜백 → 변경 영역 타일 재렌더
4. 저장: lok_document_save_as() → Blob → 클라이언트 다운로드
```

---

## 5. 기존 lofice와의 관계

| 기능 | lofice (기존) | Loffice (신규) |
|------|--------------|----------------|
| PDF 뷰어 | pdfjs / UDoc WASM | LOK 네이티브 렌더 |
| DOCX 뷰어 | microscope-js | LOK (완전 호환) |
| DOCX 편집 | eigenpal editor | LOK Writer 모드 |
| XLSX | microscope-js | LOK Calc 모드 |
| PPTX | ppt-master / PptxGenJS | LOK Impress 모드 |
| HWP/HWPX | @rhwp/core WASM | LOK 필터 + rhwp 폴백 |
| 오프라인 | IndexedDB | IndexedDB + 로컬 엔진 |
| 서버 필요 | 없음 (static) | Docker 엔진 서버 |

**마이그레이션 전략**: lofice의 UI 컴포넌트(리본, 파일 관리, 설정)를 재사용하고, 뷰어/편집기 레이어만 LOK으로 교체.

---

## 6. 배포 아키텍처

```
Vercel (Next.js 프론트)
    │
    ├── Supabase (파일 스토리지 + 인증)
    │
    └── Render / Fly.io (loffice-engine Docker)
            └── LibreOffice Core (headless)
```

### Docker Compose (개발)

```yaml
services:
  loffice-engine:
    build: ./engine
    ports: ["9980:9980"]
    volumes: ["./documents:/documents"]
    environment:
      - LOK_PATH=/opt/libreoffice/program
```

---

## 7. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | Next.js 15, TypeScript, Tailwind, shadcn/ui |
| 상태 관리 | TanStack Query, Zustand |
| 엔진 서버 | C++17, WebSocket++, LibreOfficeKit |
| 변환 서비스 | Python unoserver |
| 스토리지 | Supabase Storage / IndexedDB |
| 배포 | Vercel + Render Docker |
| 데스크톱 | Electron (Windows) |
| 모바일 | Capacitor (Android) |

---

## 8. 라이선스 고려사항

- LibreOffice Core: **MPL-2.0** — 수정 시 소스 공개 의무
- Loffice 앱 코드: MIT
- LOK 기반 서버 배포 시 LibreOffice 저작권 표시 필수
- 상업적 사용 가능 (MPL-2.0)
