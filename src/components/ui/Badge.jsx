const STATUS_STYLE = {
  PENDING_QUOTE: { label: '견적 대기', className: 'bg-cake-yellow-100 text-cake-yellow-600' },
  PENDING: { label: '견적 대기', className: 'bg-cake-yellow-100 text-cake-yellow-600' },
  QUOTED: { label: '입금 대기', className: 'bg-blue-50 text-blue-600 border border-blue-100' },
  APPROVED: { label: '입금 대기', className: 'bg-blue-50 text-blue-600 border border-blue-100' },
  ACCEPTED: { label: '입금 대기', className: 'bg-blue-50 text-blue-600 border border-blue-100' },
  PAID: { label: '결제 완료', className: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  IN_PROGRESS: { label: '제작 중', className: 'bg-cake-pink-100 text-cake-pink-600' },
  PICKUP_READY: { label: '픽업 대기', className: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
  COMPLETED: { label: '픽업 완료', className: 'bg-cake-mint-100 text-cake-mint-600' },
  REJECTED: { label: '주문 거절', className: 'bg-gray-100 text-gray-500' },
  CANCELED: { label: '주문 취소', className: 'bg-gray-100 text-gray-500' },
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${s.className}`}>
      {s.label}
    </span>
  )
}

export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-cake-pink-50 px-2.5 py-1 text-xs font-medium text-cake-pink-600 ${className}`}>
      {children}
    </span>
  )
}