# Vercel 배포 환경 `/chatting` API 프록시 Rewrite 설정 가이드

## 1. 개요 및 배경
- 사장님 관리자 웹(`MakeAWish-FE-Owner`)이 Vercel(HTTPS) 환경에 배포되었을 때, Mixed Content 차단을 방지하기 위해 상대 경로(`BASE_URL = ''`)를 사용하여 Vercel Reverse Proxy(`vercel.json`)를 통해 백엔드(HTTP)로 요청을 포워딩합니다.
- 기존 `vercel.json`에는 `/api/:path*`에 대한 rewrite 규칙만 등록되어 있어, `/chatting/room`, `/chatting/rooms` 등 채팅 관련 API 호출 시 백엔드로 프록시되지 않고 프론트엔드의 `index.html`로 폴백(fallback) 반환되는 현상이 발생했습니다.

## 2. 변경 내역
- `vercel.json`:
  ```json
  {
    "source": "/chatting/:path*",
    "destination": "http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com/chatting/:path*"
  }
  ```
  규칙을 추가하여 `/chatting/room`, `/chatting/rooms`, `/chatting/rooms/:id/messages` 등 모든 채팅 API가 AWS 백엔드 서버로 정상 라우팅되도록 수정했습니다.

## 3. 검증 결과
- `npm run build` 정상 완료 (0 errors).
- Vercel 재배포 시 사장님 웹에서 채팅방 생성(`POST /chatting/room`) 및 목록 조회(`GET /chatting/rooms`)가 정상 작동합니다.
