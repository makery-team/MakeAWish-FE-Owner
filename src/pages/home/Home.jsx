import { useNavigate } from 'react-router-dom'
import { Sparkle, CaretRight, ChartBar } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'
import { useShopStore } from '../../store/useShopStore'
import { useOrderStore } from '../../store/useOrderStore'
import Card from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

export default function Home() {
  const navigate = useNavigate()
  const { profile } = useShopStore()
  const { getTodayOrders, getTodayBriefing } = useOrderStore()
  const todayOrders = getTodayOrders()
  const briefing = getTodayBriefing()

  return (
    <div className="px-5 pt-6">
      <p className="text-sm text-cake-ink-soft">안녕하세요 👋</p>
      <h1 className="font-display text-2xl text-cake-ink">{profile?.storeName || '매장'} 사장님</h1>

      <Card className="mt-4 bg-gradient-to-br from-cake-pink-400 to-cake-pink-500 text-white">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
          <Sparkle size={16} weight="fill" />
          오늘의 브리핑
        </div>
        <p className="mt-2 text-sm leading-relaxed">{briefing.summary}</p>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="rounded-full bg-white/20 px-3 py-1">대기 {briefing.pendingCount}건</span>
          <span className="rounded-full bg-white/20 px-3 py-1">제작중 {briefing.inProgressCount}건</span>
          <span className="rounded-full bg-white/20 px-3 py-1">
            예상 매출 {briefing.expectedRevenue.toLocaleString()}원
          </span>
        </div>
      </Card>

      <Card
        onClick={() => navigate('/stats')}
        className="mt-4 flex cursor-pointer items-center justify-between active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cake-mint-100 text-cake-mint-600">
            <ChartBar size={18} weight="fill" />
          </div>
          <div>
            <p className="text-sm font-bold text-cake-ink">매출관리</p>
            <p className="text-xs text-cake-ink-soft">매출 통계와 인기 메뉴를 확인해보세요</p>
          </div>
        </div>
        <CaretRight size={16} className="text-cake-ink-soft" />
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg text-cake-ink">오늘의 주문 ({todayOrders.length})</h2>
        <button onClick={() => navigate('/orders')} className="flex items-center text-xs font-semibold text-cake-pink-500">
          전체보기 <CaretRight size={14} />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {todayOrders.length === 0 && (
          <EmptyState icon="🍰" title="오늘 주문이 없어요" description="새로운 주문이 들어오면 여기에 보여드릴게요" />
        )}
        {todayOrders.map((order) => (
          <Card
            key={order.id}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex cursor-pointer items-center justify-between active:scale-[0.98]"
          >
            <div>
              <p className="font-semibold text-cake-ink">{order.customerName} · {order.cakeType}</p>
              <p className="mt-0.5 text-xs text-cake-ink-soft">픽업 {order.pickupTime} · {order.price.toLocaleString()}원</p>
            </div>
            <StatusBadge status={order.status} />
          </Card>
        ))}
      </div>
    </div>
  )
}