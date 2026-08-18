# 2026-08-18 사장님 앱 리뷰 관리 탭 및 답글 연동 가이드

## 1. 개요
- **목적**: 소비자가 등록한 매장 케이크 리뷰(별점, 텍스트 후기, 포토)를 사장님 앱에서 실시간으로 확인(`GET /api/stores/{storeId}/reviews`)하고, 사장님 공식 답글을 등록/수정/삭제(`POST/DELETE /api/reviews/{reviewId}/reply`)하여 고객과 소통할 수 있는 전용 리뷰 관리 화면을 구축합니다.

---

## 2. 주요 구현 사항

### 2.1. `src/api/reviewApi.js` & `src/store/useReviewStore.js`
- `fetchStoreReviews(storeId)`: 매장별 리뷰 목록 조회 및 fallback 지원
- `replyToReview(reviewId, replyContent)`: `POST /api/reviews/{reviewId}/reply`로 사장님 답글 작성/수정
- `deleteReviewReply(reviewId)`: `DELETE /api/reviews/{reviewId}/reply`로 사장님 답글 삭제
- `useReviewStore`: 상태 관리, 실시간 리뷰/답글 업데이트, 평균 별점/미답변 건수 집계 로직 제공

### 2.2. `src/pages/reviews/ReviewManager.jsx` (신규 화면)
- **만족도 요약 카드**: 평균 별점(예: 4.9/5.0), 별점 시각화, 총 리뷰 수 및 미답변 건수 뱃지 제공
- **필터 탭**: `전체`, `미답변`, `답변완료`, `포토 리뷰` 필터링 지원
- **리뷰 카드 & 사진 뷰어**: 고객 닉네임, 별점, 작성일, 포토 리뷰 이미지, 후기 내용 표시
- **사장님 답글 인터랙션**:
  - 작성된 답글 블록 (수정/삭제 아이콘 제공)
  - 인라인 텍스트 영역을 통한 즉각적인 답글 등록 및 수정
  - 답글 미작성 리뷰에 대한 `+ 답글 달기` 버튼 제공

### 2.3. 바로가기 및 라우팅 연동
- `src/App.jsx`: `/reviews` 경로에 `ReviewManager` 라우트 등록
- `src/pages/home/Home.jsx`: 홈 대시보드에 `매출 관리` & `리뷰 관리` 그리드 카드 배치
- `src/pages/store/StoreManage.jsx`: 매장 관리 탭에 `고객 리뷰 및 답글 관리` 카드 추가

---

## 3. 검증 결과
- `npm run build` 번들 빌드 통과 (0 errors).
- 리뷰 목록 조회 ➔ 답글 등록/수정/삭제 ➔ 통계 집계 실시간 반영 E2E 검증 완료.
