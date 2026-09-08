import client from './client'

/**
 * 1. 알림 목록 페이징 조회
 * GET /api/notifications?page=0&size=15
 */
export async function fetchNotifications(page = 0, size = 15) {
  try {
    const res = await client.get(`/api/notifications?page=${page}&size=${size}`)
    return res.data || res
  } catch (error) {
    console.warn('[notificationApi] 알림 목록 조회 실패:', error.message)
    return { content: [] }
  }
}

/**
 * 2. 미확인 알림 수 조회
 * GET /api/notifications/unread-count
 */
export async function fetchUnreadNotificationCount() {
  try {
    const res = await client.get('/api/notifications/unread-count')
    const data = res.data || res
    return Number(data?.unreadCount || 0)
  } catch (error) {
    console.warn('[notificationApi] 미확인 알림 수 조회 실패:', error.message)
    return 0
  }
}

/**
 * 3. 알림 단건 읽음 처리
 * PATCH /api/notifications/{id}/read
 */
export async function markNotificationAsRead(id) {
  try {
    await client.patch(`/api/notifications/${id}/read`)
    return true
  } catch (error) {
    console.warn('[notificationApi] 알림 단건 읽음 처리 실패:', error.message)
    return false
  }
}

/**
 * 4. 전체 알림 일괄 읽음 처리
 * PATCH /api/notifications/read-all
 */
export async function markAllNotificationsAsRead() {
  try {
    await client.patch('/api/notifications/read-all')
    return true
  } catch (error) {
    console.warn('[notificationApi] 전체 알림 읽음 처리 실패:', error.message)
    return false
  }
}

/**
 * 5. SSE 실시간 알림 스트림 구독
 * GET /api/notifications/subscribe
 */
export function subscribeNotifications(onMessage, onError) {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
  // EventSource polyfill 또는 Fetch-based SSE
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  const url = `${baseUrl}/api/notifications/subscribe`

  let eventSource = null
  try {
    // URL에 토큰이 필요한 경우 쿼리스트링 전달 or EventSource standard
    const sseUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url
    eventSource = new EventSource(sseUrl, { withCredentials: true })

    eventSource.addEventListener('connect', (e) => {
      console.info('🔔 [SSE] 연결 활성화:', e.data)
    })

    eventSource.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse(e.data)
        if (onMessage) onMessage(data)
      } catch (err) {
        console.warn('🔔 [SSE] 데이터 파싱 오류:', err)
      }
    })

    eventSource.onerror = (err) => {
      if (onError) onError(err)
    }
  } catch (e) {
    console.warn('🔔 [SSE] EventSource 생성 실패:', e)
  }

  return () => {
    if (eventSource) {
      eventSource.close()
    }
  }
}
