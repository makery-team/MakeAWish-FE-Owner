import { create } from 'zustand'
import {
  fetchNotifications as apiFetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeNotifications,
} from '../api/notificationApi'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isModalOpen: false,
  activeToast: null,
  toastTimeout: null,
  cleanupSSE: null,

  setIsModalOpen: (open) => {
    set({ isModalOpen: open })
    if (open) {
      get().fetchNotifications()
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await apiFetchNotifications(0, 20)
      const list = Array.isArray(res) ? res : (res?.content || res?.data || [])
      const count = list.filter((n) => !n.isRead).length
      set({ notifications: list, unreadCount: count })
    } catch (error) {
      console.warn('[useNotificationStore] 알림 조회 오류:', error.message)
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await fetchUnreadNotificationCount()
      set({ unreadCount: count })
    } catch (error) {
      console.warn('[useNotificationStore] 미확인 카운트 조회 오류:', error.message)
    }
  },

  markAsRead: async (id) => {
    try {
      await markNotificationAsRead(id)
      set((state) => {
        const nextList = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
        return {
          notifications: nextList,
          unreadCount: Math.max(0, state.unreadCount - 1),
        }
      })
    } catch (error) {
      console.warn('[useNotificationStore] 읽음 처리 오류:', error.message)
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllNotificationsAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
    } catch (error) {
      console.warn('[useNotificationStore] 전체 읽음 처리 오류:', error.message)
    }
  },

  showToast: (notification) => {
    if (!notification) return

    // 이전 토스트 타이머 클리어
    if (get().toastTimeout) {
      clearTimeout(get().toastTimeout)
    }

    const timeout = setTimeout(() => {
      set({ activeToast: null, toastTimeout: null })
    }, 5000)

    set({ activeToast: notification, toastTimeout: timeout })
  },

  dismissToast: () => {
    if (get().toastTimeout) {
      clearTimeout(get().toastTimeout)
    }
    set({ activeToast: null, toastTimeout: null })
  },

  initSSE: () => {
    // 이미 SSE가 연결되어 있으면 재연결 방지
    if (get().cleanupSSE) return

    const cleanup = subscribeNotifications(
      (newNotif) => {
        console.info('🔔 [SSE 알림 수신]:', newNotif)
        set((state) => {
          const exists = state.notifications.some((n) => n.id === newNotif.id)
          const updated = exists ? state.notifications : [newNotif, ...state.notifications]
          return {
            notifications: updated,
            unreadCount: state.unreadCount + 1,
          }
        })
        get().showToast(newNotif)
      },
      (err) => {
        console.warn('🔔 [SSE 스트림 끊김/재시도 중]:', err)
      }
    )

    set({ cleanupSSE: cleanup })

    // 주기적 폴링 병행 (SSE 지원하지 않거나 백그라운드 복귀 대비)
    get().fetchNotifications()
    const pollInterval = setInterval(() => {
      get().fetchNotifications()
    }, 8000)

    return () => {
      clearInterval(pollInterval)
      if (cleanup) cleanup()
      set({ cleanupSSE: null })
    }
  },
}))
