import { useNavigate } from 'react-router-dom'
import { Bell, X, ArrowRight, Cookie, ChatCircleDots } from '@phosphor-icons/react'
import { useNotificationStore } from '../../store/useNotificationStore'

export default function NotificationToast() {
  const navigate = useNavigate()
  const { activeToast, dismissToast, markAsRead } = useNotificationStore()

  if (!activeToast) return null

  const handleAction = () => {
    if (activeToast.id) {
      markAsRead(activeToast.id)
    }
    dismissToast()

    if (activeToast.targetId) {
      if (activeToast.type === 'ORDER' || activeToast.type === 'PAYMENT') {
        navigate(`/orders/${activeToast.targetId}`)
      } else if (activeToast.type === 'CHAT') {
        navigate(`/chat/${activeToast.targetId}`)
      }
    } else {
      navigate('/orders')
    }
  }

  const getIcon = () => {
    if (activeToast.type === 'CHAT') return <ChatCircleDots size={20} className="text-cake-pink-500" />
    if (activeToast.type === 'ORDER' || activeToast.type === 'PAYMENT') return <Cookie size={20} className="text-cake-pink-500" />
    return <Bell size={20} className="text-cake-pink-500" />
  }

  return (
    <div className="fixed top-4 inset-x-0 z-50 mx-auto max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3.5 shadow-cake-lg ring-1 ring-cake-pink-200 backdrop-blur">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cake-pink-50">
          {getIcon()}
        </div>

        <div className="min-w-0 flex-1 cursor-pointer" onClick={handleAction}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-cake-pink-600">
              {activeToast.title || '알림'}
            </span>
          </div>
          <p className="truncate text-xs text-cake-ink font-medium">
            {activeToast.message}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleAction}
            className="flex items-center gap-1 rounded-xl bg-cake-pink-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-cake-sm hover:bg-cake-pink-600 active:scale-95 transition-all"
          >
            확인 <ArrowRight size={12} weight="bold" />
          </button>
          <button
            onClick={dismissToast}
            className="rounded-lg p-1 text-cake-ink-soft hover:bg-cake-pink-50"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
