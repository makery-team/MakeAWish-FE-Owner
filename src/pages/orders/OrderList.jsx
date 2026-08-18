import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatCircleDots } from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import { useChatStore } from '../../store/useChatStore'
import { fetchOrders } from '../../api/orderApi'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

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
  const { orders: mockOrders } = useOrderStore()
  const { hasThread } = useChatStore()
  const [filter, setFilter] = useState('ALL')
  const [orders, setOrders] = useState(mockOrders)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setOrders(mockOrders)
  }, [mockOrders])

  useEffect(() => {
    let isMounted = true
    async function loadOrders() {
      try {
        setLoading(true)
        const data = await fetchOrders()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id || item.orderId,
            status: item.orderStatus || item.status || 'PENDING',
            customerName: item.customerName || item.userName || '주문 고객',
            cakeType: item.cakeType || item.designName || '주문제작 케이크',
            price: Number(item.totalPrice ?? item.price ?? 0),
            requestedDate: item.requestedDate || (item.pickupDate && String(item.pickupDate).split('T')[0]) || '2026-07-30',
            pickupTime: item.pickupTime || (item.pickupDate && String(item.pickupDate).split('T')[1]?.slice(0, 5)) || '14:00',
            ...item,
          }))
          setOrders(mapped)
        }
      } catch (error) {
        console.warn('실서버 주문 내역 조회 실패 (로컬 Mock 데이터 사용):', error.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadOrders()
    return () => {
      isMounted = false
    }
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
  const sorted = [...filtered].sort((a, b) => (a.requestedDate < b.requestedDate ? 1 : -1))

  return (
    <div>
      <PageHeader
        title="주문 관리"
        subtitle={loading ? '실시간 조회 중...' : `총 ${orders.length}건`}
        right={
          <button
            onClick={() => navigate('/orders/schema')}
            className="rounded-full bg-cake-pink-50 px-3 py-1.5 text-xs font-semibold text-cake-pink-600 active:bg-cake-pink-100"
          >
            양식 설정
          </button>
        }
      />

      <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.key ? 'bg-cake-pink-500 text-white' : 'bg-white text-cake-ink-soft ring-1 ring-cake-pink-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 px-5">
        {sorted.length === 0 && !loading && <EmptyState icon="🔍" title="해당 조건의 주문이 없어요" />}
        {sorted.map((order) => (
          <Card
            key={order.id}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex cursor-pointer items-center justify-between active:scale-[0.98]"
          >
            <div>
              <p className="text-xs text-cake-ink-soft">{order.requestedDate} · {order.pickupTime}</p>
              <p className="mt-0.5 font-semibold text-cake-ink">{order.customerName} · {order.cakeType}</p>
              <p className="mt-0.5 text-xs font-medium text-cake-pink-500">{(Number(order.price) || 0).toLocaleString()}원</p>
            </div>
            <div className="flex items-center gap-1.5">
              {hasThread(order.id) && (
                <span className="flex items-center gap-1 rounded-full bg-cake-pink-50 px-2 py-1 text-[10px] font-semibold text-cake-pink-500">
                  <ChatCircleDots size={12} weight="fill" /> 채팅 중
                </span>
              )}
              <StatusBadge status={order.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}