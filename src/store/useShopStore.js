import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import * as storeApi from '../api/storeApi'
import * as reviewApi from '../api/reviewApi'

const DEFAULT_BUSINESS_HOURS = {
  mon: '09:00 - 20:00',
  tue: '09:00 - 20:00',
  wed: '09:00 - 20:00',
  thu: '09:00 - 20:00',
  fri: '09:00 - 20:00',
  sat: '10:00 - 18:00',
  sun: '휴무',
}

export const DEFAULT_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80'

const DEFAULT_STORE_PROFILE = {
  id: null,
  storeName: '',
  ownerName: '',
  category: '주문제작 케이크',
  categories: [],
  intro: '',
  address: '',
  phone: '',
  notice: '',
  cautionNotice: '',
  keywords: '',
  profileImage: DEFAULT_PROFILE_IMAGE,
  imageUrl: DEFAULT_PROFILE_IMAGE,
  businessHours: DEFAULT_BUSINESS_HOURS,
  rating: 5.0,
  reviewCount: 0,
}

const DEFAULT_PRICE_ANALYSIS = {
  myAvgPrice: 52000,
  marketAvgPrice: 58000,
  comparisonByCategory: [
    { category: '레터링 케이크', my: 38000, market: 42000 },
    { category: '캐릭터 케이크', my: 65000, market: 70000 },
    { category: '웨딩 케이크', my: 220000, market: 250000 },
    { category: '데일리 케이크', my: 32000, market: 35000 },
  ],
}

export const useShopStore = create(
  persist(
    (set, get) => ({
      profile: DEFAULT_STORE_PROFILE,
      reviews: [],
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
              keywords: data.keywords || '',
              profileImage: data.imageUrl || data.profileImage || state.profile.profileImage,
              imageUrl: data.imageUrl || data.profileImage || state.profile.imageUrl,
              businessHours: parsedHours,
            },
          }))
        } catch (err) {
          // 조회 실패 시 에러 메시지를 남깁니다.
          set({ profileError: err.message || '매장 정보를 불러오지 못했어요' })
          
          if (err.status === 404) {
            console.warn('등록된 매장 프로필이 없습니다. 온보딩이 필요합니다.')
            set((state) => ({ profile: { ...DEFAULT_STORE_PROFILE, id: null } }))
          }
        }
      },

      fetchReviews: async () => {
        const storeId = get().profile.id
        if (!storeId) return
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

      uploadProfileImage: async (file) => {
        try {
          const imageUrl = await storeApi.uploadStoreImage(file)
          const updatedProfile = {
            ...get().profile,
            profileImage: imageUrl,
            imageUrl,
          }
          set({ profile: updatedProfile, profileError: '' })
          await storeApi.updateStoreProfile(updatedProfile)
          return imageUrl
        } catch (err) {
          console.error('Failed to upload store profile image:', err)
          set({ profileError: '프로필 사진 업로드에 실패했습니다.' })
          throw err
        }
      },

      generateIntro: async () => {
        try {
          const { profile } = get()
          const res = await storeApi.generateBio({ keywords: profile.keywords || '' })
          const bioText = res?.generatedBio || res?.bio || res?.description || ''
          
          // 생성된 텍스트를 로컬 상태에 반영하고 바로 서버에 저장
          set((state) => ({ profile: { ...state.profile, intro: bioText } }))
          await get().updateProfile({ intro: bioText })
          
          return bioText
        } catch (err) {
          console.error('Failed to generate intro:', err)
          throw new Error('소개글 자동 생성에 실패했습니다.')
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

      getReviewSummary: async () => {
        const storeId = get().profile.id
        if (!storeId) return null
        try {
          const res = await reviewApi.fetchReviewSummary(storeId)
          return {
            averageRating: get().profile.rating || 0,
            totalCount: res?.totalReviewCount || 0,
            keywords: res?.positive_points || [],
            summary: res?.summary || '',
          }
        } catch (err) {
          console.error('Failed to get review summary:', err)
          return null
        }
      },

      requestProfileSuggestions: async () => {
        const { profile } = get()
        set({ suggestLoading: true, profileError: '' })
        try {
          const res = await storeApi.suggestProfileImprovement()
          let list = []
          if (Array.isArray(res)) {
            list = res
          } else if (res?.suggestions && Array.isArray(res.suggestions)) {
            list = [...res.suggestions]
            if (res.overallFeedback) {
              list.unshift(res.overallFeedback)
            }
          } else if (res?.overallFeedback) {
            list = [res.overallFeedback]
          }

          if (list.length === 0) {
            list = [
              profile.intro ? '소개글이 등록되어 있습니다. 대표 시그니처 케이크의 맛과 재료 설명을 보강해보세요.' : '매장 소개글이 비어있습니다. AI 소개글 자동 생성을 활용해보세요.',
              profile.keywords ? `등록된 핵심 키워드(#${profile.keywords.split(',').map((k) => k.trim()).join(' #')})를 포트폴리오 태그에도 적극 활용해보세요.` : '매장 핵심 키워드(예: #레터링, #당일픽업)를 등록해보세요.',
              '포트폴리오에 다양한 각도의 케이크 사진을 추가하면 고객 주문율이 올라갑니다.',
              '리뷰에 친절한 사장님 답글을 남기면 단골 고객 확보에 도움이 됩니다.',
            ]
          }

          set({ suggestions: list, suggestLoading: false })
          return list
        } catch (err) {
          console.warn('AI 프로필 제안 조회 실패 (기본 제안 제공):', err)
          const fallback = [
            profile.intro ? '소개글이 등록되어 있습니다. 제철 과일이나 특별한 시트 재료를 강조해보세요.' : '소개글을 작성하면 고객에게 신뢰감을 줄 수 있습니다.',
            profile.keywords ? `등록된 키워드(#${profile.keywords.split(',').map((k) => k.trim()).join(' #')}) 관련 신규 디자인을 포트폴리오에 등록해보세요.` : '매장 핵심 키워드를 설정해 AI 소개글을 생성해보세요.',
            '운영 시간 및 휴무일을 명확히 설정하면 픽업 문의가 수월해집니다.',
            '리뷰 답글을 남기면 재주문율이 평균 18% 높아져요.',
          ]
          set({ suggestions: fallback, suggestLoading: false })
          return fallback
        }
      },

      fetchPriceAnalysis: async () => {
        await randomDelay(400, 800)
        set({ priceAnalysis: DEFAULT_PRICE_ANALYSIS })
        return DEFAULT_PRICE_ANALYSIS
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