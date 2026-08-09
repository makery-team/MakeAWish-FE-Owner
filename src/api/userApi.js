import { client } from './client'

/**
 * 소셜 가입 직후 필수 프로필(매장 포함) 설정 API
 * @param {Object} data 
 * @param {string} data.nickname - 서비스 활동 닉네임 (매장명으로 쓰임)
 * @param {string} data.phoneNumber - 연락처
 * @param {string} data.language - 주 사용 언어 설정 (예: 'KO')
 * @param {boolean} data.isSeller - 판매자 여부 (true 전달 시 SellerProfile 및 Store 생성됨)
 */
export async function initUserProfile({ nickname, phoneNumber, language = 'KO', isSeller = true }) {
  return client.patch('/api/users/me/init', { nickname, phoneNumber, language, isSeller })
}

/**
 * 내 프로필 정보 조회 API
 */
export async function getUserProfile() {
  return client.get('/api/users/me')
}
