import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomDelay, genId, todayIso } from '../lib/time'
import {
  ORDER_SCHEMA_FIELDS,
  TODAY_BRIEFING,
} from '../mocks/seed'
import {
  updateOrderStatus as apiUpdateOrderStatus,
  registerExtraFee as apiRegisterExtraFee,
  isMockOrderId,
  fetchOrders,
} from '../api/orderApi'
import { updateOrderSchema as apiUpdateOrderSchema } from '../api/storeApi'
import { useShopStore } from './useShopStore'

// 레거시 mock 캐시 정리
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('cake-orders')
  }
} catch (e) {
  // ignore
}

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      extraCharges: [],
      payments: [],
      messageDrafts: {}, // orderId -> string
      schemaFields: ORDER_SCHEMA_FIELDS,

      todayOrders: [],
      getTodayBriefing: () => {
        const orders = get().todayOrders || []
        const pendingCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PENDING_QUOTE').length
        const inProgressCount = orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'PAID' || o.status === 'ACCEPTED' || o.status === 'QUOTED' || o.status === 'PICKUP_READY').length
        const expectedRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || o.price || 0), 0)
        return {
          summary: orders.length === 0 
            ? '오늘은 아직 들어온 주문이 없어요.' 
            : `오늘은 주문 ${orders.length}건이 접수되어 있어요. ${pendingCount > 0 ? `그 중 ${pendingCount}건은 아직 수락 대기중이니 먼저 확인해주세요!` : '모두 확인 완료했어요!'}`,
          pendingCount,
          inProgressCount,
          expectedRevenue,
        }
      },
      getOrderById: (orderId) => get().orders.find((o) => String(o.id) === String(orderId)),
      getExtraChargesByOrder: (orderId) => get().extraCharges.filter((c) => String(c.orderId) === String(orderId)),
      getPaymentByOrder: (orderId) => get().payments.find((p) => String(p.orderId) === String(orderId)),
      resetOrders: () => set({ orders: [], todayOrders: [] }),

      fetchTodayOrders: async () => {
        try {
          const res = await fetchOrders({ date: 'today' })
          set({ todayOrders: Array.isArray(res) ? res : (res?.data || []) })
        } catch (error) {
          console.error('[useOrderStore] 오늘의 주문 조회 실패:', error.message)
        }
      },

      updateOrderStatus: async (orderId, status, reason) => {
        if (!isMockOrderId(orderId)) {
          try {
            await apiUpdateOrderStatus(orderId, status, reason)
          } catch (error) {
            console.error('[useOrderStore] 실서버 주문 상태 변경 실패:', error.message)
            throw error
          }
        } else {
          await randomDelay()
        }
        set((state) => ({
          orders: state.orders.map((o) =>
            String(o.id) === String(orderId) ? { ...o, status, ...(reason ? { rejectReason: reason } : {}) } : o,
          ),
        }))
      },

      createExtraCharge: async (orderId, { reason, amount }) => {
        if (!isMockOrderId(orderId)) {
          try {
            await apiRegisterExtraFee(orderId, { amount, reason })
          } catch (error) {
            console.error('[useOrderStore] 실서버 추가금 책정/등록 실패:', error.message)
            throw error
          }
        } else {
          await randomDelay()
        }
        const charge = { id: genId('extra'), orderId, reason, amount: Number(amount), createdAt: todayIso() }
        set((state) => ({
          extraCharges: [...state.extraCharges.filter((c) => String(c.orderId) !== String(orderId)), charge],
        }))
        return charge
      },

      deleteExtraCharge: async (orderId) => {
        if (!isMockOrderId(orderId)) {
          try {
            await apiRegisterExtraFee(orderId, { amount: 0, reason: '' })
          } catch (error) {
            console.error('[useOrderStore] 실서버 추가금 삭제 실패:', error.message)
            throw error
          }
        } else {
          await randomDelay()
        }
        set((state) => ({
          extraCharges: state.extraCharges.filter((c) => String(c.orderId) !== String(orderId)),
        }))
      },

      syncExtraChargeFromServer: (orderId, { extraFee, reason }) => {
        if (!extraFee || Number(extraFee) <= 0) {
          set((state) => ({
            extraCharges: state.extraCharges.filter((c) => String(c.orderId) !== String(orderId)),
          }))
          return
        }
        const existing = get().extraCharges.find((c) => String(c.orderId) === String(orderId))
        if (existing) {
          set((state) => ({
            extraCharges: state.extraCharges.map((c) =>
              String(c.orderId) === String(orderId) ? { ...c, amount: Number(extraFee), reason: reason || c.reason } : c,
            ),
          }))
        } else {
          const charge = {
            id: genId('extra'),
            orderId,
            reason: reason || '추가 금액',
            amount: Number(extraFee),
            createdAt: todayIso(),
          }
          set((state) => ({ extraCharges: [...state.extraCharges, charge] }))
        }
      },

      createPayment: async (orderId, { amount, method }) => {
        await randomDelay(500, 1000)
        const payment = { orderId, amount: Number(amount), method, status: 'PAID', paidAt: todayIso() }
        set((state) => ({ payments: [...state.payments.filter((p) => p.orderId !== orderId), payment] }))
        return payment
      },

      createMessageDraft: async (orderId) => {
        await randomDelay(800, 1400)
        const order = get().getOrderById(orderId)
        const draft = `안녕하세요 ${order?.customerName}님! 😊 주문해주신 ${order?.cakeType} 정성껏 준비하고 있어요. 픽업 예정 시간은 ${order?.pickupTime}이며, 궁금하신 점 있으시면 편하게 말씀해주세요. 감사합니다!`
        set((state) => ({ messageDrafts: { ...state.messageDrafts, [orderId]: draft } }))
        return draft
      },

      updateSchemaFields: async (productId, fields) => {
        // 1. 상태 업데이트
        set({ schemaFields: fields })

        // 2. 백엔드가 요구하는 JSON Schema 형태로 변환
        const properties = {}
        fields.forEach((f) => {
          properties[f.id] = { type: 'string', label: f.label }
        })
        const orderSchema = { type: 'object', properties }

        // 3. storeId를 가져와 API 호출
        try {
          const storeId = useShopStore.getState().profile?.id
          if (!storeId) {
            console.warn('storeId가 없어 스키마 저장을 생략합니다.')
            return
          }
          await apiUpdateOrderSchema(storeId, { productId, orderSchema })
        } catch (error) {
          console.error('주문서 양식 저장 실패:', error)
          // 실패 시 알림 띄우기 등의 처리 필요
        }
      },
    }),
    {
      name: 'cake-orders-v3',
      version: 3,
    },
  ),
)