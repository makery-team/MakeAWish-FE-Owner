# 2026-08-21 사장님 앱 대화창 레이아웃 및 뷰포트 화면 맞춤 개선

## 1. 개요 및 변경 사항
1. **1:1 대화방 진입 시 하단 탭바 숨김 및 전체화면 맞춤 (`AppLayout.jsx`)**:
   - `/chat/:roomNumber` 및 `/orders/:orderId/chat` 경로 진입 시 하단 공통 탭바(`TabBar`)를 자동으로 숨김
   - 부모 레이아웃의 `pb-24` 패딩을 제거하고 `h-dvh flex flex-col overflow-hidden`으로 뷰포트에 딱 맞게 설정
2. **대화창 내부 Flex 및 스크롤 영역 최적화 (`ChatRoom.jsx`)**:
   - 상단 헤더와 하단 입력바는 `shrink-0`으로 고정
   - 대화 내역 영역은 `flex-1 min-h-0 overflow-y-auto`로 설정하여 이중 스크롤이나 화면 밀림 없이 내부에서만 매끄럽게 스크롤되도록 개선

---

## 2. 검증 결과
- `npm run build` 빌드 성공 (0 errors).
