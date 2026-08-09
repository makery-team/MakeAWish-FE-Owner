import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import { INITIAL_BUSINESS_LICENSE } from '../mocks/seed'
import * as authApi from '../api/authApi'
import * as userApi from '../api/userApi'

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
            // 디버깅: 백엔드에서 받아온 프로필 값 확인
            alert('디버깅: 서버에서 받은 역할은 -> ' + profile.userRole)

            if (profile.userRole === 'ROLE_SELLER') {
              isOnboarded = true
            }
          } catch (e) {
            console.warn('프로필 조회 실패 (초기 가입자일 수 있음):', e)
            alert('디버깅: 프로필 조회 실패! ' + e.message)
          }

          // 3. Zustand 스토어 상태 갱신
          set({
            isLoggedIn: true,
            token: res.accessToken,
            refreshToken: res.refreshToken,
            onboarded: isOnboarded,
            user: {
              name: profile.nickname || profile.name || res.name || '사장님',
              email: profile.email || 'partner@dalkomgongbang.com',
              avatar: 'https://picsum.photos/seed/owner-avatar/200/200',
            },
          })
          return { ...res, isOnboarded }
        } catch (error) {
          console.error('로그인 API 연동 실패:', error)
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
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
        set({ businessLicenseStatus: 'DONE', businessLicense: INITIAL_BUSINESS_LICENSE })
        return INITIAL_BUSINESS_LICENSE
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

          // 2. 주소나 운영시간 정보가 있다면 생성 직후 곧바로 수정 API 호출
          if (storeData.address || storeData.hours) {
            const { updateStoreProfile } = await import('../api/storeApi')
            await updateStoreProfile({
              storeName: storeData.name,
              address: storeData.address,
              businessHours: storeData.hours,
              phone: storeData.phone,
            })
          }

          // 3. 프론트엔드 온보딩 완료 상태 저장
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