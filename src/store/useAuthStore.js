import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import * as authApi from '../api/authApi'
import * as userApi from '../api/userApi'

const DEFAULT_BUSINESS_LICENSE = {
  storeName: '달콤공방 케이크',
  businessNumber: '123-45-67890',
  representativeName: '김달콤',
  address: '서울특별시 마포구 양화로 45',
}

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      onboarded: false,
      token: null,
      refreshToken: null,
      user: null,
      businessLicenseStatus: 'NONE', // NONE | ANALYZING | DONE
      businessLicense: null,

      /**
       * 구글 OAuth 토큰으로 백엔드 로그인 API 연동
       * @param {string} token - 구글 인증 토큰 (idToken)
       */
      loginWithGoogle: async (token) => {
        try {
          // 1. 백엔드(Spring)와 OAuth2 통신하여 자체 Access / Refresh 토큰 발급
          const res = await authApi.socialLogin('google', token)

          // 0. 이전 세션의 매장 정보 캐시 초기화 (DB 초기화 및 다른 계정 로그인 대비)
          localStorage.removeItem('cake-shop')
          try {
            const { useShopStore } = await import('./useShopStore')
            useShopStore.setState({ 
              profile: {
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
                profileImage: '',
                imageUrl: '',
                rating: 5.0,
                reviewCount: 0,
              }, 
              reviews: [], 
              suggestions: [] 
            })
          } catch (e) {
            console.warn('매장 캐시 초기화 중 오류:', e)
          }

          // 1. 공통 client.js에서 조회할 수 있도록 localStorage에 보관
          if (res.accessToken) {
            localStorage.setItem('auth_token', res.accessToken)
          }
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken)
          }

          // 2. 프로필 정보를 조회하여 온보딩(사장님 권한) 여부 확인
          let isOnboarded = false
          let profile = {}
          try {
            profile = await userApi.getUserProfile()
            if (profile.userRole === 'ROLE_SELLER') {
              isOnboarded = true
            }
          } catch (e) {
            console.warn('프로필 조회 실패 (초기 가입자일 수 있음):', e)
          }

          // 3. Zustand 스토어 상태 갱신
          set({
            isLoggedIn: true,
            token: res.accessToken,
            refreshToken: res.refreshToken,
            onboarded: isOnboarded,
            user: {
              id: profile.id,
              name: profile.nickname || profile.name || res.name || '사장님',
              realName: profile.name || res.name || '사장님',
              email: profile.email || 'partner@dalkomgongbang.com',
              avatar: 'https://picsum.photos/seed/owner-avatar/200/200',
            },
          })

          // 4. 사장님 권한이면 최신 매장 프로필 백그라운드 동기화
          if (isOnboarded) {
            try {
              const { useShopStore } = await import('./useShopStore')
              useShopStore.getState().fetchProfile()
            } catch (e) {}
          }
          return { ...res, isOnboarded }
        } catch (error) {
          console.error('로그인 API 연동 실패:', error)
          throw error
        }
      },

      fetchUserProfile: async () => {
        try {
          const profile = await userApi.getUserProfile()
          if (profile) {
            set((state) => ({
              user: {
                ...(state.user || {}),
                id: profile.id,
                name: profile.nickname || profile.name || state.user?.name || '사장님',
                realName: profile.name || state.user?.realName || '사장님',
                email: profile.email || state.user?.email || '',
              },
            }))
            return profile
          }
        } catch (error) {
          console.warn('[useAuthStore] fetchUserProfile error:', error)
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('cake-shop') // 이전 매장 정보 캐시 삭제
        set({
          isLoggedIn: false,
          token: null,
          refreshToken: null,
          user: null,
          onboarded: false,
          businessLicenseStatus: 'NONE',
          businessLicense: null,
        })
      },

      /**
       * 개발/테스트 중 온보딩 OCR 화면을 다시 확인하거나 테스트할 수 있는 초기화 헬퍼
       */
      resetOnboarding: () => {
        set({
          onboarded: false,
          businessLicenseStatus: 'NONE',
          businessLicense: null,
        })
      },

      createBusinessLicenseAnalysis: async () => {
        set({ businessLicenseStatus: 'ANALYZING' })
        await randomDelay(1400, 2200)
        set({ businessLicenseStatus: 'DONE', businessLicense: DEFAULT_BUSINESS_LICENSE })
        return DEFAULT_BUSINESS_LICENSE
      },

      completeOnboarding: async (storeData) => {
        try {
          // 1. 백엔드 회원 초기화 API (SellerProfile, Store 동시 생성)
          await userApi.initUserProfile({
            nickname: storeData.name,
            phoneNumber: storeData.phone,
            language: 'KO',
            isSeller: true,
          })

          // 2. 생성 직후 곧바로 수정 API 호출하여 상호명, 연락처, 주소 등 최신화
          const { updateStoreProfile } = await import('../api/storeApi')
          await updateStoreProfile({
            storeName: storeData.name,
            address: storeData.address,
            businessHours: storeData.hours,
            phone: storeData.phone,
            keywords: storeData.keywords,
          })

          // 3. Zustand 매장 스토어 강제 갱신 (캐시된 옛날 이름 방지)
          const { useShopStore } = await import('./useShopStore')
          await useShopStore.getState().fetchProfile()

          // 4. 프론트엔드 온보딩 완료 상태 저장
          set({ onboarded: true })
        } catch (error) {
          console.error('매장 개설 실패:', error)
          throw error
        }
      },
    }),
    { name: 'cake-auth' },
  ),
)