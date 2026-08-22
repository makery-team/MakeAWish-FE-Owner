# 2026-08-22 사장님 앱 실시간 알림(SSE/Toast/Modal) 시스템 가이드

## 1. 개요
- 사장님이 매장 관리 중 새 주문 접수, 결제 완료, 채팅 메시지 도착 등 중요한 상태 변화를 실시간으로 즉시 인지할 수 있도록 상단 플로팅 토스트(Toast) 팝업, 상단 종(🔔) 미확인 뱃지 및 알림함 모달(Modal)을 구축.

---

## 2. 주요 변경 사항 (`MakeAWish-FE-Owner`)
1. **`api/notificationApi.js`**:
   - `fetchNotifications(page, size)`, `fetchUnreadNotificationCount()`, `markNotificationAsRead(id)`, `markAllNotificationsAsRead()`, `subscribeNotifications(onMessage, onError)` 연동
2. **`store/useNotificationStore.js`**:
   - 알림 목록, 미확인 카운트, 실시간 토스트(`activeToast`), SSE 연결 및 폴링 하이브리드 관리
3. **`components/ui/NotificationToast.jsx`**:
   - 새 알림 도착 시 상단 플로팅 토스트 팝업 및 [확인] 클릭 시 해당 주문/채팅으로 즉시 이동
4. **`components/ui/NotificationModal.jsx`**:
   - 알림 목록 조회, 개별 읽음 및 전체 읽음 처리, 클릭 시 관련 화면 이동
5. **`components/layout/AppLayout.jsx` & `pages/home/Home.jsx`**:
   - 상단 헤더에 종(🔔) 아이콘 및 미확인 뱃지 배치
   - 앱 전역에서 실시간 알림 수신 리스너 가동
