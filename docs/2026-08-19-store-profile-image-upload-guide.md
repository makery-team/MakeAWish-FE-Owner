# 2026-08-19 사장님 앱 매장 프로필 사진 변경 및 S3 업로드 연동

## 1. 개요 및 변경 사항
- **목적**: 사장님 앱 [매장 관리] 화면에서 매장 프로필 사진을 카메라 버튼으로 선택하여 S3에 즉시 업로드하고, 백엔드 DB(`PATCH /api/stores/profile`)에 실시간 저장/반영되도록 UI 및 상태 관리 연동
- **주요 수정 파일**:
  1. `src/api/storeApi.js`: `uploadStoreImage(file)` 함수 추가 및 `updateStoreProfile`에 `imageUrl` 전달
  2. `src/store/useShopStore.js`: `fetchProfile` 시 `imageUrl` 동기화 및 `uploadProfileImage(file)` 액션 추가
  3. `src/pages/store/StoreManage.jsx`: 매장 프로필 사진 우하단에 `[📷]` 카메라 버튼 추가 및 파일 선택 ➔ S3 업로드 ➔ 즉시 반영 연동

---

## 2. 검증 결과
- `npm run build` 빌드 성공 (0 errors).
- 카메라 버튼 클릭 ➔ 이미지 파일 선택 ➔ S3 업로드 ➔ 매장 프로필 사진 자동 갱신 및 DB 저장 정상 동작 확인.
