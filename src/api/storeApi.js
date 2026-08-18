import { client } from './client'

export async function getMyStoreProfile() {
  const res = await client.get('/api/stores/me')
  return res // MyStoreResponse (name, description, address, phone, hours, notice 등 포함)
}

function formatBusinessHours(businessHours) {
  const open = businessHours.filter((h) => !h.closed)
  const closed = businessHours.filter((h) => h.closed)
  if (open.length === 0) return '휴무'
  const allSame = open.every((h) => h.open === open[0].open && h.close === open[0].close)
  const openPart = allSame
    ? `매일 ${open[0].open}-${open[0].close}`
    : open.map((h) => `${h.day} ${h.open}-${h.close}`).join(', ')
  const closedPart = closed.length > 0 ? ` (${closed.map((h) => h.day).join(',')} 휴무)` : ''
  return openPart + closedPart
}

export async function updateStoreProfile(data) {
  const payload = {}
  
  // 프론트엔드의 profile 객체는 'storeName', 'intro', 'businessHours' 등의 키를 사용합니다.
  if (data.storeName !== undefined) payload.name = data.storeName
  if (data.intro !== undefined) payload.description = data.intro
  
  if (data.businessHours !== undefined) {
    // 백엔드는 String을 받으므로 JSON 문자열로 직렬화하여 저장합니다. (나중에 수정 폼에서 다시 파싱해서 쓰기 위함)
    payload.hours = JSON.stringify(data.businessHours)
  }
  
  // 누락되었던 필드 추가 매핑
  if (data.address !== undefined) payload.address = data.address
  if (data.phone !== undefined) payload.phone = data.phone
  if (data.notice !== undefined) payload.notice = data.notice
  if (data.cautionNotice !== undefined) payload.cautionNotice = data.cautionNotice
  if (data.keywords !== undefined) payload.keywords = data.keywords
  if (data.imageUrl !== undefined || data.profileImage !== undefined) {
    payload.imageUrl = data.imageUrl || data.profileImage
  }

  return client.patch('/api/stores/profile', payload)
}

export async function uploadStoreImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await client.post('/api/images/upload', formData)
  return res.imageUrl
}

export async function suggestProfileImprovement() {
  return client.get('/api/stores/ai/profile-suggest')
}

export async function generateBio(payload = {}) {
  return client.post('/api/stores/ai/generate-bio', payload)
}
export async function updateOrderSchema(storeId, payload) { return client.post(`/api/stores/${storeId}/order-schema`, payload) }
