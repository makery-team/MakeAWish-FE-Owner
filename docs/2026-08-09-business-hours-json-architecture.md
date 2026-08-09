# 매장 운영시간(businessHours) JSON 아키텍처 개편 스펙

## 1. 개요
기존에는 매장의 운영시간(`hours` 컬럼)을 `"매일 09:00 - 20:00 (월요일 휴무)"`와 같은 단순 포맷팅된 문자열로 다루었습니다. 
하지만 소비자 앱에서의 실시간 영업 여부 판별(영업 중/종료) 및 풍부한 UI 제공, 그리고 사장님 앱에서의 다차원 편집 폼 유지를 위해 데이터를 구조화된 JSON 배열 형태로 저장 및 파싱하도록 풀스택 아키텍처를 개편했습니다.

## 2. 변경된 데이터 스펙 (JSON Array)
운영시간 데이터는 이제 아래와 같은 7일 단위의 객체 배열 형태(JSON String)로 통신 및 저장됩니다.
```json
[
  {"day":"월","open":"09:00","close":"20:00","closed":false},
  {"day":"화","open":"09:00","close":"20:00","closed":false},
  {"day":"수","open":"09:00","close":"20:00","closed":false},
  {"day":"목","open":"09:00","close":"20:00","closed":false},
  {"day":"금","open":"09:00","close":"20:00","closed":false},
  {"day":"토","open":"10:00","close":"18:00","closed":false},
  {"day":"일","open":"10:00","close":"18:00","closed":true}
]
```

## 3. 사장님 앱 (MakeAWish-FE-Owner) 변경 사항
- **위치:** `src/api/storeApi.js`, `src/store/useShopStore.js`, `src/pages/auth/OnboardingOcr.jsx`
- **저장 로직:** 기존 문자열 조합 함수(`formatBusinessHours`)를 폐기하고, 배열 객체를 `JSON.stringify(data.businessHours)`를 통해 JSON 문자열로 직렬화하여 백엔드로 전송합니다.
- **조회 로직:** 백엔드에서 내려온 JSON 문자열을 `JSON.parse()`로 역직렬화하여 다시 7일 단위 에디터 UI에 바인딩합니다.
- **기대 효과:** 언제든 기존에 설정한 요일별 세부 휴무 및 시간표를 상태 손실 없이 편집할 수 있습니다.

## 4. 백엔드 (MakeAWish-BE) 연관 변경 사항
- **위치:** `src/main/java/org/makery/domain/Store.java`
- JSON 배열 문자열의 길이가 약 400자 이상으로 길어짐에 따라, 기존 255자 제한의 `VARCHAR` 타입에서 500 에러(Data truncation)가 발생했습니다.
- 이를 해결하기 위해 `hours` 컬럼을 `@Column(columnDefinition = "TEXT")`로 마이그레이션하여 대용량 JSON 텍스트를 안정적으로 저장합니다.

## 5. 소비자 앱 (MakeAWish-FE) 연관 변경 사항
- **위치:** `components/shop-detail.tsx`
- 기존 문자열 렌더링을 폐기하고, API 응답으로 받은 JSON 텍스트를 파싱하여 소비자에게 친화적인 형태(예: "휴무" 표시, 요일별 테이블 배치)로 렌더링하도록 뷰 레이어를 리팩토링했습니다.
