# 2026-08-21 사장님 앱 Mock 주문 데이터 제거 및 기본 주문서 양식 원클릭 가이드

## 1. 개요 및 변경 사항
1. **Mock 주문 데이터 완전 제거 (`useOrderStore.js`)**:
   - `orders: []`, `extraCharges: []`, `payments: []`로 초기화하여 실제 백엔드 서버에 접수된 주문만 표시
2. **주문서 기본 양식 원클릭 불러오기 (`OrderSchemaEditor.jsx`)**:
   - `DEFAULT_RECOMMENDED_SCHEMA` (5대 필수 질문: 사이즈, 맛/시트, 레터링, 픽업일시, 요청사항) 탑재
   - 빈 상태 안내 UI 및 상단 배너에 **`[✨ 추천 기본 양식 불러오기]`** 버튼 추가

---

## 2. 검증 결과
- `npm run build` 빌드 성공 (0 errors).
