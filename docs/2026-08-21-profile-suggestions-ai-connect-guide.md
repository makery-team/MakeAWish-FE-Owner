# 2026-08-21 사장님 앱 프로필 개선 제안 AI 연동 및 에러 수정

## 1. 개요 및 원인 분석
- **문제점**: [매장 관리] 화면에서 **[개선 제안 받기]** 버튼 클릭 시 아무런 반응이 없거나 목록이 표시되지 않던 현상
- **원인**:
  1. `useShopStore.js` 내부에서 미정의된 `client` 객체를 직접 호출하여 `ReferenceError` 발생
  2. Spring 백엔드 응답 구조(`StoreAiProfileSuggestResponse`: `overallFeedback`, `suggestions`) 파싱 로직 누락
- **해결 방안**:
  1. `storeApi.suggestProfileImprovement()`를 통해 정상적으로 API를 호출하도록 수정
  2. AI 서버 응답(`overallFeedback` + `suggestions`)을 안전하게 파싱하여 화면에 표출
  3. AI 서버가 준비 중이거나 응답이 비어있을 때도 매장 프로필(소개글, 키워드 유무 등)을 분석한 맞춤형 개선 피드백을 기본 제공하도록 개선

---

## 2. 검증 결과
- `npm run build` 빌드 성공 (0 errors).
- [개선 제안 받기] 클릭 시 AI 프로필 제안 리스트가 정상 표출됨 확인.
