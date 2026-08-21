import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowClockwise, ChatCircleDots } from '@phosphor-icons/react'
import { fetchOrders } from '../../api/orderApi'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

const FILTERS = [
  { key: 'ALL', label: '전체' },
  { key: 'PENDING', label: '견적 대기' },
  { key: 'QUOTED', label: '입금 대기' },
  { key: 'PAID', label: '결제 완료' },
  { key: 'IN_PROGRESS', label: '제작 중' },
  { key: 'PICKUP_READY', label: '픽업 대기' },
  { key: 'COMPLETED', label: '완료' },
]

export default function OrderList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('ALL')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await fetchOrders()
      const rawList = Array.isArray(data) ? data : (data?.data || data?.content || [])
      const mapped = rawList.map((item) => ({
        id: item.id || item.orderId,
        status: item.orderStatus || item.status || 'PENDING',
        customerName: item.customerName || item.userName || '주문 고객',
        cakeType: item.cakeType || item.designName || '주문제작 케이크',
        price: Number(item.totalPrice ?? item.price ?? 0),
        requestedDate: item.requestedDate || (item.pickupDate && String(item.pickupDate).split('T')[0]) || '',
        pickupTime: item.pickupTime || (item.pickupDate && String(item.pickupDate).split('T')[1]?.slice(0, 5)) || '',
        ...item,
      }))
      setOrders(mapped)
    } catch (error) {
      console.warn('실서버 주문 내역 조회 실패:', error.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 4000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => {
    if (filter === 'PENDING') return o.status === 'PENDING' || o.status === 'PENDING_QUOTE'
    if (filter === 'QUOTED') return o.status === 'QUOTED' || o.status === 'APPROVED' || o.status === 'ACCEPTED'
    if (filter === 'PAID') return o.status === 'PAID'
    if (filter === 'IN_PROGRESS') return o.status === 'IN_PROGRESS'
    if (filter === 'PICKUP_READY') return o.status === 'PICKUP_READY'
    if (filter === 'COMPLETED') return o.status === 'COMPLETED'
    return o.status === filter
  })
  const sorted = [...filtered].sort((a, b) => (Number(b.id || 0) - Number(a.id || 0)))

  return (
    <div>
      <PageHeader
        title="주문 관리"
        subtitle={loading ? '실시간 조회 중...' : `총 ${orders.length}건`}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cake-pink-50 text-cake-pink-600 transition-all hover:bg-cake-pink-100 active:scale-95"
              aria-label="새로고침"
            >
              <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => navigate('/orders/schema')}
              className="rounded-full bg-cake-pink-50 px-3 py-1.5 text-xs font-semibold text-cake-pink-600 active:bg-cake-pink-100"
            >
              양식 설정
            </button>
          </div>
        }
      />

      <div
        className="flex gap-2 overflow-x-auto px-5 pb-1 select-none whitespace-nowrap"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.key ? 'bg-cake-pink-500 text-white shadow-sm' : 'bg-white text-cake-ink-soft ring-1 ring-cake-pink-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 px-5">
        {loading && (
          <div className="py-16 text-center">
            <Spinner label="주문 내역을 불러오고 있어요..." />
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <EmptyState
            icon="🍰"
            title={filter === 'ALL' ? '접수된 주문이 없어요' : '해당 조건의 주문이 없어요'}
            description={
              filter === 'ALL'
                ? '소비자 앱에서 고객이 주문서를 작성하면 여기에 실시간으로 표시됩니다.'
                : '다른 주문 상태 탭을 선택해 보세요.'
            }
          />
        )}

        {!loading && sorted.map((order) => (
          <Card
            key={order.id}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex cursor-pointer items-center justify-between active:scale-[0.98]"
          >
            <div>
              <p className="text-xs text-cake-ink-soft">
                {order.requestedDate ? `${order.requestedDate} · ` : ''}{order.pickupTime}
              </p>
              <p className="mt-0.5 font-semibold text-cake-ink">{order.customerName} · {order.cakeType}</p>
              <p className="mt-0.5 text-xs font-medium text-cake-pink-500">{(Number(order.price) || 0).toLocaleString()}원</p>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={order.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}