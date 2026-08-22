import { client } from './client'

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
 * @param {number|string} orderId
 * @param {Object} data - { amount: 5000, reason: "디자인 난이도 추가" }
 */
export async function registerExtraFee(orderId, { amount, reason = '' }) {
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
  return await client.get(`/api/orders/${orderId}/extra-fee`)
}

