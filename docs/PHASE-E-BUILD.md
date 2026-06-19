# Phase E: LibreOffice Core 커스텀 빌드

## 개요

장기 목표는 Collabora 의존 없이 **100% Loffice 브랜드 LibreOfficeKit 엔진**을 호스팅하는 것입니다.

## 소스

```bash
git clone --depth 1 https://github.com/shinkang888-code/libreoffice.git
cd libreoffice
```

## WSL2 Ubuntu 빌드 (권장)

```bash
sudo apt install git build-essential zip ccache junit4 libkfontinst-dev libxslt1-dev \
  libxml2-dev libxrandr-dev libx11-dev libgl1-mesa-dev libglu1-mesa-dev

./autogen.sh --with-distro=LibreOfficeOnline
make
```

## 산출물

- `instdir/program/libmergedlo.so` — headless 통합 엔진
- `instdir/program/libsofficeapp.so` — LibreOfficeKit API

## Loffice Engine 통합

1. `loffice-engine` (loolwsd 포크) 빌드
2. WOPI + WebSocket 타일 렌더링
3. Render Docker 서비스로 배포

## Docker (Phase E)

```dockerfile
FROM collabora/code:24.04.13.3.1
# → 점진적으로 커스텀 LOK 빌드로 교체
```

## 예상 일정

| 단계 | 작업 | 기간 |
|------|------|------|
| E.1 | LOK 빌드 환경 (WSL2) | 1-2일 |
| E.2 | 타일 렌더링 PoC | 1주 |
| E.3 | loolwsd 포크 | 2-4주 |
| E.4 | Collabora 제거 | 1주 |

## 라이선스

MPL-2.0 — 수정 시 소스 공개 의무
