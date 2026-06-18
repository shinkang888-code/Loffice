# LibreOffice 설치본 분석 (Windows)

**분석 대상**: `C:\Program Files\LibreOffice`  
**버전**: LibreOffice 26.2 (`program/bootstrap.ini` → `ProductKey=LibreOffice 26.2`)  
**분석 일자**: 2026-06-18

---

## 1. 전체 개요

| 항목 | 값 |
|------|-----|
| 총 파일 수 | 13,910 |
| 총 용량 | ~0.69 GB |
| 최상위 디렉터리 | `program`, `share`, `help`, `presets`, `readmes` |

---

## 2. 디렉터리별 구조

### `program/` — 실행 엔진 (1,743 files)

런타임 바이너리, UNO 컴포넌트, Python 런타임이 위치합니다.

| 확장자 | 개수 | 역할 |
|--------|------|------|
| `.py` | 1,327 | 내장 Python 매크로/스크립트 |
| `.dll` | 146 | 네이티브 모듈 (UNO 컴포넌트) |
| `.mo` | 96 | gettext 번역 |
| `.exe` | 44 | 실행 파일 |
| `.jar` | 36 | Java UNO 브릿지 |

#### 핵심 실행 파일

| 실행 파일 | 역할 |
|-----------|------|
| `soffice.exe` | 메인 런처 (Writer/Calc/Impress 통합) |
| `swriter.exe` | Writer 전용 |
| `scalc.exe` | Calc 전용 |
| `simpress.exe` | Impress 전용 |
| `sdraw.exe` | Draw |
| `smath.exe` | Math |
| `sbase.exe` | Base (DB) |
| `python.exe` | 내장 Python 3.12 |
| `uno.exe` | UNO 런타임 |
| `unopkg.exe` | 확장 패키지 관리 |
| `xpdfimport.exe` | PDF 임포트 |
| `quickstart.exe` | 빠른 시작 트레이 |

#### 핵심 DLL (크기 순)

| DLL | 크기 | 모듈 |
|-----|------|------|
| `mergedlo.dll` | 141 MB | **통합 LibreOffice 코어** (sw+sc+sd+...) |
| `icudt78.dll` | 32 MB | ICU 국제화 데이터 |
| `swlo.dll` | 24 MB | Writer (sw) |
| `sclo.dll` | 23 MB | Calc (sc) |
| `sdlo.dll` | 10 MB | Draw/Impress (sd) |
| `skialo.dll` | 9 MB | Skia 그래픽 렌더러 |
| `pdfiumlo.dll` | 6 MB | PDF 렌더링 |
| `mswordlo.dll` | 4 MB | MS Word 필터 |
| `vclplug_winlo.dll` | 4 MB | Windows VCL UI 플러그인 |
| `soffice.bin` | 2.6 MB | soffice 실제 바이너리 |

> **Loffice 관점**: `mergedlo.dll`이 전체 오피스 엔진의 핵심입니다. 웹 버전은 이를 **LibreOfficeKit(LOK)** API로 headless 서버에서 구동합니다.

---

### `share/` — 리소스 & 설정 (6,806 files)

| 확장자 | 개수 | 역할 |
|--------|------|------|
| `.ui` | 1,254 | GTK/VCL UI 정의 (Glade) |
| `.xml` | 712 | 레지스트리, 필터 설정 |
| `.properties` | 620 | i18n 문자열 |
| `.jar` | 254 | 확장/도구 JAR |
| `.done` | 496 | 설치 완료 마커 |

#### 주요 하위 디렉터리

| 디렉터리 | 역할 |
|----------|------|
| `registry/` | UNO 컴포넌트 레지스트리 (xcd/xcu) |
| `filter/` | 파일 형식 필터 (docx, xlsx, odt...) |
| `config/` | 앱 설정, 툴바, 메뉴 |
| `template/` | 문서 템플릿 |
| `gallery/` | 클립아트 갤러리 |
| `extensions/` | 번들 확장 |
| `basic/` | StarBasic 매크로 |
| `calc/`, `wizards/` | Calc 함수, 마법사 |
| `skia/` | Skia 렌더링 리소스 |
| `palette/` | 색상 팔레트 |
| `themes/` | UI 테마 |

---

### `help/` — 도움말 (5,339 files)

| 확장자 | 개수 |
|--------|------|
| `.svg` | 5,135 (도움말 아이콘/일러스트) |
| `.png` | 175 |
| `.js` | 9 |

---

### `presets/` — 기본 문서 (13 files)

새 문서 생성 시 사용하는 기본 템플릿 (`.odb`, `.xlc`, `.xlb` 등)

---

## 3. 아키텍처 핵심 개념

### UNO (Universal Network Objects)
LibreOffice의 컴포넌트 모델. 모든 모듈이 UNO 인터페이스로 통신합니다.

```
soffice.exe
  └── mergedlo.dll (통합 코어)
        ├── swlo.dll  → Writer (텍스트 처리)
        ├── sclo.dll  → Calc (스프레드시트)
        ├── sdlo.dll  → Draw/Impress (그래픽/프레젠테이션)
        ├── vclplug_winlo.dll → Windows UI
        └── filter/*.xml → 파일 형식 변환
```

### 설정 레이어 (`fundamental.ini`)
```
CONFIGURATION_LAYERS =
  xcsxcu: share/registry          ← 시스템 기본
  winreg: LOCAL_MACHINE           ← Windows 레지스트리
  winreg: CURRENT_USER            ← 사용자 레지스트리
  user: registrymodifications.xcu ← 사용자 커스텀
```

### 사용자 데이터 경로 (Windows)
```
%APPDATA%\Roaming\LibreOffice\4\user\
  ├── config/          ← .soc 색상표, 설정
  ├── registrymodifications.xcu
  └── extensions/      ← 사용자 확장
```

---

## 4. Loffice 엔진 전략

설치 바이너리를 직접 쓰는 것이 아니라, **소스에서 LibreOfficeKit을 빌드**합니다.

| 접근 | 설명 | Loffice 적용 |
|------|------|-------------|
| **LibreOfficeKit (LOK)** | headless 타일 렌더링 API | ✅ 1순위 — Collabora Online 패턴 |
| **unoserver** | Python UNO 서버 (변환) | 보조 — PDF/이미지 변환 |
| **WASM 빌드** | Emscripten 컴파일 | ❌ 현재 비현실적 (용량·성능) |
| **바이너리 직접 사용** | soffice.exe CLI | 개발/테스트용만 |

### LOK API 핵심 함수 (C++)
```c
LibreOfficeKit* lok_init(install_path);
lok_document_load(path);
lok_document_paint_tile(x, y, width, height, zoom);
lok_document_post_key_event(type, charcode, keycode);
lok_document_save_as(path, format);
```

### Collabora Online 참고 아키텍처
```
Browser ←WebSocket→ loolwsd (C++) ←LOK API→ LibreOffice Core
```

---

## 5. 지원 파일 형식 (filter/ 기반)

LibreOffice `share/filter/` 에서 확인된 주요 형식:

| 카테고리 | 형식 |
|----------|------|
| Microsoft Office | DOC, DOCX, XLS, XLSX, PPT, PPTX |
| OpenDocument | ODT, ODS, ODP, ODG |
| 한글 | HWP (필터 제한적) |
| PDF | PDF (읽기/쓰기) |
| 기타 | RTF, HTML, CSV, TXT, EPUB |

---

## 6. 빌드 소스 vs 설치 바이너리

| | 설치 바이너리 | 소스 (GitHub) |
|--|-------------|--------------|
| 경로 | `C:\Program Files\LibreOffice` | `shinkang888-code/libreoffice` |
| 용량 | 0.69 GB | ~6.8 GB (전체 히스토리) |
| 용도 | 런타임 참조·테스트 | 엔진 커스터마이징·LOK 빌드 |
| GitHub 업로드 | ❌ 불가 (라이선스·용량) | ✅ 이미 fork 존재 |

---

## 7. 다음 단계

1. `C:\cursor\Libreoffice\core` 에 LibreOffice 소스 shallow clone
2. Windows 또는 WSL2에서 LOK 빌드 환경 구성
3. `instdir/program/libmergedlo.dll` + `libsofficeapp.dll` 확인
4. LOK 타일 렌더링 PoC (C++ 또는 Python `python3-uno`)
5. Loffice Engine Server Docker 이미지 제작
