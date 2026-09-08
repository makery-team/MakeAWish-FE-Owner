# 2026-08-22 Vercel HTTPS Mixed Content 방지 및 API 프록시 라우팅 가이드

## 1. 문제 원인
- `https://make-a-wish-fe-owner.vercel.app`(HTTPS)에서 `http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com`(HTTP)으로 직접 API를 호출할 때 웹 브라우저(Chrome/Edge/Safari)의 보안 정책인 **Mixed Content (안전하지 않은 리소스 차단)**에 의해 모든 API 요청이 차단되었습니다.

---

## 2. 해결 방안 (`MakeAWish-FE-Owner`)

### 1) Vercel Serverless Edge API 프록시 (`vercel.json`)
- `/api/:path*` 요청을 Vercel 서버 내부에서 Elastic Beanstalk 백엔드로 안전하게 프록시 포워딩
- 브라우저는 Vercel의 동일 HTTPS 도메인(`https://make-a-wish-fe-owner.vercel.app/api/...`)으로 요청하므로 Mixed Content 차단 및 CORS 에러 원천 해결

### 2) 클라이언트 API 기본 주소 처리 (`src/api/client.js`)
- HTTPS 배포 환경에서는 상대 경로(`/api`)를 사용하여 Vercel Rewrite 프록시를 경유하도록 설정
