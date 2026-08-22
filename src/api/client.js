import { useAuthStore } from '../store/useAuthStore'

// 1. 기본 API 주소 설정 (Vercel HTTPS 배포 환경에서는 Mixed Content 방지를 위해 상대 경로 프록시 사용)
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
const envApiUrl = import.meta.env.VITE_API_URL
const BASE_URL = (envApiUrl && envApiUrl.startsWith('https')) 
  ? envApiUrl 
  : (isHttps ? '' : (envApiUrl || 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com'))

/**
 * 토큰을 가져오는 함수 (Zustand store 또는 LocalStorage에서 획득)
 */
function getAuthToken() {
  try {
    // 1순위: localStorage 직접 조회
    const rawToken = localStorage.getItem('auth_token')
    if (rawToken) return rawToken

    // 2순위: Zustand auth 스토어 조회
    const storeState = useAuthStore.getState()
    if (storeState && storeState.token) {
      return storeState.token
    }
  } catch (error) {
    console.warn('토큰 조회 중 오류 발생:', error)
  }
  return null
}

/**
 * 공통 fetch 요청 함수
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const token = getAuthToken()
  const isFormData = options.body instanceof FormData

  const headers = {
    // FormData(파일 업로드)일 땐 Content-Type을 직접 지정하지 않는다.
    // fetch가 알아서 multipart 경계(boundary)를 포함해 설정해준다.
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  }

  // 토큰이 존재하면 Authorization 헤더 자동 추가
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(url, config)

    // 401 Unauthorized 처리 (토큰 만료 혹은 인증 실패 시)
    if (response.status === 401) {
      console.error('인증 토큰이 만료되었거나 유효하지 않습니다 (401 Unauthorized)')
      // 필요한 경우 자동 로그아웃 처리
      // useAuthStore.getState().logout()
    }

    // 204 No Content 등 본문이 없는 응답 처리
    if (response.status === 204) {
      return null
    }

    // JSON 본문 파싱 시도
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage = (data && (data.message || data.error)) || `API 요청 실패 (${response.status})`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  } catch (error) {
    console.error(`[API ERROR] ${options.method || 'GET'} ${url} ->`, error.message || error)
    throw error
  }
}

// 2. 공통 HTTP 클라이언트 내보내기 (승빈님, 고은님 팀플레이용)
export const client = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
}

export default client
