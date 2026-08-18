import { create } from 'zustand'
import { fetchStoreReviews, replyToReview, deleteReviewReply } from '../api/reviewApi'
import { useShopStore } from './useShopStore'

export const useReviewStore = create((set, get) => ({
  reviews: [],
  loading: false,
  error: '',

  fetchReviews: async (storeId) => {
    set({ loading: true, error: '' })
    try {
      let targetId = storeId
      if (!targetId) {
        const profile = useShopStore.getState().profile
        targetId = profile?.id
      }
      const data = await fetchStoreReviews(targetId)
      set({ reviews: Array.isArray(data) ? data : [] })
    } catch (err) {
      console.error('[useReviewStore] 리뷰 조회 실패:', err)
      set({ error: err.message || '리뷰를 불러오지 못했습니다.' })
    } finally {
      set({ loading: false })
    }
  },

  submitReply: async (reviewId, replyContent) => {
    try {
      const updatedReview = await replyToReview(reviewId, replyContent)
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === reviewId
            ? { ...r, replyContent: updatedReview.replyContent || replyContent, replyCreatedAt: updatedReview.replyCreatedAt || new Date().toISOString() }
            : r
        ),
      }))
      return true
    } catch (err) {
      console.error('[useReviewStore] 답글 등록 실패:', err)
      throw err
    }
  },

  removeReply: async (reviewId) => {
    try {
      await deleteReviewReply(reviewId)
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === reviewId
            ? { ...r, replyContent: null, replyCreatedAt: null }
            : r
        ),
      }))
      return true
    } catch (err) {
      console.error('[useReviewStore] 답글 삭제 실패:', err)
      throw err
    }
  },

  getStats: () => {
    const reviews = get().reviews || []
    const totalCount = reviews.length
    if (totalCount === 0) {
      return { totalCount: 0, averageRating: 0, withReplyCount: 0, pendingReplyCount: 0 }
    }
    const sumRating = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0)
    const averageRating = (sumRating / totalCount).toFixed(1)
    const withReplyCount = reviews.filter((r) => !!r.replyContent).length
    const pendingReplyCount = totalCount - withReplyCount

    return {
      totalCount,
      averageRating: Number(averageRating),
      withReplyCount,
      pendingReplyCount,
    }
  },
}))
