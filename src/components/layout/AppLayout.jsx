import { Outlet, useLocation } from 'react-router-dom'
import TabBar from './TabBar'

export default function AppLayout() {
  const location = useLocation()
  const isFullScreenChat =
    location.pathname.startsWith('/chat/') ||
    (location.pathname.startsWith('/orders/') && location.pathname.endsWith('/chat'))

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-cake-cream">
      <div className={`flex-1 ${isFullScreenChat ? 'h-dvh flex flex-col overflow-hidden pb-0' : 'pb-24'}`}>
        <Outlet />
      </div>
      {!isFullScreenChat && <TabBar />}
    </div>
  )
}