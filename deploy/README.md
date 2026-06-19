# Loffice 배포 가이드

## Vercel (프론트엔드)

- **URL:** https://loffice-sigma.vercel.app

| 변수 | 값 |
|------|-----|
| `NEXT_PUBLIC_ENGINE_URL` | `https://loffice-engine.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mvtkfefmqmsvkhltzyqi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lawbox anon key |

## Render (LibreOffice 엔진 + Collabora)

Blueprint: **`deploy/render.yaml`** (2서비스)

| 서비스 | URL | 역할 |
|--------|-----|------|
| `loffice-engine` | https://loffice-engine.onrender.com | PDF 변환, WOPI, Supabase 동기화 |
| `loffice-collabora` | https://loffice-collabora.onrender.com | 실시간 LibreOffice 편집 (없으면 미리보기 폴백) |

### loffice-engine 환경 변수

| 변수 | 설명 |
|------|------|
| `SUPABASE_SERVICE_ROLE_KEY` | lawbox service role — 문서 메타 DB 동기화 |
| `COLLABORA_URL` | `https://loffice-collabora.onrender.com` |
| `WOPI_HOST` | `https://loffice-engine.onrender.com` |

### loffice-collabora 환경 변수

| 변수 | 값 |
|------|-----|
| `domain` | `loffice-collabora\.onrender\.com` |
| `aliasgroup1` | `https://loffice-sigma.vercel.app:443` |
| `aliasgroup2` | `https://loffice-engine.onrender.com:443` |
| `password` | Render 대시보드에서 설정 (sync: false) |

## Cursor Render MCP

1. Cursor → Settings → MCP → Render 플러그인 연결
2. 워크스페이스: **My Workspace** (`tea-d6g55rsr85hc73b6b5vg`) 선택됨
3. 이후 `list_services`, `update_environment_variables` 등 MCP 도구 사용 가능

## Supabase (lawbox)

- 프로젝트: `mvtkfefmqmsvkhltzyqi`
- 테이블: `public.loffice_documents`

## 로컬 Collabora (선택)

```bash
docker compose up -d
```

Collabora 없을 때는 PDF/텍스트/이미지 미리보기 + 툴바 폴백으로 동작합니다.
