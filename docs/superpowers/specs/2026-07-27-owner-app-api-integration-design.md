# 사장님 앱 "관리" 탭 API 연동

## 배경
사장님 앱(`MakeAWish-FE-Owner`)은 현재 전부 Zustand 스토어의 mock 함수(`randomDelay` + 목데이터)로 동작한다. 관리 탭 기획 스펙 캡처의 7개 기능 중 6개를 실제 백엔드(Spring 서버 / AI 서버)와 연동한다.

- Spring 서버: `http://Makery-env.eba-scsmpye9.ap-northeast-2.elasticbeanstalk.com`
- AI 서버: `https://makeawish-ai.onrender.com`

## 범위

| # | 기능 | Method | Endpoint | 서버 |
|---|---|---|---|---|
| 1 | (AI) 포트폴리오 태그 추천 | POST | `/api/portfolios/tags/recommend` | AI |
| 2 | 포트폴리오 신규 등록 | POST | `/api/portfolios` | Spring |
| 3 | 포트폴리오 정보 수정 | PATCH | `/api/portfolios/{portfolioId}` | Spring |
| 4 | 매장 프로필 정보 수정 | PATCH | `/api/stores/profile` | Spring |
| 5 | 리뷰 답글 작성/수정 | POST | `/api/reviews/{reviewId}/reply` | Spring |
| 6 | 리뷰 답글 삭제 | DELETE | `/api/reviews/{reviewId}/reply` | Spring |

### 범위 밖
- (AI) 리뷰 요약 조회 — 백엔드 명세 미완성 (BE 상태 "시작 전")
- 실제 로그인/토큰 발급 연동 — `client.js`가 이미 토큰 자동첨부 구조를 갖고 있어 로그인이 연동되면 자동으로 인증이 붙는다
- 이미지 업로드 백엔드 API — 백엔드에 요청한 상태, 나올 때까지 stub으로 대체

## 1. 공통 통신 모듈 확장 (`src/api/client.js`)
기존 `client.js`는 base URL 하나(Spring 서버)만 지원한다. AI 서버(태그 추천 전용)를 호출할 수 있도록 요청 옵션에 `baseUrl` 오버라이드 하나만 추가한다. 기존 호출부(승빈님이 쓰는 `orderApi.js` 등)는 옵션을 안 넘기면 기존과 동일하게 동작하므로 하위 호환된다.

```javascript
// request() 내부, 한 줄만 추가
async function request(endpoint, options = {}) {
  const base = options.baseUrl || BASE_URL
  const url = `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  ...
}
```

`.env.example`에 AI 서버 주소 추가:
```
VITE_AI_API_URL=https://makeawish-ai.onrender.com
```

이 변경은 공용 파일이므로 작업 전/후 승빈님께 간단히 공유한다 (팀 가이드 협업 규칙).

## 2. 신규 API 모듈
`docs/PARTNER_API_GUIDE.md`의 담당 구역 규칙에 따라 아래 3개 파일을 신규 작성한다.

### `src/api/portfolioApi.js`
```javascript
import { client } from './client'

export async function recommendPortfolioTags({ imageUrl, description }) {
  const res = await client.post(
    '/api/portfolios/tags/recommend',
    { imageUrl, description },
    { baseUrl: import.meta.env.VITE_AI_API_URL },
  )
  return res.recommendedTags
}

export async function createPortfolio({ title, description, imageUrl, isInpaintingAllowed, tags }) {
  return client.post('/api/portfolios', { title, description, imageUrl, isInpaintingAllowed, productId: 1, tags })
}

export async function updatePortfolio(portfolioId, { title, description, imageUrl, isInpaintingAllowed, tags }) {
  return client.patch(`/api/portfolios/${portfolioId}`, { title, description, imageUrl, isInpaintingAllowed, tags })
}

// 백엔드 업로드 API 준비 전까지 임시 구현. API 나오면 이 함수 내부만 교체.
export async function uploadPortfolioImage(file) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return `https://picsum.photos/seed/${Date.now()}/600/600`
}
```

### `src/api/storeApi.js`
```javascript
import { client } from './client'

function formatBusinessHours(businessHours) {
  const open = businessHours.filter((h) => !h.closed)
  const closed = businessHours.filter((h) => h.closed)
  if (open.length === 0) return '휴무'
  const allSame = open.every((h) => h.open === open[0].open && h.close === open[0].close)
  const openPart = allSame ? `매일 ${open[0].open}-${open[0].close}` : open.map((h) => `${h.day} ${h.open}-${h.close}`).join(', ')
  const closedPart = closed.length > 0 ? ` (${closed.map((h) => h.day).join(',')} 휴무)` : ''
  return openPart + closedPart
}

export async function updateStoreProfile(data) {
  const payload = {}
  if (data.storeName !== undefined) payload.name = data.storeName
  if (data.intro !== undefined) payload.description = data.intro
  if (data.businessHours !== undefined) payload.hours = formatBusinessHours(data.businessHours)
  return client.patch('/api/stores/profile', payload)
}
```

### `src/api/reviewApi.js`
```javascript
import { client } from './client'

export async function replyToReview(reviewId, replyContent) {
  return client.post(`/api/reviews/${reviewId}/reply`, { replyContent })
}

export async function deleteReviewReply(reviewId) {
  return client.delete(`/api/reviews/${reviewId}/reply`)
}
```

## 3. 스토어 변경

### `usePortfolioStore.js`
- `recommendTags`, `createPortfolio`, `updatePortfolio`를 위 API 함수 호출로 교체 (mock delay 제거)
- 백엔드 응답은 `portfolioId` 필드를 쓰지만 로컬 상태/화면은 `id`를 쓰므로, 스토어에 저장할 때 `{ id: res.portfolioId, ...res }` 형태로 정규화한다

### `useShopStore.js`
- `updateProfile(data)`: 폼 전체 값으로 로컬 상태는 즉시 낙관적 업데이트하고, 그중 백엔드가 지원하는 필드(`storeName`, `intro`, `businessHours`)만 골라 `storeApi.updateStoreProfile`로 전송한다
- `replyToReview(reviewId, text)`: `reviewApi.replyToReview` 호출 후 로컬 reviews 배열의 `reply` 갱신
- 신규 액션 `deleteReply(reviewId)` 추가: `reviewApi.deleteReviewReply` 호출 후 로컬 `reply: null`로 갱신

## 4. UI 변경

### `PortfolioForm.jsx`
- 이미지 플레이스홀더 → `<input type="file" accept="image/*" capture="environment">`로 교체, 선택 즉시 로컬 미리보기(`URL.createObjectURL`) 표시
- 저장 시 새 이미지 파일이 있으면 `uploadPortfolioImage` 먼저 호출해 `imageUrl` 확보 후 등록/수정 호출
- "AI 변형 허용" 토글 추가 (`isInpaintingAllowed`, 기본값 `true`)
- AI 태그 추천 버튼은 이미지가 없으면 비활성화 (안내 문구 표시), 있으면 `{ imageUrl, description }` 전송
- 각 액션 실패 시 버튼 아래 인라인 에러 텍스트 표시

### `StoreManage.jsx`
- 리뷰 항목에 답글이 있을 때 "수정"/"삭제" 버튼 추가 (기존엔 답글 텍스트만 표시되고 수정/삭제 불가였음)
- 프로필/영업시간/답글 저장 실패 시 인라인 에러 텍스트 표시

## 5. 브랜치 전략
`makery`(팀 저장소)에서 최신 `main`을 기준으로 기능 단위 브랜치를 판다. push는 `makery`로 직접 하고, 코드가 어느 정도 완성되면 그 안에서 PR을 연다.

| 브랜치 | 내용 |
|---|---|
| `feature/client-baseurl-option` | `client.js`에 `baseUrl` 옵션 추가 |
| `feature/portfolio-image-picker` | 이미지 선택 UI + 업로드 stub |
| `feature/portfolio-tag-recommend` | AI 태그 추천 연동 (위 두 브랜치 선행 필요) |
| `feature/portfolio-create-update` | 포트폴리오 등록/수정 API 연동 |
| `feature/store-profile-update` | 매장 프로필 수정 API 연동 |
| `feature/review-reply` | 리뷰 답글 작성/수정/삭제 API 연동 |

## 6. 알려진 제약사항
- 매장 프로필 중 `address`, `phone`, `category`, `ownerName`, `profileImage`는 백엔드 `PATCH /api/stores/profile`에 대응 필드가 없다. 화면에서는 계속 수정 가능하지만 로컬(zustand persist)에만 저장되고 서버에는 반영되지 않는다. 백엔드에 필드가 추가되면 추후 연동한다.
- `uploadPortfolioImage`는 백엔드 업로드 API가 나올 때까지 placeholder URL을 반환하는 임시 구현이다.
- `client.js`는 `localStorage`의 `auth_token`을 읽어 인증 헤더를 붙이는데, 실제 로그인 연동 전까지는 토큰이 없어 인증이 필요한 요청이 401을 받을 수 있다 (로그인 연동은 별도 작업 범위).
