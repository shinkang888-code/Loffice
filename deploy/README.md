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

## Collabora (실시간 편집)

> Render Docker는 Linux capabilities 제한으로 Collabora CODE 실행 불가.  
> 자세한 내용: **`deploy/COLLABORA.md`**

로컬:
```bash
docker compose up -d
```

프로덕션 기본: Collabora 없이 미리보기/폴백 (`/health` → `"collabora": false`)

## Cursor Render MCP

1. **CLI 로그인** (완료): `render login` → My Workspace
2. **MCP 워크스페이스** (완료): `tea-d6g55rsr85hc73b6b5vg`
3. MCP 도구가 `unauthorized`이면: Cursor **Settings → MCP → Render** 에서 API Key 연결  
   (Dashboard → Account Settings → API Keys → `rnd_...` 토큰)

사용 가능 도구: `list_services`, `update_environment_variables`, `create_web_service` 등
