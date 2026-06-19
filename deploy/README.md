# Loffice 배포 가이드

## Vercel (프론트엔드) — 배포 완료

- **URL:** https://loffice-sigma.vercel.app
- **GitHub:** https://github.com/shinkang888-code/Loffice

환경 변수 (Vercel Dashboard → Settings → Environment Variables):

| 변수 | 값 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mvtkfefmqmsvkhltzyqi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lawbox anon key |
| `NEXT_PUBLIC_ENGINE_URL` | Render 엔진 URL (아래) |

## Render (LibreOffice 엔진)

1. [Render Blueprint 새로 만들기](https://dashboard.render.com/blueprint/new)
2. 저장소: `shinkang888-code/Loffice`, 브랜치 `main`
3. Blueprint 파일 경로: **`deploy/render.yaml`**
4. 환경 변수 추가:
   - `SUPABASE_SERVICE_ROLE_KEY` — lawbox service role key
   - `WOPI_HOST` — `https://<your-engine>.onrender.com`
5. 배포 후 Vercel의 `NEXT_PUBLIC_ENGINE_URL`을 Render URL로 업데이트

> Cursor Render MCP를 사용하려면 Cursor에서 Render 워크스페이스를 먼저 선택해야 합니다.

## Supabase (lawbox)

- 프로젝트: `mvtkfefmqmsvkhltzyqi`
- 테이블: `public.loffice_documents`

## Collabora (선택 — 실시간 편집)

```bash
docker compose up -d
```

Collabora 없을 때는 PDF/텍스트/이미지 미리보기 + 툴바 폴백으로 동작합니다.
