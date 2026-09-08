import { client } from './client'

/**
 * 1. 매장별 고객 리뷰 목록 조회 API
 * GET /api/stores/{storeId}/reviews
 */
export async function fetchStoreReviews(storeId, page = 0, size = 50) {
  let targetStoreId = storeId
  if (!targetStoreId) {
    try {
      const { useShopStore } = await import('../store/useShopStore')
      const { profile } = useShopStore.getState()
      if (profile && profile.id) {
        targetStoreId = profile.id
      }
    } catch (e) {
      console.warn('Failed to get storeId from useShopStore', e)
    }
  }

  if (!targetStoreId) return []

  const res = await client.get(`/api/stores/${targetStoreId}/reviews?page=${page}&size=${size}`)
  return Array.isArray(res) ? res : (res?.content || [])
}

/**
 * 2. 사장님 리뷰 답글 작성 및 수정 API
 * POST /api/reviews/{reviewId}/reply
 */
export async function replyToReview(reviewId, replyContent) {
  return await client.post(`/api/reviews/${reviewId}/reply`, { replyContent })
}

/**
 * 3. 사장님 리뷰 답글 삭제 API
 * DELETE /api/reviews/{reviewId}/reply
 */
export async function deleteReviewReply(reviewId) {
  return await client.delete(`/api/reviews/${reviewId}/reply`)
}

/**
 * 4. AI 리뷰 요약 조회 API
 */
export async function fetchReviewSummary(storeId) {
  return await client.get(`/api/stores/${storeId}/reviews/summary`)
}
