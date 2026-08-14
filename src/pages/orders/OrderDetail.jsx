import { useState, useEffect, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChatCircleDots,
  CreditCard,
  Sparkle,
  Plus,
  Phone,
} from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import { useChatStore } from '../../store/useChatStore'
import { fetchOrderById, fetchExtraFee } from '../../api/orderApi'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

const FIELD_LABEL = { size: '사이즈', pickupDate: '픽업일', lettering: '레터링 문구', request: '요청사항' }

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const {
    getOrderById,
    getExtraChargesByOrder,
    getPaymentByOrder,
    updateOrderStatus,
    createExtraCharge,
    syncExtraChargeFromServer,
    createPayment,
    createMessageDraft,
    messageDrafts,
  } = useOrderStore()
  const { hasThread } = useChatStore()

  const mockOrder = getOrderById(orderId)
  const extraCharges = getExtraChargesByOrder(orderId)
  const payment = getPaymentByOrder(orderId)
  const draft = messageDrafts[orderId]

  const [serverOrder, setServerOrder] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function loadDetail() {
      try {
        const data = await fetchOrderById(orderId)
        if (isMounted && data) {
          const mapped = {
            id: data.id || data.orderId || orderId,
            status: data.orderStatus || data.status || 'PENDING',
            customerName: data.customerName || data.userName || (data.orderData && (data.orderData.customerName || data.orderData.name)) || '주문 고객',
            customerPhone: data.customerPhone || data.phoneNumber || (data.orderData && (data.orderData.customerPhone || data.orderData.phone)) || '010-0000-0000',
            cakeType: data.cakeType || data.designName || (Array.isArray(data.items) && data.items[0]?.productName) || '주문제작 케이크',
            price: Number(data.totalPrice ?? data.price ?? 0),
            requestedDate: data.requestedDate || (data.pickupDate && String(data.pickupDate).split('T')[0]) || '2026-07-30',
            pickupTime: data.pickupTime || (data.pickupDate && String(data.pickupDate).split('T')[1]?.slice(0, 5)) || '14:00',
            schemaAnswers: data.schemaAnswers || data.customAnswers || data.orderData || {},
            ...data,
          }
          setServerOrder(mapped)
        }
        try {
          const feeData = await fetchExtraFee(orderId)
          if (isMounted && feeData && Number(feeData.extraFee) > 0) {
            syncExtraChargeFromServer(orderId, { extraFee: feeData.extraFee, reason: feeData.reason })
          }
        } catch (feeError) {
          console.warn('실서버 추가금 조회 실패 (로컬 Mock 사용):', feeError.message)
        }
      } catch (error) {
        console.warn('실서버 주문 상세 내역 조회 실패 (로컬 Mock 사용):', error.message)
      }
    }
    loadDetail()
    return () => {
      isMounted = false
    }
  }, [orderId])

  const order = serverOrder || mockOrder

  const [statusLoading, setStatusLoading] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showExtraForm, setShowExtraForm] = useState(false)
  const [extraReason, setExtraReason] = useState('')
  const [extraAmount, setExtraAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [draftLoading, setDraftLoading] = useState(false)

  if (!order) {
    return (
      <div className="p-5">
        <PageHeader title="주문을 찾을 수 없어요" back />
      </div>
    )
  }

  const changeStatus = async (status, reason) => {
    setStatusLoading(true)
    try {
      await updateOrderStatus(orderId, status, reason)
      if (serverOrder) {
        setServerOrder((prev) => ({ ...prev, status }))
      }
    } catch (error) {
      console.error('주문 상태 변경 실패:', error.message)
      alert('주문 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setStatusLoading(false)
      setRejecting(false)
    }
  }

  const totalPrice = (Number(order.price) || 0) + extraCharges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

  return (
    <div className="pb-6">
      <PageHeader title={order.customerName} subtitle={order.cakeType} back />

      <div className="flex flex-col gap-4 px-5">
        <Card>
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 text-xs font-semibold text-cake-ink-soft">
              <Phone size={14} /> {order.customerPhone}
            </a>
          </div>

          {order.status === 'REJECTED' && order.rejectReason && (
            <p className="mt-2 rounded-xl bg-gray-50 p-2 text-xs text-gray-500">거절 사유: {order.rejectReason}</p>
          )}

          <dl className="mt-3 grid grid-cols-3 gap-y-2 text-sm">
            {order.schemaAnswers && Object.entries(order.schemaAnswers).map(([key, val]) => {
              if (['refImage', 'customizedImageUrl', 'customized_image_url', 'cakeImage', 'selectedCakeImage'].includes(key)) return null; // 이미지는 아래에서 별도 렌더링
              
              // FIELD_LABEL에 있는 정적 키(size 등)는 그 라벨을 사용하고, 
              // 동적 커스텀 키('케이크 사이즈', '맛' 등)는 key 자체를 렌더링
              const label = FIELD_LABEL[key] || key;
              
              return (
                <Fragment key={key}>
                  <dt className="text-cake-ink-soft">{label}</dt>
                  <dd className="col-span-2 text-cake-ink">{String(val)}</dd>
                </Fragment>
              );
            })}
            <dt className="text-cake-ink-soft">픽업 일시</dt>
            <dd className="col-span-2 text-cake-ink">{order.requestedDate} {order.pickupTime}</dd>
          </dl>

          {order.schemaAnswers?.refImage && (
            <div className="mt-3">
              <span className="text-xs text-cake-ink-soft">참고 이미지</span>
              <img src={order.schemaAnswers.refImage} alt="참고 이미지" className="mt-1 h-32 w-32 rounded-2xl object-cover" />
            </div>
          )}

          {(order.schemaAnswers?.customizedImageUrl || order.schemaAnswers?.customized_image_url || order.schemaAnswers?.cakeImage || order.schemaAnswers?.selectedCakeImage) && (
            <div className="mt-3">
              <span className="text-xs text-cake-ink-soft">요청 이미지 (AI 스케치)</span>
              <img src={order.schemaAnswers.customizedImageUrl || order.schemaAnswers.customized_image_url || order.schemaAnswers.cakeImage || order.schemaAnswers.selectedCakeImage} alt="요청 이미지" className="mt-1 h-32 w-32 rounded-2xl object-cover" />
            </div>
          )}

          {!rejecting && order.status === 'PENDING' && (
            <div className="mt-4 flex gap-2">
              <Button variant="danger" className="flex-1" onClick={() => setRejecting(true)}>거절</Button>
              <Button className="flex-1" loading={statusLoading} onClick={() => changeStatus('ACCEPTED')}>수락하기</Button>
            </div>
          )}
          {rejecting && (
            <div className="mt-4 flex flex-col gap-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거절 사유를 입력해주세요"
                className="w-full rounded-2xl border border-cake-pink-200 p-3 text-sm outline-none focus:border-cake-pink-400"
                rows={2}
              />
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setRejecting(false)}>취소</Button>
                <Button variant="danger" className="flex-1" loading={statusLoading} onClick={() => changeStatus('REJECTED', rejectReason)}>
                  거절 확정
                </Button>
              </div>
            </div>
          )}
          {order.status === 'ACCEPTED' && (
            <Button className="mt-4 w-full" loading={statusLoading} onClick={() => changeStatus('IN_PROGRESS')}>
              제작 시작하기
            </Button>
          )}
          {order.status === 'IN_PROGRESS' && (
            <Button variant="mint" className="mt-4 w-full" loading={statusLoading} onClick={() => changeStatus('COMPLETED')}>
              제작 완료 처리
            </Button>
          )}
        </Card>

        <button
          onClick={() => navigate(`/orders/${orderId}/chat`)}
          className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-cake-sm ring-1 ring-cake-pink-100 active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-cake-ink">
            <ChatCircleDots size={20} className="text-cake-pink-500" /> 고객과 채팅하기
            {hasThread(orderId) && (
              <span className="flex items-center gap-1 rounded-full bg-cake-pink-50 px-2 py-0.5 text-[10px] font-semibold text-cake-pink-500">
                채팅 중
              </span>
            )}
          </span>
          <span className="text-xs text-cake-ink-soft">이동 →</span>
        </button>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-cake-ink">추가금</p>
            <button onClick={() => setShowExtraForm((v) => !v)} className="flex items-center gap-1 text-xs font-semibold text-cake-pink-500">
              <Plus size={14} /> 추가
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {extraCharges.length === 0 && <p className="text-xs text-cake-ink-soft">등록된 추가금이 없어요</p>}
            {extraCharges.map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span className="text-cake-ink-soft">{c.reason}</span>
                <span className="font-medium text-cake-ink">+{c.amount.toLocaleString()}원</span>
              </div>
            ))}
          </div>
          {showExtraForm && (
            <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-cake-pink-50 p-3">
              <input
                value={extraReason}
                onChange={(e) => setExtraReason(e.target.value)}
                placeholder="사유 (예: 토핑 추가)"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <input
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                type="number"
                placeholder="금액"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <Button
                className="w-full"
                disabled={!extraReason || !extraAmount}
                onClick={async () => {
                  try {
                    await createExtraCharge(orderId, { reason: extraReason, amount: extraAmount })
                    setExtraReason('')
                    setExtraAmount('')
                    setShowExtraForm(false)
                  } catch (error) {
                    console.error('추가금 등록 실패:', error.message)
                    alert('추가금 등록 중 오류가 발생했습니다.')
                  }
                }}
              >
                추가금 등록
              </Button>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-cake-pink-100 pt-2 text-sm font-bold text-cake-ink">
            <span>총 금액</span>
            <span>{totalPrice.toLocaleString()}원</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><CreditCard size={18} className="text-cake-pink-500" /> 결제</p>
            {payment ? (
              <span className="text-xs font-bold text-cake-mint-600">결제 완료</span>
            ) : (
              <span className="text-xs font-bold text-cake-yellow-600">미결제</span>
            )}
          </div>
          {payment ? (
            <p className="mt-1 text-xs text-cake-ink-soft">{payment.paidAt} · {payment.amount.toLocaleString()}원 · {payment.method === 'CARD' ? '카드' : '계좌이체'}</p>
          ) : (
            <Button
              className="mt-3 w-full"
              variant="secondary"
              loading={paying}
              onClick={async () => {
                setPaying(true)
                await createPayment(orderId, { amount: totalPrice, method: 'CARD' })
                setPaying(false)
              }}
            >
              결제 처리하기
            </Button>
          )}
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Sparkle size={18} className="text-cake-pink-500" /> AI 메시지 초안</p>
          {draftLoading && <Spinner label="AI가 메시지를 작성하고 있어요…" />}
          {!draftLoading && draft && <p className="mt-2 rounded-2xl bg-cake-pink-50 p-3 text-sm leading-relaxed text-cake-ink">{draft}</p>}
          {!draftLoading && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setDraftLoading(true)
                await createMessageDraft(orderId)
                setDraftLoading(false)
              }}
            >
              {draft ? '다시 생성하기' : 'AI 메시지 초안 생성'}
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}