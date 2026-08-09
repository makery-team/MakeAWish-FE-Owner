import { client } from './client'

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
  if (data.storeName !== undefined) payload.name = data.storeName
  if (data.intro !== undefined) payload.description = data.intro
  if (data.businessHours !== undefined) payload.hours = formatBusinessHours(data.businessHours)
  
  // 누락되었던 필드 추가 매핑
  if (data.address !== undefined) payload.address = data.address
  if (data.phone !== undefined) payload.phone = data.phone
  if (data.notice !== undefined) payload.notice = data.notice
  if (data.cautionNotice !== undefined) payload.cautionNotice = data.cautionNotice

  return client.patch('/api/stores/profile', payload)
}

export async function suggestProfileImprovement() {
  return client.get('/api/profile-suggest')
}

export async function generateBio(payload = {}) {
  return client.post('/api/generate-bio', payload)
}
