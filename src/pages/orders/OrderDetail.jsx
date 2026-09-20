import { useState, useEffect, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChatCircleDots,
  CreditCard,
  Plus,
  Phone,
  Trash,
  MagnifyingGlassPlus,
  DownloadSimple,
} from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import { useChatStore } from '../../store/useChatStore'
import { fetchOrderById, fetchExtraFee } from '../../api/orderApi'
import { fetchChatRooms, createChatRoom } from '../../api/chatApi'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import ImageModal from '../../components/ui/ImageModal'

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
    deleteExtraCharge,
    syncExtraChargeFromServer,
    createPayment,
  } = useOrderStore()
  const { hasThread } = useChatStore()

  const mockOrder = getOrderById(orderId)
  const extraCharges = getExtraChargesByOrder(orderId)
  const payment = getPaymentByOrder(orderId)

  const [serverOrder, setServerOrder] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function loadDetail() {
      try {
        const data = await fetchOrderById(orderId)
        if (isMounted && data) {
          const rawTotal = Number(data.totalPrice ?? data.price ?? 0)
          const rawExtra = Number(data.extraFee || 0)
          const basePrice = Math.max(0, rawTotal - rawExtra)

          const mapped = {
            id: data.id || data.orderId || orderId,
            status: data.orderStatus || data.status || 'PENDING',
            customerId: data.customerId || data.userId || (data.user && data.user.id),
            customerName: data.customerName || data.userName || (data.user && (data.user.name || data.user.nickname)) || (data.orderData && (data.orderData.customerName || data.orderData.name)) || '주문 고객',
            customerPhone: data.customerPhone || data.phoneNumber || (data.user && data.user.phoneNumber) || (data.orderData && (data.orderData.customerPhone || data.orderData.phone)) || '010-0000-0000',
            cakeType: data.cakeType || data.designName || (Array.isArray(data.items) && data.items[0]?.name) || (Array.isArray(data.items) && data.items[0]?.productName) || '주문제작 케이크',
            basePrice,
            price: basePrice,
            totalPrice: rawTotal,
            extraFee: rawExtra,
            requestedDate: data.requestedDate || (data.pickupDate && String(data.pickupDate).split('T')[0]) || '2026-07-30',
            pickupTime: data.pickupTime || (data.pickupDate && String(data.pickupDate).split('T')[1]?.slice(0, 5)) || '14:00',
            schemaAnswers: data.schemaAnswers || data.customAnswers || data.orderData || {},
            rejectReason: data.rejectReason || (data.orderData && data.orderData.rejectReason) || '',
            ...data,
          }
          setServerOrder(mapped)
        }
        try {
          const feeData = await fetchExtraFee(orderId)
          if (isMounted) {
            syncExtraChargeFromServer(orderId, {
              extraFee: (feeData && feeData.extraFee) || 0,
              reason: (feeData && feeData.reason) || '',
            })
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
  const [modalImage, setModalImage] = useState({ isOpen: false, url: '', title: '' })

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
        setServerOrder((prev) => ({ ...prev, status, ...(reason ? { rejectReason: reason } : {}) }))
      }
    } catch (error) {
      console.error('주문 상태 변경 실패:', error.message)
      alert('주문 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setStatusLoading(false)
      setRejecting(false)
    }
  }

  const isPaid = ['PAID', 'IN_PROGRESS', 'PICKUP_READY', 'COMPLETED'].includes(order.status)
  const extraTotal = extraCharges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const basePrice = order.basePrice != null ? Number(order.basePrice) : Math.max(0, Number(order.price || order.totalPrice || 0) - extraTotal)
  const totalPrice = basePrice + extraTotal

  const IGNORED_SCHEMA_KEYS = [
    'storeId',
    'productId',
    'portfolioId',
    'shopName',
    'tags',
    'refImage',
    'cakeImage',
    'selectedCakeImage',
    'photoUrl',
    'customizedImageUrl',
    'customized_image_url',
    'design',
  ]

  const getDisplayPickupTime = () => {
    const schema = order.schemaAnswers || {}
    for (const [k, v] of Object.entries(schema)) {
      if ((k.includes('픽업') || k.toLowerCase().includes('pickup')) && typeof v === 'string' && v.trim()) {
        const val = v.trim()
        const match = val.match(/(\d{4})[./-](\d{2})[./-](\d{2})[ T](\d{2}:\d{2})/)
        if (match) {
          return `${match[1]}-${match[2]}-${match[3]} ${match[4]}`
        }
        return val
      }
    }
    if (order.pickupDate) {
      return String(order.pickupDate).replace('T', ' ').slice(0, 16)
    }
    if (order.requestedDate && order.pickupTime) {
      return `${order.requestedDate} ${order.pickupTime}`
    }
    return '미정'
  }

  const schemaEntries = Object.entries(order.schemaAnswers || {}).filter(([k]) => {
    if (IGNORED_SCHEMA_KEYS.includes(k)) return false
    const lower = k.toLowerCase()
    if (k.includes('픽업') || lower.includes('pickup')) return false
    return true
  })

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

          {(order.status === 'REJECTED' || order.status === 'CANCELED') && order.rejectReason && (
            <p className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-600 font-medium">거절/취소 사유: {order.rejectReason}</p>
          )}

          {schemaEntries.length > 0 || getDisplayPickupTime() !== '미정' ? (
            <div className="mt-3 divide-y divide-cake-pink-100/60 rounded-2xl bg-cake-pink-50/40 p-3.5 text-sm">
              {schemaEntries.map(([key, val]) => {
                const label = FIELD_LABEL[key] || key
                return (
                  <div key={key} className="flex items-start justify-between py-2 first:pt-0 gap-3">
                    <span className="shrink-0 text-xs font-medium text-cake-ink-soft">{label}</span>
                    <span className="text-right text-sm font-semibold text-cake-ink break-words">{String(val)}</span>
                  </div>
                )
              })}
              <div className="flex items-center justify-between py-2 last:pb-0 gap-3">
                <span className="shrink-0 text-xs font-medium text-cake-ink-soft">픽업 희망 일시</span>
                <span className="text-right text-sm font-bold text-cake-pink-600">{getDisplayPickupTime()}</span>
              </div>
            </div>
          ) : null}

          {order.schemaAnswers?.refImage && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-cake-ink-soft">참고 이미지</span>
              <div 
                onClick={() => setModalImage({ isOpen: true, url: order.schemaAnswers.refImage, title: '고객 참고 이미지' })}
                className="group relative mt-1.5 h-36 w-36 overflow-hidden rounded-2xl border border-cake-pink-100 shadow-sm cursor-pointer transition hover:shadow-md active:scale-95"
              >
                <img 
                  src={order.schemaAnswers.refImage} 
                  alt="참고 이미지" 
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-cake-ink shadow">
                    <MagnifyingGlassPlus size={14} weight="bold" /> 크게 보기
                  </span>
                </div>
              </div>
            </div>
          )}

          {(order.schemaAnswers?.customizedImageUrl || order.schemaAnswers?.customized_image_url || order.schemaAnswers?.cakeImage || order.schemaAnswers?.selectedCakeImage) && (() => {
            const requestedImg = order.schemaAnswers.customizedImageUrl || order.schemaAnswers.customized_image_url || order.schemaAnswers.cakeImage || order.schemaAnswers.selectedCakeImage
            return (
              <div className="mt-3">
                <span className="text-xs font-semibold text-cake-pink-600">요청 이미지 (AI 스케치 시안)</span>
                <div 
                  onClick={() => setModalImage({ isOpen: true, url: requestedImg, title: '고객 요청 AI 시안' })}
                  className="group relative mt-1.5 h-44 w-44 overflow-hidden rounded-2xl border-2 border-cake-pink-200 shadow-sm cursor-pointer transition hover:border-cake-pink-400 hover:shadow-md active:scale-95"
                >
                  <img 
                    src={requestedImg} 
                    alt="요청 이미지" 
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-cake-pink-600 shadow-md">
                      <MagnifyingGlassPlus size={15} weight="bold" /> 시안 확대 / 다운로드
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {!rejecting && (order.status === 'PENDING' || order.status === 'PENDING_QUOTE') && (
            <div className="mt-4 flex gap-2">
              <Button variant="danger" className="flex-1" onClick={() => setRejecting(true)}>거절</Button>
              <Button className="flex-1" loading={statusLoading} onClick={() => changeStatus('QUOTED')}>수락하기</Button>
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
          {(order.status === 'ACCEPTED' || order.status === 'QUOTED' || order.status === 'APPROVED') && (
            <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-center text-xs font-semibold text-blue-700">
              💳 고객의 결제를 기다리고 있습니다 (입금 대기)
            </div>
          )}
          {order.status === 'PAID' && (
            <Button className="mt-4 w-full" loading={statusLoading} onClick={() => changeStatus('IN_PROGRESS')}>
              🍰 제작 시작하기
            </Button>
          )}
          {order.status === 'IN_PROGRESS' && (
            <Button variant="mint" className="mt-4 w-full" loading={statusLoading} onClick={() => changeStatus('PICKUP_READY')}>
              📦 픽업 준비 완료
            </Button>
          )}
          {order.status === 'PICKUP_READY' && (
            <Button variant="mint" className="mt-4 w-full" loading={statusLoading} onClick={() => changeStatus('COMPLETED')}>
              ✨ 픽업 완료 및 주문 마감
            </Button>
          )}
          {order.status === 'COMPLETED' && (
            <div className="mt-4 rounded-2xl bg-cake-mint-50 p-3 text-center text-xs font-bold text-cake-mint-700">
              🎉 픽업 및 주문이 완료되었습니다
            </div>
          )}
        </Card>

        <button
          onClick={async () => {
            try {
              let targetRoomNumber = null
              let targetOtherId = order.customerId
              let targetCustomerName = order.customerName || '고객님'

              // 1. 고객 ID가 있는 경우, createChatRoom API로 즉시 방 개설 또는 기존 방 조회
              if (order.customerId) {
                try {
                  const roomRes = await createChatRoom({ userId: order.customerId })
                  if (roomRes && roomRes.roomNumber) {
                    targetRoomNumber = roomRes.roomNumber
                    targetOtherId = roomRes.otherId || order.customerId
                    targetCustomerName = roomRes.otherName || order.customerName
                  }
                } catch (roomErr) {
                  console.warn('createChatRoom 호출 실패 (fallback 탐색):', roomErr)
                }
              }

              // 2. 만약 위에서 못 찾았거나 fallback인 경우 전체 방 목록에서 이름/ID 검색
              if (!targetRoomNumber) {
                const rooms = await fetchChatRooms()
                const matched = Array.isArray(rooms)
                  ? rooms.find((r) => {
                      const matchId = order.customerId && String(r.otherId) === String(order.customerId)
                      const matchName = order.customerName && order.customerName !== '주문 고객' && r.otherName === order.customerName
                      return matchId || matchName
                    })
                  : null

                if (matched) {
                  targetRoomNumber = matched.roomNumber
                  targetOtherId = matched.otherId
                  targetCustomerName = matched.otherName || order.customerName
                }
              }

              // 3. 채팅방으로 이동
              if (targetRoomNumber) {
                navigate(`/chat/${targetRoomNumber}`, {
                  state: { customerName: targetCustomerName, otherId: targetOtherId },
                })
              } else {
                alert('고객과의 채팅방을 연결하지 못했습니다. 잠시 후 다시 시도해주세요.')
              }
            } catch (err) {
              console.error('채팅방 이동 실패:', err)
              navigate('/chat')
            }
          }}
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
            {isPaid ? (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                결제 완료 (수정 불가)
              </span>
            ) : (
              <button onClick={() => setShowExtraForm((v) => !v)} className="flex items-center gap-1 text-xs font-semibold text-cake-pink-500">
                <Plus size={14} /> 추가
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {extraCharges.length === 0 && <p className="text-xs text-cake-ink-soft">등록된 추가금이 없어요</p>}
            {extraCharges.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-cake-ink-soft">{c.reason}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-cake-ink">+{Number(c.amount).toLocaleString()}원</span>
                  {!isPaid && (
                    <button
                      onClick={async () => {
                        if (window.confirm('등록된 추가금을 삭제하시겠습니까?')) {
                          try {
                            await deleteExtraCharge(orderId)
                            if (serverOrder) {
                              setServerOrder((prev) => ({
                                ...prev,
                                extraFee: 0,
                                totalPrice: prev.basePrice ?? Number(prev.price || 0),
                              }))
                            }
                          } catch (error) {
                            console.error('추가금 삭제 실패:', error.message)
                            alert('추가금 삭제 중 오류가 발생했습니다.')
                          }
                        }
                      }}
                      className="rounded-lg p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      title="추가금 삭제"
                    >
                      <Trash size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {showExtraForm && !isPaid && (
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
                min={0}
                step={1000}
                placeholder="금액"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <Button
                className="w-full"
                disabled={!extraReason || !extraAmount}
                onClick={async () => {
                  try {
                    await createExtraCharge(orderId, { reason: extraReason, amount: extraAmount })
                    if (serverOrder) {
                      setServerOrder((prev) => {
                        const base = prev.basePrice ?? Number(prev.price || 0)
                        return {
                          ...prev,
                          extraFee: Number(extraAmount),
                          totalPrice: base + Number(extraAmount),
                        }
                      })
                    }
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
          <div className="mt-3 flex flex-col gap-1.5 border-t border-dashed border-cake-pink-100 pt-2 text-sm">
            <div className="flex items-center justify-between text-xs text-cake-ink-soft">
              <span>기본 케이크 금액</span>
              <span>{basePrice.toLocaleString()}원</span>
            </div>
            {extraTotal > 0 && (
              <div className="flex items-center justify-between text-xs text-cake-pink-500 font-medium">
                <span>추가금 합계</span>
                <span>+{extraTotal.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold text-cake-ink pt-1 border-t border-cake-pink-50">
              <span>총 금액</span>
              <span className="text-base text-cake-pink-600">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><CreditCard size={18} className="text-cake-pink-500" /> 결제 정보</p>
            {['PAID', 'IN_PROGRESS', 'PICKUP_READY', 'COMPLETED'].includes(order.status) ? (
              <span className="text-xs font-bold text-cake-mint-600 bg-cake-mint-50 px-2 py-0.5 rounded-full">결제 완료</span>
            ) : (
              <span className="text-xs font-bold text-cake-yellow-600 bg-cake-yellow-50 px-2 py-0.5 rounded-full">미결제 (입금 대기)</span>
            )}
          </div>
          {['PAID', 'IN_PROGRESS', 'PICKUP_READY', 'COMPLETED'].includes(order.status) ? (
            <div className="mt-2 text-xs text-cake-ink-soft bg-cake-pink-50/50 p-2.5 rounded-xl flex justify-between items-center">
              <span>결제 금액: <b className="text-cake-ink">{totalPrice.toLocaleString()}원</b></span>
              <span className="text-[11px] text-cake-mint-600 font-semibold">토스 결제 승인됨</span>
            </div>
          ) : (
            <p className="mt-2 text-xs text-cake-ink-soft">
              고객이 주문을 확인한 후 소비자 앱에서 토스페이먼츠로 결제를 진행합니다.
            </p>
          )}
        </Card>
      </div>

      <ImageModal
        isOpen={modalImage.isOpen}
        imageUrl={modalImage.url}
        title={modalImage.title}
        onClose={() => setModalImage({ isOpen: false, url: '', title: '' })}
      />
    </div>
  )
}