# 2026-08-22 사장님 웹앱 Mock 제거 및 순수 실서버 API 연동 가이드

## 1. 개요
- 백엔드 API(주문, 결제, 포트폴리오, 리뷰, 채팅, 온보딩) 전 계층 연동 완료에 따라, 기존에 남아있던 `src/mocks/seed.js` 더미 데이터와 Store 및 `orderApi`의 `isMockOrderId` 우회 코드를 전면 제거하고 100% 실서버 API를 바라보도록 리팩토링 완료.

---

## 2. 주요 변경 사항 (`MakeAWish-FE-Owner`)

### 1) Mock 파일 삭제
- `src/mocks/seed.js` 완전 삭제

### 2) API & Store 리팩토링
- `src/api/orderApi.js`: `isMockOrderId` 우회 분기문 전면 삭제 및 순수 백엔드 REST 통신 일원화
- `src/store/useOrderStore.js`: mock 의존성 제거, `orders: []`, `todayOrders: []` 초기화
- `src/store/useChatStore.js`: `chats: {}` 초기화
- `src/store/usePortfolioStore.js`: `portfolios: []` 초기화
- `src/store/useShopStore.js`: `reviews: []`, `DEFAULT_STORE_PROFILE` 정의
- `src/store/useAuthStore.js`: 디버깅용 alert 및 mock 라이선스 제거
- `src/pages/auth/OnboardingOcr.jsx`: 온보딩 기본 영업시간 상수 내재화
