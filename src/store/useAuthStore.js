import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay } from '../lib/time'
import { INITIAL_BUSINESS_LICENSE } from '../mocks/seed'
import { socialLogin } from '../api/authApi'

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
          const res = await socialLogin('google', token)

          // 개발용: 로그인 성공 시 받은 JWT를 브라우저 콘솔에 출력 (F12 → Console에서 확인)
          console.log('[로그인 성공] accessToken:', res.accessToken)
          if (res.refreshToken) {
            console.log('[로그인 성공] refreshToken:', res.refreshToken)
          }

          // 1. 공통 client.js에서 조회할 수 있도록 localStorage에 보관
          if (res.accessToken) {
            localStorage.setItem('auth_token', res.accessToken)
          }
          if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken)
          }

          // 2. Zustand 스토어 상태 갱신
          set({
            isLoggedIn: true,
            token: res.accessToken,
            refreshToken: res.refreshToken,
            user: {
              name: res.name || '사장님',
              email: 'partner@dalkomgongbang.com',
              avatar: 'https://picsum.photos/seed/owner-avatar/200/200',
            },
          })
          return res
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

      completeOnboarding: () => set({ onboarded: true }),
    }),
    { name: 'cake-auth' },
  ),
)