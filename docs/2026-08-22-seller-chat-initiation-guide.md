# 2026-08-22 사장님 주문 상세에서 고객과 즉시 1:1 채팅 개설 및 이동 가이드

## 1. 개요
- 고객이 아직 먼저 1:1 채팅을 걸지 않았더라도, 사장님이 주문 상세에서 **[고객과 채팅하기]** 버튼을 누르면 백엔드에 1:1 채팅방을 즉시 개설(`createChatRoom({ userId: order.customerId })`)하여 실시간 대화를 먼저 시작할 수 있도록 개선.

---

## 2. 주요 변경 사항 (`MakeAWish-FE-Owner`)
1. **`api/chatApi.js`**:
   - `createChatRoom(data)` 함수 추가 (`POST /chatting/room`)
2. **`pages/orders/OrderDetail.jsx`**:
   - [고객과 채팅하기] 클릭 시 고객이 먼저 방을 만들지 않았더라도 `createChatRoom({ userId: order.customerId })`를 호출해 1:1 채팅방을 즉시 생성/조회 후 해당 대화방(`/chat/:roomNumber`)으로 이동
3. **`pages/orders/OrderChat.jsx`**:
   - 동일하게 `createChatRoom` 연동으로 실서버 채팅방 자동 개설 및 리다이렉트
