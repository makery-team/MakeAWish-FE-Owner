import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuthStore } from '../store/useAuthStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com'

export function useChatSocket(roomNumber, myUserId) {
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef(null)
  const token = useAuthStore((s) => s.token) || localStorage.getItem('auth_token')

  const connect = useCallback(() => {
    if (!roomNumber || !myUserId || !token) return
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    try {
      const wsUrl = BASE_URL.replace(/^http/, 'ws') + `/chats?roomNumber=${roomNumber}&userId=${myUserId}&token=${encodeURIComponent(token)}`
      console.log(`[useChatSocket] Connecting: ${wsUrl}`)

      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('[useChatSocket] WebSocket 연결 성공')
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('[useChatSocket] 수신 메시지:', data)
          if (Number(data.roomNumber) === Number(roomNumber)) {
            setMessages((prev) => [...prev, data])
          }
        } catch (e) {
          console.error('[useChatSocket] 메시지 파싱 오류:', e)
        }
      }

      ws.onerror = (err) => {
        console.error('[useChatSocket] WebSocket 에러:', err)
      }

      ws.onclose = (event) => {
        console.log('[useChatSocket] WebSocket 연결 종료:', event.code, event.reason)
        setIsConnected(false)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[useChatSocket] 소켓 연결 시도 중 오류:', error)
    }
  }, [roomNumber, myUserId, token])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && roomNumber && myUserId) {
      const payload = {
        userId: Number(myUserId),
        message: content,
        imageUrl: null,
        roomNumber: Number(roomNumber),
      }
      wsRef.current.send(JSON.stringify(payload))
    } else {
      console.warn('[useChatSocket] 웹소켓 미연결 상태이거나 정보가 부족합니다.')
    }
  }, [roomNumber, myUserId])

  useEffect(() => {
    if (roomNumber && myUserId) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [roomNumber, myUserId, connect, disconnect])

  return {
    messages,
    setMessages,
    isConnected,
    sendMessage,
  }
}
