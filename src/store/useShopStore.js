import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import {
  INITIAL_STORE_PROFILE,
  INITIAL_REVIEWS,
  PROFILE_SUGGESTIONS,
  PRICE_ANALYSIS,
  REVIEW_SUMMARY,
  STORE_INTRO_DRAFT,
} from '../mocks/seed'
import * as storeApi from '../api/storeApi'
import * as reviewApi from '../api/reviewApi'

export const useShopStore = create(
  persist(
    (set, get) => ({
      profile: INITIAL_STORE_PROFILE,
      reviews: INITIAL_REVIEWS,
      reviewsError: '',
      suggestions: [],
      priceAnalysis: null,
      profileError: '',

      fetchProfile: async () => {
        set({ profileError: '' })
        try {
          const data = await storeApi.getMyStoreProfile()
          // useAuthStore에서 현재 로그인된 유저 정보를 가져와 대표자명으로 사용
          const { useAuthStore } = await import('./useAuthStore')
          const currentUser = useAuthStore.getState().user

          let parsedHours = get().profile.businessHours
          if (data.hours) {
            try {
              parsedHours = JSON.parse(data.hours)
            } catch (e) {
              console.warn('운영시간 JSON 파싱 실패:', e)
            }
          }

          set((state) => ({
            profile: {
              ...state.profile,
              id: data.id,
              storeName: data.name || '',
              ownerName: currentUser?.realName || currentUser?.name || '',
              category: '미설정', // 백엔드 카테고리가 아직 연동 안됨
              categories: data.categories || [],
              intro: data.description || '',
              address: data.address || '',
              phone: data.phone || '',
              notice: data.notice || '',
              cautionNotice: data.cautionNotice || '',
              businessHours: parsedHours,
            },
          }))
        } catch (err) {
          // 조회 실패 시 (예: 매장이 아직 없는 경우) 에러 메시지를 남깁니다.
          set({ profileError: err.message || '매장 정보를 불러오지 못했어요' })
        }
      },

      fetchReviews: async (storeId = 1) => {
        set({ reviewsError: '' })
        try {
          const data = await reviewApi.fetchStoreReviews(storeId)
          set({
            reviews: data.map((r) => ({
              id: r.id,
              customerName: r.nickname,
              rating: r.rating,
              content: r.content,
              reply: r.replyContent,
              createdAt: r.createdAt,
            })),
          })
        } catch (err) {
          set({ reviewsError: err.message || '리뷰를 불러오지 못했어요' })
        }
      },

      updateProfile: async (data) => {
        const updatedProfile = { ...get().profile, ...data }
        set({ profile: updatedProfile, profileError: '' })
        try {
          await storeApi.updateStoreProfile(updatedProfile)
        } catch (err) {
          set({ profileError: err.message || '저장에 실패했어요. 다시 시도해주세요' })
        }
      },

      generateIntro: async (keywords = '') => {
        try {
          const res = await storeApi.generateBio({ keywords })
          const bioText = res?.bio || res?.description || STORE_INTRO_DRAFT
          set((state) => ({ profile: { ...state.profile, intro: bioText } }))
          return bioText
        } catch {
          await randomDelay(800, 1200)
          set((state) => ({ profile: { ...state.profile, intro: STORE_INTRO_DRAFT } }))
          return STORE_INTRO_DRAFT
        }
      },

      replyError: '',

      replyToReview: async (reviewId, text) => {
        set({ replyError: '' })
        try {
          await reviewApi.replyToReview(reviewId, text)
          set((state) => ({
            reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, reply: text } : r)),
          }))
        } catch (err) {
          set({ replyError: err.message || '답글 등록에 실패했어요' })
        }
      },

      deleteReply: async (reviewId) => {
        set({ replyError: '' })
        try {
          await reviewApi.deleteReviewReply(reviewId)
          set((state) => ({
            reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, reply: null } : r)),
          }))
        } catch (err) {
          set({ replyError: err.message || '답글 삭제에 실패했어요' })
        }
      },

      getReviewSummary: () => REVIEW_SUMMARY,

      requestProfileSuggestions: async () => {
        try {
          const res = await storeApi.suggestProfileImprovement()
          const list = res?.suggestions || PROFILE_SUGGESTIONS
          set({ suggestions: list })
          return list
        } catch {
          await randomDelay(700, 1000)
          set({ suggestions: PROFILE_SUGGESTIONS })
          return PROFILE_SUGGESTIONS
        }
      },

      fetchPriceAnalysis: async () => {
        await randomDelay(900, 1500)
        set({ priceAnalysis: PRICE_ANALYSIS })
        return PRICE_ANALYSIS
      },
    }),
    {
      name: 'cake-shop',
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        profile: { ...currentState.profile, ...persistedState?.profile },
      }),
    },
  ),
)