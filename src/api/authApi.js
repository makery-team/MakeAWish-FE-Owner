import { client } from './client'

/**
 * 소셜 로그인 (Google 등) OAuth 인증 API
 * @param {string} provider - 소셜 로그인 제공자 (예: 'google')
 * @param {string} token - Google 등으로부터 받은 인증 토큰 (idToken 또는 accessToken)
 * @returns {Promise<{accessToken: string, refreshToken: string, name: string}>}
 */
export async function socialLogin(provider = 'google', token) {
  return client.post(`/api/auth/${provider}`, { token })
}

/**
 * Refresh Token을 사용하여 Access Token을 갱신합니다.
 * @param {string} refreshToken
 * @returns {Promise<{accessToken: string}>}
 */
export async function refreshAccessToken(refreshToken) {
  return client.post('/api/token', { refreshToken })
}
