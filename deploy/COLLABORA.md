# Collabora Online — Render 제한으로 로컬/VPS 전용

Collabora CODE는 Linux file capabilities(MKNOD, coolforkit)가 필요합니다.
**Render Docker는 이 capabilities를 지원하지 않아** 클라우드 배포가 불가합니다.

## 프로덕션 실시간 편집 옵션

### 1) 로컬 Docker (권장 개발)

```bash
docker compose up -d
```

엔진 `.env.local` 또는 Render `COLLABORA_URL`을 `http://host.docker.internal:9980` (로컬 엔진)으로 설정.

### 2) 별도 VPS에 Collabora

VPS(Ubuntu)에서 `docker compose -f docker-compose.yml up -d` 실행 후:

Render `loffice-engine` 환경 변수:
```
COLLABORA_URL=https://your-collabora.example.com
```

Collabora `aliasgroup1`:
```
https://loffice-sigma.vercel.app:443
```

### 3) Collabora 없을 때 (현재 프로덕션 기본)

- PDF/이미지/텍스트 **미리보기** + 툴바 폴백
- `/health` → `"collabora": false` (정상)

## Render loffice-collabora 서비스

플랫폼 제한으로 **일시 중지(suspended)** 상태입니다.
재시도 시 VPS 또는 Kubernetes(privileged/cap_add) 환경이 필요합니다.
