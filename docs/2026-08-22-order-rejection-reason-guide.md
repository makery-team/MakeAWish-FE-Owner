# 2026-08-22 사장님 앱 주문 거절 및 거절 사유 전달 가이드

## 1. 개요
- 사장님이 주문을 거절할 때 거절 사유를 백엔드에 전달하고, 화면에 거절/취소 사유가 즉시 노출되도록 개선.

---

## 2. 주요 변경 사항 (`MakeAWish-FE-Owner`)
1. **`api/orderApi.js` & `store/useOrderStore.js`**:
   - `updateOrderStatus(orderId, status, reason)`에서 `reason` 및 `rejectReason` 파라미터를 쿼리 및 바디에 함께 전달.
2. **`pages/orders/OrderDetail.jsx`**:
   - 주문 거절 확정 시 거절 사유를 함께 전달하여 상태 업데이트.
   - 주문 상세 화면에서 거절/취소 사유(`rejectReason`) 렌더링.
