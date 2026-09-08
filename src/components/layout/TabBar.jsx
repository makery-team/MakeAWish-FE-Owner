import { NavLink } from 'react-router-dom'
import { House, Cookie, Cake, Storefront, ChatCircleDots } from '@phosphor-icons/react'

const TABS = [
  { to: '/home', label: '홈', Icon: House },
  { to: '/orders', label: '주문', Icon: Cookie },
  { to: '/chat', label: '채팅관리', Icon: ChatCircleDots },
  { to: '/menus', label: '메뉴 관리', Icon: Cake },
  { to: '/store', label: '매장관리', Icon: Storefront },
]

export default function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-cake-pink-100 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur">
      <ul className="flex items-stretch justify-between px-1">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-cake-pink-600' : 'text-cake-ink-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}