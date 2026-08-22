import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import { useChatStore } from '../../store/useChatStore'
import { fetchOrderById } from '../../api/orderApi'
import { fetchChatRooms, createChatRoom } from '../../api/chatApi'
import PageHeader from '../../components/ui/PageHeader'

export default function OrderChat() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrderById } = useOrderStore()
  const { getMessages, sendMessage } = useChatStore()
  const mockOrder = getOrderById(orderId)
  const messages = getMessages(orderId)
  const [serverOrder, setServerOrder] = useState(null)
  const [text, setText] = useState('')

  useEffect(() => {
    async function initChat() {
      try {
        const orderData = await fetchOrderById(orderId)
        if (orderData) {
          setServerOrder(orderData)
        }
        const customerId = orderData?.customerId || orderData?.userId || (orderData?.user && orderData.user.id)
        const customerName = orderData?.customerName || (orderData?.user && orderData.user.name) || orderData?.orderData?.customerName

        let targetRoomNumber = null
        let targetOtherId = customerId
        let targetCustomerName = customerName || '고객님'

        if (customerId) {
          try {
            const roomRes = await createChatRoom({ userId: customerId })
            if (roomRes && roomRes.roomNumber) {
              targetRoomNumber = roomRes.roomNumber
              targetOtherId = roomRes.otherId || customerId
              targetCustomerName = roomRes.otherName || customerName
            }
          } catch (e) {
            console.warn('createChatRoom 실패 (fallback):', e)
          }
        }

        if (!targetRoomNumber) {
          const rooms = await fetchChatRooms()
          const matched = Array.isArray(rooms)
            ? rooms.find((r) => {
                const matchId = customerId && String(r.otherId) === String(customerId)
                const matchName = customerName && r.otherName === customerName
                return matchId || matchName
              })
            : null

          if (matched) {
            targetRoomNumber = matched.roomNumber
            targetOtherId = matched.otherId
            targetCustomerName = matched.otherName || customerName
          }
        }

        if (targetRoomNumber) {
          navigate(`/chat/${targetRoomNumber}`, {
            replace: true,
            state: { customerName: targetCustomerName, otherId: targetOtherId },
          })
        }
      } catch (err) {
        console.warn('채팅방 탐색 실패:', err)
      }
    }
    initChat()
  }, [orderId, navigate])

  const order = serverOrder || mockOrder
  const displayName = order?.customerName || (order?.user && order.user.name) || (order?.orderData && (order.orderData.customerName || order.orderData.name)) || '고객'

  const handleSend = () => {
    if (!text.trim()) return
    sendMessage(orderId, text.trim())
    setText('')
  }

  return (
    <div className="flex h-dvh flex-col">
      <PageHeader title={`${displayName} 님과의 채팅`} subtitle={order?.cakeType || '주문제작 케이크'} back />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        {messages.length === 0 && <p className="mt-10 text-center text-sm text-cake-ink-soft">아직 대화가 없어요</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'store' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                m.sender === 'store' ? 'bg-cake-pink-500 text-white' : 'bg-white text-cake-ink ring-1 ring-cake-pink-100'
              }`}
            >
              {m.text}
              <div className={`mt-1 text-[10px] ${m.sender === 'store' ? 'text-white/70' : 'text-cake-ink-soft'}`}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 border-t border-cake-pink-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-full bg-cake-pink-50 px-4 py-2.5 text-sm outline-none placeholder:text-cake-ink-soft"
        />
        <button
          onClick={handleSend}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cake-pink-500 text-white active:scale-95"
          aria-label="전송"
        >
          <PaperPlaneTilt size={18} weight="fill" />
        </button>
      </div>
    </div>
  )
}