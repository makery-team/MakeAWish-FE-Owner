import { client } from './client'

/**
 * 로컬 Mock ID(예: 'order_004')이거나 숫자가 아닌 ID인 경우 판단
 * 백엔드 컨트롤러(@PathVariable Long orderId)가 400 Bad Request(For input string) 에러를 뱉는 것을 방지
 */
export function isMockOrderId(orderId) {
  return String(orderId).startsWith('order_') || isNaN(Number(orderId))
}

/**
 * 1. 내 주문 목록 조회 API (사장님 권한으로 접수된 주문 목록)
 * @param {Object} params - 예: { date: 'today' } (오늘 주문 필터 시 사용)
 */
export async function fetchOrders(params = {}) {
  const query = new URLSearchParams()
  if (params.date) {
    query.append('date', params.date)
  }
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return await client.get(`/api/orders${queryString}`)
}

/**
 * 2. 주문 단건 상세 조회 API
 * @param {number|string} orderId
 */
export async function fetchOrderById(orderId) {
  if (isMockOrderId(orderId)) {
    console.info('[orderApi] Mock 주문 ID 감지 (실서버 GET 생략):', orderId)
    return null
  }
  return await client.get(`/api/orders/${orderId}`)
}

/**
 * 3. 주문 상태 변경 API
 * 백엔드 OrderController.java (@RequestParam OrderStatus status 지원 및 Body PATCH 호환)
 * 허용 Enum: PENDING, ACCEPTED, REJECTED, IN_PROGRESS, PICKUP_READY, COMPLETED
 * @param {number|string} orderId
 * @param {string} status - 변경할 주문 상태 대문자 Enum
 */
export async function updateOrderStatus(orderId, status, reason = '') {
  if (isMockOrderId(orderId)) {
    console.info('[orderApi] Mock 주문 ID 상태 변경 시도 (실서버 PATCH 생략):', orderId, status, reason)
    return { success: true, mock: true }
  }
  const upperStatus = String(status).toUpperCase()
  const query = new URLSearchParams({ status: upperStatus })
  if (reason) {
    query.append('reason', reason)
  }
  return await client.patch(
    `/api/orders/${orderId}/status?${query.toString()}`,
    { status: upperStatus, reason, rejectReason: reason }
  )
}

/**
 * 4. 사장님: 주문 추가금 책정 및 등록 API
 * 백엔드 ExtraFeeCreateRequest.java (extraFee 필수)와 PARTNER_API_GUIDE (amount)를 100% 동시 만족
 * @param {number|string} orderId
 * @param {Object} data - { amount: 5000, reason: "디자인 난이도 추가" }
 */
export async function registerExtraFee(orderId, { amount, reason = '' }) {
  if (isMockOrderId(orderId)) {
    console.info('[orderApi] Mock 주문 ID 추가금 등록 시도 (실서버 POST 생략):', orderId)
    return { success: true, mock: true }
  }
  const parsedAmount = Number(amount) || 0
  return await client.post(`/api/orders/${orderId}/extra-fee`, {
    extraFee: parsedAmount,
    amount: parsedAmount,
    reason: String(reason),
  })
}

/**
 * 5. 추가금 상세 및 최종 가격 조회 API
 * @param {number|string} orderId
 */
export async function fetchExtraFee(orderId) {
  if (isMockOrderId(orderId)) {
    console.info('[orderApi] Mock 주문 ID 추가금 조회 시도 (실서버 GET 생략):', orderId)
    return null
  }
  return await client.get(`/api/orders/${orderId}/extra-fee`)
}
