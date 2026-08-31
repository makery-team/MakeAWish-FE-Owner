# 사장님 웹 주문서 양식 순서 변경 영구 보존(Order Persistence) 버그 수정

## 1. 개요
- 작업일시: 2026-08-31
- 목적: 주문서 양식 항목의 순서를 변경하고 [저장하기]를 눌렀을 때, DB/JSON 역직렬화 과정에서 순서가 초기화되거나 되돌아가는 현상 해결

## 2. 원인 분석
1. MySQL JSON 및 일반 JS Object (`properties: { key: value }`)는 키의 순서를 보장하지 않음.
2. `handleSave()` 호출 시 `useShopStore.getState().fetchProfile()`을 `await`하지 않아 비동기 경쟁 상태가 발생하고, 서버에서 다시 받아온 비정렬된 JSON properties가 `Object.keys()`로 풀리면서 순서가 이전 상태로 되돌아감.

## 3. 해결 내용
1. **스키마 저장 시 순서 배열(`order`) 및 인덱스 속성 동시 보존** (`src/store/useOrderStore.js`):
   - `orderSchema` 객체에 `order: ['size', 'flavor', ...]` 배열 및 각 필드에 `order: idx`를 포함하여 전송.
2. **양식 로드 시 정렬 로직 강화** (`src/pages/orders/OrderSchemaEditor.jsx`):
   - `orderSchema.order` 배열이 존재할 경우 해당 순서대로 정확하게 정렬하여 `fields` 상태에 세팅.
   - 레거시 데이터인 경우 각 프로퍼티의 `order` 숫자 속성을 기준으로 오름차순 정렬.
3. **저장 및 동기화 순서 안정화**:
   - `handleSave()` 내에서 `updateSchemaFields()`와 `fetchProfile()`을 순차적으로 `await` 처리하여 UI 깜빡임 및 순서 롤백 방지.
