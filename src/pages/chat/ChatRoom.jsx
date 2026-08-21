import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { PaperPlaneTilt, User, WarningCircle } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'
import { useChatSocket } from '../../hooks/useChatSocket'
import { fetchChatHistory } from '../../api/chatApi'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/ui/Spinner'

export default function ChatRoom() {
  const { roomNumber } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, fetchUserProfile } = useAuthStore()

  const customerName = location.state?.customerName || '고객님'
  const [text, setText] = useState('')
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef(null)

  // 1. 유저 프로필이 없으면 가져오기
  useEffect(() => {
    if (!user?.id) {
      fetchUserProfile()
    }
  }, [user, fetchUserProfile])

  // 2. 웹소켓 훅 연동
  const { messages, setMessages, isConnected, sendMessage } = useChatSocket(roomNumber, user?.id)

  // 3. 과거 대화 내역 불러오기
  useEffect(() => {
    if (roomNumber) {
      fetchChatHistory(roomNumber).then((history) => {
        if (Array.isArray(history) && history.length > 0) {
          setMessages(history)
        }
        setHistoryLoaded(true)
      })
    }
  }, [roomNumber, setMessages])

  // 4. 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim() || !isConnected || !user?.id) return
    const content = text.trim()

    // 소켓 전송
    sendMessage(content)

    // 로컬 Optimistic Update
    const optimisticMsg = {
      roomNumber: Number(roomNumber),
      userId: Number(user.id),
      message: content,
      imageUrl: null,
      createdTime: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setText('')
  }

  return (
    <div className="flex h-dvh flex-col bg-cake-pink-50/20">
      <PageHeader 
        title={`${customerName} 님과의 대화`} 
        subtitle={isConnected ? '실시간 연결됨 🟢' : '연결 중... 🟡'} 
        back 
      />

      {/* 실시간 연결 상태 배너 */}
      {!isConnected && (
        <div className="flex items-center justify-center gap-1.5 bg-cake-yellow-50 py-1.5 text-xs font-semibold text-cake-yellow-600">
          <WarningCircle size={14} />
          <span>실시간 채팅 서버에 연결 중입니다...</span>
        </div>
      )}

      {/* 대화 영역 */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {!historyLoaded && (
          <div className="py-12 text-center">
            <Spinner label="대화 기록을 불러오는 중..." />
          </div>
        )}

        {historyLoaded && messages.length === 0 && (
          <div className="py-16 text-center text-sm text-cake-ink-soft">
            <p className="font-semibold text-cake-ink">첫 메시지를 보내보세요!</p>
            <p className="mt-1 text-xs text-cake-ink-muted">고객님과 1:1로 실시간 주문 상담을 진행할 수 있습니다.</p>
          </div>
        )}

        {messages.map((m, idx) => {
          const isMe = Number(m.userId) === Number(user?.id)
          const formattedTime = m.createdTime
            ? new Date(m.createdTime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : '방금'

          return (
            <div key={idx} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cake-pink-100 text-cake-pink-600">
                  <User size={16} weight="bold" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? 'rounded-br-none bg-cake-pink-500 text-white'
                    : 'rounded-bl-none border border-cake-pink-100 bg-white text-cake-ink'
                }`}
              >
                {!isMe && (
                  <p className="mb-0.5 text-[11px] font-bold text-cake-pink-600">{customerName}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.message}</p>
                <div
                  className={`mt-1 text-right text-[10px] ${
                    isMe ? 'text-white/80' : 'text-cake-ink-muted'
                  }`}
                >
                  {formattedTime}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="sticky bottom-0 flex items-center gap-2 border-t border-cake-pink-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={!isConnected}
          placeholder={isConnected ? '고객님께 보낼 메시지를 입력하세요...' : '연결 중에는 입력할 수 없습니다.'}
          className="flex-1 rounded-full bg-cake-pink-50 px-4 py-2.5 text-sm outline-none placeholder:text-cake-ink-soft focus:ring-2 focus:ring-cake-pink-300 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || !isConnected}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cake-pink-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-40"
          aria-label="전송"
        >
          <PaperPlaneTilt size={18} weight="fill" />
        </button>
      </div>
    </div>
  )
}
