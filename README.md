# 💻 MakeAWish Frontend Owner (Shop Administrator Web)

<p align="center">
  <img src="https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-v5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-v4-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/SSE-Server--Sent%20Events-FF6B6B?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Recharts-v2-22B8CF?style=for-the-badge" />
</p>

MakeAWish 사장님 관리자 웹 포털 저장소입니다. 베이커리 소상공인이 매장의 커스텀 주문서 양식을 직접 설계하고, 실시간으로 수신되는 주문을 칸반 보드로 관리하며, 작업 난이도별 추가금을 투명하게 산정할 수 있는 백오피스 웹 애플리케이션입니다.

---

## 📑 목차 (Table of Contents)
1. [주요 기능](#1-주요-기능)
2. [기술 스택 및 아키텍처](#2-기술-스택-및-아키텍처)
3. [디렉토리 구조 및 역할](#3-디렉토리-구조-및-역할)
4. [핵심 엔지니어링 구현 상세](#4-핵심-엔지니어링-구현-상세)
5. [환경 설정 및 실행 방법](#5-환경-설정-및-실행-방법)

---

## 1. 주요 기능

| 화면 명칭 | 라우트 경로 | 핵심 기능 |
| :--- | :--- | :--- |
| **일일 대시보드** | `/home` | 오늘의 신규 주문 건수, 제작 진행 현황, 일일 픽업 스케줄 관리 |
| **실시간 주문 칸반** | `/orders` | 4단계 공정(접수 ➔ 결제대기 ➔ 제작중 ➔ 픽업완료) 칸반 관리 및 상태 전이 |
| **주문 상세 & 추가금 산정** | `/orders/:id` | 고객 AI 도안/요구사항 검토 및 작업 난이도별 추가금 입력 후 최종 견적서 발송 |
| **동적 주문서 스키마 빌더** | `/orders/schema-editor` | 매장 고유 옵션(케이크 호수, 맛, 레터링 등)을 드래그앤드롭으로 생성하고 JSON Schema로 저장 |
| **포트폴리오 & AI 태깅** | `/portfolio/new` | 제작 케이크 사진 업로드 시 AI가 디자인 태그(#티아라, #생화 등) 자동 추천 |
| **리뷰 관리 & AI 답글 추천** | `/reviews` | 손님 포토 리뷰 조회 및 톤앤매너(정중/친근/감사)별 답글 초안 생성 |
| **매출 및 주문 통계** | `/stats` | Recharts 기반 일자별 매출 추이 꺾은선 차트 및 카테고리별 점유율 도넛 차트 |

---

## 2. 기술 스택 및 아키텍처

- **React 19 & Vite**: 빠른 번들링과 HMR 지원, 최신 React 동시성 기능 활용.
- **Server-Sent Events (SSE)**: 단방향 알림 구조에 최적화된 HTTP 표준 SSE 프로토콜을 채택하여 연결 오버헤드 최소화 및 브라우저 기본 자동 재연결 지원.
- **Zustand 전역 상태 관리**: 보일러플레이트를 최소화하고 도메인별 스토어(`useAuthStore`, `useOrderStore`, `useShopStore`) 분리.
- **Recharts**: SVG 기반 인터랙티브 차트를 활용한 매출 및 주문 데이터 시각화.

---

## 3. 디렉토리 구조 및 역할

```text
MakeAWish-FE-Owner/
├── src/
│   ├── main.jsx                        # 렌더링 엔트리
│   ├── App.jsx                         # 라우팅 및 전역 레이아웃
│   ├── api/                            # 백엔드 Spring Boot API 통신
│   │   ├── client.js                   # Axios 인스턴스 및 토큰 인터셉터
│   │   ├── authApi.js                  # 로그인 및 토큰 발급
│   │   ├── orderApi.js                 # 주문 목록 및 상태 변경
│   │   ├── portfolioApi.js             # 케이크 사진 업로드 및 태그 추출
│   │   ├── reviewApi.js                # 리뷰 조회 및 답글 등록
│   │   └── storeApi.js                 # 매장 정보 및 주문서 스키마 저장
│   ├── components/                     # 공통 레이아웃 및 UI 컴포넌트
│   │   ├── layout/AppLayout.jsx        # 사이드바, 헤더, SSE 실시간 알림 리스너
│   │   └── ui/                         # 버튼, 카드, 토스트 알림 컴포넌트
│   ├── pages/                          # 핵심 업무 화면
│   │   ├── home/Home.jsx               # 메인 대시보드
│   │   ├── orders/OrderList.jsx        # 주문 관리 칸반 보드
│   │   ├── orders/OrderDetail.jsx      # 주문 상세 및 추가금 산정 모달
│   │   ├── orders/OrderSchemaEditor.jsx # 동적 주문서 폼 스키마 빌더
│   │   ├── portfolio/                  # 케이크 포트폴리오 관리
│   │   ├── reviews/ReviewManager.jsx   # 리뷰 관리 및 AI 답글 생성
│   │   └── stats/Stats.jsx             # 매출 및 통계 차트 대시보드
│   └── store/                          # Zustand 스토어 (인증, 주문, 매장)
├── package.json
└── vite.config.js
```

---

## 4. 핵심 엔지니어링 구현 상세

### 4.1 Server-Sent Events (SSE) 기반 실시간 신규 주문 수신 (`src/api/notificationApi.js`)
주문 접수 알림은 단방향 통신이므로 WebSocket 대비 연결 오버헤드가 적고 자동 재연결이 보장되는 SSE(`EventSource`)를 채택했습니다. 신규 주문 이벤트 수신 시 즉시 토스트와 사운드 알림을 트리거합니다.

```javascript
// src/api/notificationApi.js 발췌: SSE 연결 및 이벤트 리스너
export function subscribeNotifications(onMessage, onError) {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://Makery-env.eba-scsmpye9.ap-northeast-2.elasticbeanstalk.com';
  const sseUrl = `${baseUrl}/api/notifications/subscribe?token=${encodeURIComponent(token)}`;

  const eventSource = new EventSource(sseUrl, { withCredentials: true });

  eventSource.addEventListener('notification', (e) => {
    try {
      const data = JSON.parse(e.data);
      if (onMessage) onMessage(data);
    } catch (err) {
      console.warn('SSE 데이터 파싱 오류:', err);
    }
  });

  return () => eventSource.close();
}
```

### 4.2 동적 주문서 폼 스키마 빌더 (`src/store/useShopStore.js`)
사장님이 매장 특성에 맞춰 주문서 항목을 드래그 앤 드롭으로 재배치하고 추가/삭제할 수 있는 빌더입니다. 법적 필수 안내인 '알러지' 필드는 시스템에서 삭제를 차단하고, 불변성을 유지하며 스키마를 업데이트합니다.

```javascript
// src/store/useShopStore.js 발췌: 스키마 순서 변경 및 필수 항목 락킹
export const useShopStore = create((set) => ({
  schema: [],
  reorderFields: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.schema);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { schema: result };
  }),
  removeField: (fieldId) => set((state) => {
    if (fieldId === 'request') {
      alert('알러지 및 추가 요청사항 필드는 필수 안내 항목이므로 삭제할 수 없습니다.');
      return { schema: state.schema };
    }
    return { schema: state.schema.filter(f => f.id !== fieldId) };
  })
}));
```

---

## 5. 환경 설정 및 실행 방법

### 5.1 환경 변수 설정 (`.env`)

```env
VITE_API_URL=https://api.makeawish.app
```

### 5.2 실행 명령어

```bash
# 패키지 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```
