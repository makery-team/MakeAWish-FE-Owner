import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TabBar from './TabBar'
import NotificationToast from '../ui/NotificationToast'
import NotificationModal from '../ui/NotificationModal'
import { useNotificationStore } from '../../store/useNotificationStore'

export default function AppLayout() {
  const location = useLocation()
  const { initSSE } = useNotificationStore()

  useEffect(() => {
    const cleanup = initSSE()
    return () => {
      if (cleanup) cleanup()
    }
  }, [initSSE])

  const isFullScreenChat =
    location.pathname.startsWith('/chat/') ||
    (location.pathname.startsWith('/orders/') && location.pathname.endsWith('/chat'))

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-cake-cream">
      <NotificationToast />
      <NotificationModal />
      <div className={`flex-1 ${isFullScreenChat ? 'h-dvh flex flex-col overflow-hidden pb-0' : 'pb-24'}`}>
        <Outlet />
      </div>
      {!isFullScreenChat && <TabBar />}
    </div>
  )
}