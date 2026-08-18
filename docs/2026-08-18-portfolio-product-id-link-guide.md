# 2026-08-18 포트폴리오 등록 시 카테고리(메뉴) 매핑 버그 수정 가이드

## 1. 개요
- **문제점**: 포트폴리오 등록/수정 시 드롭다운에서 `야구 케이크` 등 특정 메뉴(카테고리)를 선택해도, `portfolioApi.js` 내부에서 전달받은 `productId`를 무시하고 무조건 첫 번째 카테고리(`기본케이크`, `productId: 1`)로 하드코딩 저장하여 메뉴 필터링 시 사진이 나타나지 않는 현상 발생.
- **해결 방안**: 
  1. `portfolioApi.js`의 `createPortfolio` 및 `updatePortfolio`가 사용자가 선택한 `productId`를 정상적으로 페이로드에 담아 백엔드로 전송하도록 수정.
  2. `fetchStorePortfolios`에서 각 포트폴리오에 소속된 카테고리의 `productId`를 정확히 매핑.
  3. `MenuManager.jsx`에서 `Number(p.productId) === Number(selectedProductId)` 형변환 비교를 통해 타입 불일치 방지.

## 2. 검증 결과
- `npm run build` 프로덕션 번들 빌드 통과.
- 포트폴리오 등록 시 선택한 메뉴와 필터 탭 실시간 매칭 정상 작동.
