# 2026-08-18 사장님 앱 주문 상세 결제 정보 상태 동기화 수정

## 1. 개요 및 원인
- **현상**: 사장님 앱 주문 상세 화면에서 상단 상태 뱃지는 `입금 대기`인데, 하단 **결제 정보** 카드에서는 `결제 완료 / 토스 결제 승인됨`으로 잘못 표출되는 모순 현상 발생
- **원인**:
  - `src/pages/orders/OrderDetail.jsx`의 결제 정보 카드 조건문에서 `['PAID', 'IN_PROGRESS', 'PICKUP_READY', 'COMPLETED'].includes(order.status) || payment` 로 로컬 더미(mock) payment 객체(`payment`)까지 OR 조건으로 평가하고 있었음
  - 이로 인해 실서버의 주문 상태가 `QUOTED` / `APPROVED` (입금 대기) 임에도 불구하고 로컬 스토리지에 남아있던 `payment` 객체로 인해 결제 완료로 표시됨

---

## 2. 해결 방법 (`src/pages/orders/OrderDetail.jsx`)
- 결제 정보 카드의 결제 여부를 **실서버 주문 상태(`order.status`)에만 100% 동기화**되도록 수정:
  - `order.status`가 `PAID`, `IN_PROGRESS`, `PICKUP_READY`, `COMPLETED`일 때만 ➔ **`결제 완료`** 뱃지 및 **`토스 결제 승인됨`** 표시
  - `order.status`가 `QUOTED`, `APPROVED`, `PENDING`일 때 ➔ **`미결제 (입금 대기)`** 뱃지 및 **`고객이 주문을 확인한 후 소비자 앱에서 토스페이먼츠로 결제를 진행합니다.`** 안내 표시

---

## 3. 검증 결과
- `npm run build` 번들 빌드 통과 (0 errors).
- 입금 대기 상태일 때 결제 정보 카드가 `미결제 (입금 대기)`로 일치하여 정상 렌더링됨을 확인.
