import { client } from './client'

/**
 * 사장님의 전체 1:1 채팅방 목록 조회
 * GET /chatting/rooms
 */
export async function fetchChatRooms() {
  return client.get('/chatting/rooms')
}

/**
 * 1:1 채팅방 생성 또는 기존 방 조회
 * POST /chatting/room
 * @param {Object} data - { userId?: number, storeId?: number }
 */
export async function createChatRoom(data) {
  return client.post('/chatting/room', data)
}

/**
 * 특정 채팅방의 과거 대화 메시지 내역 조회
 * GET /chatting/rooms/{roomNumber}/messages
 * @param {number|string} roomNumber
 */
export async function fetchChatHistory(roomNumber) {
  try {
    const res = await client.get(`/chatting/rooms/${roomNumber}/messages`)
    return Array.isArray(res) ? res : []
  } catch (error) {
    console.warn(`[chatApi] 과거 대화 내역 조회 실패 (roomNumber=${roomNumber}):`, error.message)
    return []
  }
}

/**
 * 채팅방 삭제 (나가기)
 * DELETE /chatting/rooms/{roomNumber}
 * @param {number|string} roomNumber
 */
export async function deleteChatRoom(roomNumber) {
  return client.delete(`/chatting/rooms/${roomNumber}`)
}
