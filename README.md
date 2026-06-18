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

## 개발 로드맵

### Phase 1 — 분석 & 기반 (현재)
- [x] LibreOffice 설치본 구조 분석
- [x] GitHub 리포 생성 및 로고 확정
- [ ] LibreOffice Core 소스 클론
- [ ] LibreOfficeKit 빌드 환경 구성

### Phase 2 — 엔진 서버
- [ ] LOK 기반 문서 타일 렌더링 PoC
- [ ] DOCX/ODT/ODP 뷰어 API
- [ ] Docker 컨테이너화

### Phase 3 — 웹 프론트엔드
- [ ] Next.js 캔버스 뷰어 컴포넌트
- [ ] 기본 편집 (텍스트 입력, 셀 편집)
- [ ] lofice 기능 마이그레이션

### Phase 4 — 배포
- [ ] Vercel (프론트) + Render/Docker (엔진)
- [ ] Electron Windows 앱
- [ ] Capacitor Android 앱

## 라이선스

- Loffice 앱 코드: MIT
- LibreOffice Core: MPL-2.0 (엔진 사용 시 준수 필요)
