import { useNavigate } from 'react-router-dom'
import { X, Bell, Cookie, ChatCircleDots, Checks } from '@phosphor-icons/react'
import { useNotificationStore } from '../../store/useNotificationStore'

export default function NotificationModal() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    isModalOpen,
    setIsModalOpen,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()

  if (!isModalOpen) return null

  const handleItemClick = (n) => {
    if (!n.isRead && n.id) {
      markAsRead(n.id)
    }
    setIsModalOpen(false)

    if (n.targetId) {
      if (n.type === 'ORDER' || n.type === 'PAYMENT') {
        navigate(`/orders/${n.targetId}`)
      } else if (n.type === 'CHAT') {
        navigate(`/chat/${n.targetId}`)
      }
    } else {
      navigate('/orders')
    }
  }

  const getIcon = (type) => {
    if (type === 'CHAT') return <ChatCircleDots size={18} className="text-cake-pink-500" />
    if (type === 'ORDER' || type === 'PAYMENT') return <Cookie size={18} className="text-cake-pink-500" />
    return <Bell size={18} className="text-cake-pink-500" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mt-12 w-full max-w-sm rounded-3xl bg-white shadow-cake-lg ring-1 ring-cake-pink-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cake-pink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-cake-pink-500" weight="fill" />
            <h2 className="font-bold text-cake-ink">
              알림 {unreadCount > 0 && <span className="text-cake-pink-500">({unreadCount})</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-cake-pink-600 hover:text-cake-pink-700 bg-cake-pink-50 px-2.5 py-1 rounded-full"
              >
                <Checks size={14} /> 모두 읽음
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-full p-1 text-cake-ink-soft hover:bg-cake-pink-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-cake-pink-50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-cake-ink-soft">
              <span className="text-3xl mb-2">🎂</span>
              <p className="text-sm font-medium">새로운 알림이 없습니다.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-cake-pink-50/50 ${
                  !n.isRead ? 'bg-cake-pink-50/30' : ''
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-cake-sm ring-1 ring-cake-pink-100">
                  {getIcon(n.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-cake-pink-600">
                      {n.title || (n.type === 'ORDER' ? '주문 알림' : (n.type === 'PAYMENT' ? '결제 알림' : (n.type === 'CHAT' ? '채팅 알림' : '알림')))}
                    </span>
                    {n.createdAt && (
                      <span className="text-[10px] text-cake-ink-soft">
                        {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-cake-ink">
                    {n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cake-pink-500" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
