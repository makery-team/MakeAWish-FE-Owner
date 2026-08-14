# 트러블슈팅: 실서버 Order 데이터 연동 시 홈 화면 렌더링 에러 (White Screen of Death)

## 📌 문제 상황 (Symptom)
소비자 앱에서 실제 주문을 성공적으로 넣은 후, 사장님 앱(Owner App)에서 `/home` 라우트로 진입 시 앱 전체가 하얀 화면으로 멈춰버리는(White Screen of Death) 이슈가 발생했습니다.

브라우저 콘솔에는 다음과 같은 에러가 출력되었습니다:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'toLocaleString')
at Home.jsx:78
```

## 🔍 원인 분석 (Root Cause)
1. **Mock 데이터와 실 데이터 규격 불일치**: 
   - 이전에 UI를 개발하며 사용했던 가짜 데이터(`INITIAL_ORDERS`)에는 가격 정보가 `price` 필드명으로 존재했습니다. 
   - 하지만 백엔드 API 연동 후 `GET /api/orders`에서 넘어오는 `OrderSummaryResponse` DTO를 보면, 가격 정보가 `totalPrice`라는 필드명으로 전달됩니다.
   - 또한, 픽업 날짜의 경우 Mock 데이터는 `pickupTime: '오늘 14:00'`처럼 문자열로 되어 있지만, 실 데이터는 `pickupDate: '2026-08-14T20:00:00'`과 같은 ISO 날짜 문자열로 넘어왔습니다.
2. **방어 코드 부재**:
   - `Home.jsx`의 리스트 렌더링 부분에서 `order.price.toLocaleString()` 함수를 무조건 호출하도록 되어있었기 때문에, `order.price`가 `undefined`로 평가되자 체이닝된 함수 호출에서 치명적인 에러(TypeError)가 발생했습니다.

## 🛠 해결 방법 (Solution & Code)
프론트엔드 단에서 Mock 데이터(로컬 테스트용)와 실 백엔드 데이터 포맷 모두를 유연하게 수용할 수 있도록 `Home.jsx`의 렌더링 로직을 수정했습니다.

### 수정 전 (`src/pages/home/Home.jsx`)
```jsx
<div>
  <p className="font-semibold text-cake-ink">{order.customerName} · {order.cakeType}</p>
  <p className="mt-0.5 text-xs text-cake-ink-soft">픽업 {order.pickupTime} · {order.price.toLocaleString()}원</p>
</div>
```

### 수정 후 (`src/pages/home/Home.jsx`)
```jsx
<div>
  <p className="font-semibold text-cake-ink">
    {/* 백엔드 데이터에 customerName이 없는 경우 주문번호를 보여주도록 fallback */}
    {order.customerName || `주문 ${order.orderNumber || order.id}`} 
    {order.cakeType ? ` · ${order.cakeType}` : ''}
  </p>
  <p className="mt-0.5 text-xs text-cake-ink-soft">
    {/* pickupTime이 있으면 쓰고, 없으면 pickupDate를 파싱해서 HH:MM 형태로 표기 */}
    픽업 {order.pickupTime || new Date(order.pickupDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
    {/* price나 totalPrice 중 존재하는 값을 사용. 둘 다 없으면 0으로 처리 */}
    · {(order.price || order.totalPrice || 0).toLocaleString()}원
  </p>
</div>
```

## 💡 교훈 (Lesson Learned)
- 백엔드 API 연동 초기 단계에서는 DTO 응답 포맷(Key 값)이 프론트엔드의 Mock 데이터 구조와 다를 수 있으므로, 렌더링 단계에서 **Optional Chaining(`?.`)**이나 **Fallback(`||`)** 처리를 생활화하여 앱 크래시를 방지해야 합니다.
