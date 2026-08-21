# 2026-08-21 사장님 주문 상세에서 고객 1:1 실시간 채팅방 바로 연결 가이드

## 1. 개요
- 사장님 주문 상세(`OrderDetail.jsx`)에서 [고객과 채팅하기] 버튼을 눌렀을 때, 로컬 Mock 임의 채팅 화면으로 넘어가 `undefined`와 대화하던 문제를 해결.
- 백엔드로부터 전달받은 고객 정보(`customerId`, `customerName`)를 바탕으로 실제 1:1 웹소켓 실시간 채팅방(`/chat/:roomNumber`)으로 직접 이동하도록 개선.

---

## 2. 주요 변경 사항 (`MakeAWish-FE-Owner`)
1. **`pages/orders/OrderDetail.jsx`**:
   - `fetchOrderById` 응답에서 `customerId`, `customerName`, `customerPhone` 정확히 매핑
   - [고객과 채팅하기] 클릭 시 `fetchChatRooms()`를 조회하여 해당 고객의 1:1 채팅방(`roomNumber`)으로 즉시 이동
   - 아직 생성된 채팅방이 없을 경우 친절한 안내 Alert 표출
2. **`pages/orders/OrderChat.jsx`**:
   - 주문 정보 조회 및 실서버 1:1 채팅방 자동 탐색 리다이렉트 처리
   - `undefined 님과의 채팅` 텍스트 오류 수정 (`displayName` 적용)
