import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '../lib/time'
export const useChatStore = create(
  persist(
    (set, get) => ({
      chats: {},

      getMessages: (orderId) => get().chats[orderId] || [],

      hasThread: (orderId) => (get().chats[orderId]?.length ?? 0) > 0,

      sendMessage: (orderId, text) => {
        const msg = { id: genId('m'), sender: 'store', text, time: '방금' }
        set((state) => ({
          chats: { ...state.chats, [orderId]: [...(state.chats[orderId] || []), msg] },
        }))
      },
    }),
    { name: 'cake-chats' },
  ),
)