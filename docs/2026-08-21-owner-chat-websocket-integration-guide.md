# 2026-08-21 사장님 앱 실시간 1:1 채팅 및 WebSocket 연동 가이드

## 1. 개요 및 구현 내용
1. **채팅 REST API 클라이언트 모듈 (`src/api/chatApi.js`)**:
   - `fetchChatRooms()`: 백엔드 `GET /chatting/rooms` 호출하여 내 매장과 대화 중인 채팅방 목록 조회
   - `fetchChatHistory(roomNumber)`: `GET /chatting/rooms/{roomNumber}/messages` 호출하여 과거 대화 내역 조회
   - `deleteChatRoom(roomNumber)`: `DELETE /chatting/rooms/{roomNumber}` 호출하여 채팅방 나가기
2. **WebSocket 실시간 통신 훅 (`src/hooks/useChatSocket.js`)**:
   - `ws://.../chats?roomNumber={roomNumber}&userId={userId}&token={token}` 표준 웹소켓 연결
   - 실시간 메시지 수신 및 송신(`sendMessage`) 지원
3. **채팅 관리 및 실시간 채팅방 화면 (`src/pages/chat/ChatManage.jsx`, `src/pages/chat/ChatRoom.jsx`)**:
   - 실서버 대화방 목록 조회 및 손님 닉네임, 최근 메시지, 시간 표출
   - 채팅방 실시간 대화 송수신, 사장님/손님 말풍선 구분, 대화방 나가기/삭제 기능 완비
4. **라우팅 등록 (`src/App.jsx`)**:
   - `/chat`: 전체 채팅방 목록 화면
   - `/chat/:roomNumber`: 특정 손님과의 실시간 1:1 대화방 화면

---

## 2. 검증 결과
- `npm run build` 빌드 성공 (0 errors).
