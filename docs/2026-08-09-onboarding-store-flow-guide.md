# 매장 개설 온보딩 플로우 및 데이터 연동 가이드

## 개요
기존 온보딩 폼(Step 2)에서는 상호명과 전화번호만 입력받아 `PATCH /api/users/me/init`을 호출했으나, 매장 관리 탭에서 추가로 입력해야 했던 번거로움을 줄이기 위해 주소와 기본 운영시간을 온보딩 과정에서 함께 수집하도록 확장했습니다.

## 주요 변경 사항

### 1. 온보딩 폼 확장 및 다중 API 연동
- **위치:** `src/pages/auth/OnboardingOcr.jsx`
- **추가된 필드:** 주소 (Text Input), 운영시간 (7일 상세 에디터 UI)
- **로직:**
  1. `completeOnboarding` 실행 시, 먼저 `userApi.initUserProfile()`을 통해 SellerProfile과 기본 Store를 생성합니다.
  2. 성공적으로 생성된 직후, 입력된 주소와 운영시간이 존재한다면 `storeApi.updateStoreProfile()` API를 연달아 호출하여 매장 프로필을 즉시 갱신합니다.

### 2. 운영시간 (businessHours) JSON 문자열 직렬화 적용
- **문제점:** 백엔드 `Store` 엔티티의 `hours` 필드는 단순 `String` 타입이며, 프론트엔드는 7일 단위의 배열(`[{day, open, close, closed}]`)을 사용합니다. 기존에는 텍스트로 포맷팅하여 저장했으나, 나중에 다시 불러올 때 파싱이 불가능했습니다.
- **해결책:** 
  - 저장 시 (`storeApi.js`): `payload.hours = JSON.stringify(data.businessHours)`
  - 조회 시 (`useShopStore.js`): `JSON.parse(data.hours)`
- 백엔드 스펙 변경 없이 프론트엔드에서 유연하게 다차원 데이터를 저장하고 렌더링할 수 있도록 구조를 개선했습니다.

### 3. 더미 데이터(Mock) 렌더링 폴백 제거
- **이전:** 백엔드 응답이 `null`이거나 빈 문자열일 경우, 화면 깨짐을 방지하기 위해 `seed.js`의 `INITIAL_STORE_PROFILE` 더미 데이터를 화면에 노출했습니다. (예: 달콤공방, 허예진)
- **개선:** 프론트엔드 목업 폴백을 완전히 제거했습니다. 백엔드에서 비어있는 값이 내려오면 화면에서도 빈칸 혹은 "미설정"으로 표기되어 실제 데이터의 상태를 정확히 반영합니다. 대표자명은 `useAuthStore`의 로그인된 유저 이름과 직접 연동됩니다.

## 팁
- 향후 "주소 찾기" 모달(Daum Postcode)이 도입될 예정이며, 주소 필드는 공식 주소를 반환받도록 확장될 계획입니다.
