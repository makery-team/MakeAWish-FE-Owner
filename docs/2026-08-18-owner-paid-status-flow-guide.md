# 2026-08-18 사장님 앱 결제 완료(PAID) 상태 뱃지 및 제작 플로우 연동 가이드

## 1. 개요
- **목적**: 소비자가 토스페이먼츠 결제를 마친 뒤 생성되는 `PAID`(결제 완료) 주문 상태를 사장님 앱에서 명확히 인지하고, 이후 `IN_PROGRESS`(제작 중) ➔ `PICKUP_READY`(픽업 대기) ➔ `COMPLETED`(완료)로 이어지는 E2E 비즈니스 프로세스를 매끄럽게 처리할 수 있도록 지원합니다.

## 2. 주요 변경 사항

### 2.1. `src/components/ui/Badge.jsx`
- 백엔드 전체 `OrderStatus` Enum에 대응하는 라벨 및 테마 색상 뱃지 추가:
  - `PENDING_QUOTE`, `PENDING`: `견적 대기` (노란색)
  - `QUOTED`, `APPROVED`, `ACCEPTED`: `입금 대기` (파란색)
  - `PAID`: `결제 완료` (에메랄드 녹색)
  - `IN_PROGRESS`: `제작 중` (핑크색)
  - `PICKUP_READY`: `픽업 대기` (인디고 보라색)
  - `COMPLETED`: `픽업 완료` (민트색)
  - `REJECTED`, `CANCELED`: `주문 거절 / 취소` (그레이)

### 2.2. `src/pages/orders/OrderDetail.jsx`
- **상태별 동적 액션 버튼**:
  - `PENDING` / `PENDING_QUOTE` ➔ `[거절]` & `[수락하기]` (`QUOTED` 전환)
  - `QUOTED` / `APPROVED` ➔ `💳 고객의 결제를 기다리고 있습니다 (입금 대기)` 안내
  - `PAID` ➔ `🍰 제작 시작하기` (`IN_PROGRESS` 전환)
  - `IN_PROGRESS` ➔ `📦 픽업 준비 완료` (`PICKUP_READY` 전환)
  - `PICKUP_READY` ➔ `✨ 픽업 완료 및 주문 마감` (`COMPLETED` 전환)
  - `COMPLETED` ➔ `🎉 픽업 및 주문이 완료되었습니다` 안내
- **결제 정보 카드 실시간 연동**:
  - `PAID`, `IN_PROGRESS`, `PICKUP_READY`, `COMPLETED` 상태일 때 **[결제 완료 (토스 결제 승인됨)]** 뱃지 및 총 결제 금액 노출

### 2.3. `src/pages/orders/OrderList.jsx`
- 주문 필터 탭에 `견적 대기`, `입금 대기`, `결제 완료`, `제작 중`, `픽업 대기`, `완료` 전 세부 상태 탭 추가 및 정렬 최적화

---

## 3. 검증 결과
- `npm run build` 프로덕션 번들 빌드 통과 (0 errors).
