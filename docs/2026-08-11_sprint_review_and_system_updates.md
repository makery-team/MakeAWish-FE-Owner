# 2026-08-11 System Release & Architecture Updates (Owner App)

이 문서는 최신 스프린트 주기에 따라 성공적으로 배포 및 머지된 사장님 앱(MakeAWish-FE-Owner)의 주요 아키텍처 변경 사항 및 신규 피처를 정리한 통합 시스템 릴리즈 명세서입니다.

## 1. 홈 대시보드(Home Dashboard) 비즈니스 연동 고도화

- **아키텍처**: `src/pages/home/Home.jsx`, `src/store/useOrderStore.js`
- **데이터 파이프라인 개선**: 데모용 목업(Mockup) 및 시장 가격 분석 UI를 완벽히 걷어내고, `useOrderStore`를 통해 백엔드의 실제 주문 통계(오늘의 주문, 브리핑) 데이터를 매핑하는 엔터프라이즈급 렌더링 파이프라인으로 교체했습니다.
- **프로필 동기화 최적화**: 대시보드 진입 시 `fetchProfile` 라이프사이클(useEffect)을 즉각적으로 트리거하여, 분산 시스템 간의 매장 정보 데이터 정합성을 보장하도록 개선했습니다.
- **보안 및 계정 관리**: 설정 영역에 보안 정책을 준수하는 실제 회원 탈퇴 API 연동을 완료했습니다.

## 2. 스토어 온보딩(Onboarding) UI/UX 전면 개편

- **아키텍처**: `src/pages/auth/OnboardingOcr.jsx`, `src/pages/store/StoreManage.jsx`, `src/store/useAuthStore.js`
- **컴포넌트 리팩토링 (Pill 태그 UI)**: 
  - 기존의 단방향 텍스트 인풋을 스페이스/엔터 이벤트 기반의 양방향 태그(Pill) 생성 시스템으로 고도화하여 사용자 경험을 극대화했습니다.
- **Edge Case 버그 해결**: 
  - 폼 데이터 처리 중 엔터 키로 인한 원치 않는 폼 제출(Submit) 이벤트를 이벤트 버블링 단계에서 차단(e.preventDefault)하여 안정성을 확보했습니다.
  - 온보딩 트랜잭션 중 발생하던 페이로드(키워드 배열) 누락 이슈를 스토어 상태 관리 로직(`useAuthStore`) 수정을 통해 완벽히 해결했습니다.

## 3. AI 파이프라인(AI Intro Generation) 안정화

- **아키텍처**: `src/api/storeApi.js`, `src/store/useShopStore.js`
- **마이크로서비스 엔드포인트 동기화**: 
  - AI 소개글 자동생성 및 프로필 개선 API의 프론트엔드 라우팅 경로를 백엔드의 최신 마이크로서비스 엔드포인트 스펙에 맞추어 완벽히 정규화했습니다.
- **오토 세이브(Auto-Save) 트랜잭션 구축**: 
  - AI 파이프라인을 통해 생성된 소개글 텍스트가 클라이언트 사이드에 머물지 않고 즉시 서버 DB에 트랜잭션으로 반영되도록 `useShopStore`의 비동기 로직을 리팩토링했습니다. (이 과정의 런타임 함수 참조 오류 핫픽스 포함)
