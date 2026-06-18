<p align="center">
  <img src="./assets/logo.png" width="128" alt="Loffice Logo"/>
</p>

<h1 align="center">Loffice</h1>

<p align="center">
  LibreOffice 엔진 기반 웹 브라우저용 종합 문서 뷰어 & 편집기
</p>

## 비전

LibreOffice 오픈소스 엔진을 현대화하여, 브라우저에서 동작하는 **광고 없는 무료 종합 오피스**를 만듭니다.

- **뷰어**: ODT, DOCX, XLSX, PPTX, PDF, HWP/HWPX 등
- **편집기**: Writer / Calc / Impress 수준의 웹 편집
- **엔진**: LibreOffice Core (LibreOfficeKit) + 서버 사이드 렌더링
- **프론트엔드**: Next.js 웹 앱 + 선택적 Electron/Capacitor

## 관련 리포지토리

| 리포 | 역할 |
|------|------|
| [shinkang888-code/Loffice](https://github.com/shinkang888-code/Loffice) | 본 프로젝트 (웹 앱 + 아키텍처) |
| [shinkang888-code/libreoffice](https://github.com/shinkang888-code/libreoffice) | LibreOffice Core 소스 (엔진) |
| [shinkang888-code/lofice](https://github.com/shinkang888-code/lofice) | 기존 WASM 기반 lofice (레거시 참조) |
| [shinkang888-code/loficepro](https://github.com/shinkang888-code/loficepro) | lofice Pro 하이브리드 워크스페이스 |

## 로컬 개발 구조

```
C:\cursor\
├── Loffice/              ← 본 프로젝트
│   ├── assets/logo.png   ← Loffice 로고
│   ├── docs/             ← 분석·아키텍처 문서
│   └── scripts/          ← 분석·빌드 스크립트
└── Libreoffice/
    ├── libreoffice/      ← Catppuccin 테마 (별도)
    └── core/             ← LibreOffice Core 소스 (shallow clone)
```

## LibreOffice 설치본 분석

로컬 설치 경로 `C:\Program Files\LibreOffice` (v26.2) 분석 결과:

- **총 파일**: 13,910개 / **용량**: ~0.69 GB
- 상세: [docs/LIBREOFFICE-INSTALL-ANALYSIS.md](./docs/LIBREOFFICE-INSTALL-ANALYSIS.md)

> ⚠️ 설치 바이너리를 GitHub에 업로드하지 않습니다. 엔진 개발은 **소스 코드** 기반으로 진행합니다.

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Next.js)                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Writer   │  │ Calc     │  │ Impress  │  Canvas UI   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       └──────────────┼──────────────┘                   │
│                      │ WebSocket / REST                  │
├──────────────────────┼──────────────────────────────────┤
│  Loffice Engine Server (Docker)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LibreOfficeKit (LOK) — 타일 렌더링 + 편집 API    │  │
│  │  Collabora Online / CODE 패턴 참조                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LibreOffice Core (커스텀 빌드)                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

상세: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 **http://localhost:3001** 접속

- **웹 앱**: http://localhost:3001
- **엔진 API**: http://localhost:9980

### 사용 방법

1. 홈 화면에서 문서를 드래그하거나 클릭하여 업로드
2. LibreOffice 엔진이 PDF로 변환
3. 브라우저에서 PDF 뷰어로 문서 확인 (줌, 페이지 이동, 다운로드)

### 지원 형식

ODT, ODS, ODP, DOC, DOCX, XLS, XLSX, PPT, PPTX, RTF, TXT, CSV, PDF, EPUB, HTML

### 환경 변수

```bash
LIBREOFFICE_PATH=C:\Program Files\LibreOffice\program\soffice.exe
LOFFICE_ENGINE_PORT=9980
NEXT_PUBLIC_ENGINE_URL=/engine
```

## 라이선스

- Loffice 앱 코드: MIT
- LibreOffice Core: MPL-2.0 (엔진 사용 시 준수 필요)
