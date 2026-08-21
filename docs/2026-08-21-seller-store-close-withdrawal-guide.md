# 2026-08-21 사장님 매장 해지/탈퇴 분리 연동 가이드

## 1. 개요 및 변경 사항
- **목적**: 사장님 앱 [매장 관리] 화면에서 '계정 탈퇴' 시 구글 유저 계정 전체가 삭제되던 문제를 방지하고, 사장님 매장 정보 및 판매자 권한만 해지(`DELETE /api/stores/me`)하도록 변경
- **주요 수정 파일**:
  1. `src/api/storeApi.js`: `closeMyStore()` API 연동 (`DELETE /api/stores/me`)
  2. `src/pages/store/StoreManage.jsx`: 탈퇴 버튼을 매장 해지/탈퇴 로직으로 변경하고 확인 안내 문구(소비자 계정 유지 안내) 개선

---

## 2. 검증 결과
- `npm run build` 빌드 성공 (0 errors).
- 매장 해지 클릭 시 `DELETE /api/stores/me` 호출 후 로그아웃 및 로그인 화면 이동 정상 동작 확인.
