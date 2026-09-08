# 2026-08-21 사장님 앱 추가금 삭제 기능 및 결제 완료 시 수정 잠금 가이드

## 1. 개요
- 사장님이 견적 상담 중 추가금을 잘못 입력했을 때 바로 삭제할 수 있는 기능 추가.
- 고객이 결제를 완료했거나 제작/픽업 단계로 넘어간 주문(`PAID`, `IN_PROGRESS`, `PICKUP_READY`, `COMPLETED`)은 추가금 추가 및 수정/삭제가 불가능하도록 UI와 백엔드를 잠금 처리.

---

## 2. 주요 변경 사항 (`MakeAWish-FE-Owner`)
1. **`store/useOrderStore.js`**:
   - `deleteExtraCharge(orderId)` 액션 추가 (서버 `registerExtraFee(orderId, { amount: 0, reason: '' })` 호출 및 로컬 스토어 갱신)
2. **`pages/orders/OrderDetail.jsx`**:
   - 추가금 항목 옆에 쓰레기통(`Trash`) 삭제 버튼 제공
   - 결제 완료(`isPaid = true`) 상태일 경우:
     - `+ 추가` 버튼 대신 `결제 완료 (수정 불가)` 뱃지 표시
     - 추가금 삭제 버튼 및 입력 폼 노출 차단
