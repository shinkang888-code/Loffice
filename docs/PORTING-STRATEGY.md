# Loffice LibreOffice 전체 이식 전략

## 핵심 결론

**`C:\Program Files\LibreOffice` 바이너리를 그대로 복사하는 것은 불가능하고 불필요합니다.**

| 방식 | 가능 여부 | 이유 |
|------|----------|------|
| Program Files 복사 | ❌ | C++/DLL 바이너리, 웹에서 실행 불가 |
| 바이너리 → GitHub | ❌ | MPL-2.0, 용량, 수정 불가 |
| **소스 + LibreOfficeKit** | ✅ | 공식 오픈소스 이식 경로 |
| **Collabora Online (CODE)** | ✅ | LOK 기반 실제 편집기 (즉시 사용) |
| UI XML → React 이식 | ✅ | toolbar/menubar/notebookbar 파싱 |

## LibreOffice 설치본 UI 자산 (학습 대상)

```
share/config/
├── images_colibre_svg.zip    → 4,525개 SVG 아이콘 (MPL-2.0)
├── soffice.cfg/modules/
│   ├── swriter/              → Writer UI 정의
│   │   ├── menubar/menubar.xml
│   │   ├── toolbar/toolbar.xml
│   │   └── ui/notebookbar*.ui
│   ├── scalc/                → Calc
│   └── simpress/             → Impress
└── registry/writer.xcd       → .uno: 명령 레이블
```

- **`.ui` 파일**: GTK/Glade 다이얼로그 (1,254개) → React 컴포넌트로 변환
- **`.xml` 툴바/메뉴**: `.uno:Save`, `.uno:Bold` 등 명령 ID → 리본 버튼
- **SVG 아이콘**: Colibre 테마 → `public/icons/lo/`

## 3단계 이식 로드맵

### Phase A — 실제 편집기 동작 (현재)
- Collabora Online Docker (LibreOfficeKit 엔진)
- WOPI 호스트 (문서 저장/로드)
- `/editor` 페이지 — **진짜 Writer/Calc/Impress 편집**

### Phase B — UI 이식
- `scripts/parse-lo-ui.mjs` → menubar/toolbar JSON
- Loffice 리본 (LibreOffice notebookbar 구조 + Colibre 아이콘)
- Loffice 테마 CSS (Colibre 색상 토큰 추출)

### Phase C — 엔진 자체 호스팅
- `shinkang888-code/libreoffice` 커스텀 빌드
- loolwsd 포크 → `loffice-engine`
- Collabora 의존 제거, 100% Loffice 브랜드

## 아키텍처 (Phase A)

```
Browser (Loffice Next.js :3001)
  ├── /editor?id=  → Collabora iframe (실제 LO 편집)
  └── /viewer?id=  → PDF 미리보기
         │
         ▼ WOPI
Engine (:9982) ──► .loffice-cache/documents/
         │
Docker Collabora CODE (:9980) ──► LibreOffice Core (LOK)
```

## 라이선스

- LibreOffice / Collabora: **MPL-2.0** — 수정 시 소스 공개
- Colibre 아이콘: MPL-2.0 — 저작권 표시 필요
