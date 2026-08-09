# 🚨 Trouble Shooting: 매장 프로필 수정 500 에러 및 데이터 누락 버그

**작성일**: 2026-08-09
**작성자**: 승빈 (FE 리드)

## 1. 이슈 현상 (Issue Description)
실서버(AWS Elastic Beanstalk) 연동 환경에서 사장님이 '매장 관리' 탭에 진입하여 주소나 연락처를 수정하고 저장할 때 `500 Internal Server Error`가 발생함.
- **Endpoint**: `PATCH /api/stores/profile`
- **Error Log**: `Failed to load resource: the server responded with a status of 500`

## 2. 원인 분석 (Root Cause Analysis)

본 이슈는 **백엔드(DB 아키텍처) 문제**와 **프론트엔드(Payload 누락) 문제** 두 가지가 복합적으로 작용한 결과임.

### 2.1 백엔드 측 원인: Store 데이터 부재
- 현재 `AuthService.java`에서 구글 소셜 로그인 시 `User` 엔티티만 생성되고, `SellerProfile`과 `Store` 엔티티가 생성되지 않음.
- 유저 계정에 매핑된 `Store`가 없기 때문에 `StoreService`의 `findByUserId` 호출 시 `EntityNotFoundException / IllegalStateException`을 던지며 500 에러 발생.

### 2.2 프론트엔드 측 원인: Payload 누락
- 프론트엔드의 `src/api/storeApi.js` 내 `updateStoreProfile` 함수에서 서버로 데이터를 전송할 때, 매장의 `address`와 `phone` 필드를 의도치 않게 빼놓고 쏘고 있었음.
- 백엔드 500 에러가 아니었더라도, 프론트에서 아예 데이터를 보내지 않았기 때문에 프로필 업데이트가 영구적으로 불가능한 숨은 버그였음.

## 3. 해결 방안 (Resolution)

### 3.1 프론트엔드 버그 픽스 (완료)
`src/api/storeApi.js` 파일을 수정하여 API Payload에 누락된 필드를 추가함.
```javascript
// 수정 후
export async function updateStoreProfile(data) {
  const payload = {
    name: data.name,
    description: data.description,
    address: data.address,           // 추가됨
    phone: data.phone,               // 추가됨
    notice: data.notice,             // 추가됨
    cautionNotice: data.cautionNotice // 추가됨
  }
  return client.patch('/api/stores/profile', payload)
}
```

### 3.2 백엔드 아키텍처 개선 (진행 중)
- **단기 조치**: 개발(실서버) 테스트를 위해 현재 로그인된 구글 계정(User)에 임시로 빈 `Store` 데이터를 DB에 인서트하여 테스트를 진행.
- **근본 해결 (아키텍처 개선)**: 프론트엔드에서 '매장 개설 온보딩 2단계(정보 입력 폼)'를 신규 개발하고, 백엔드에 **`POST /api/stores`** API 생성을 요청하여 최초 매장 가입 시점에 명시적으로 매장을 개설하도록 플로우를 전면 수정함.
