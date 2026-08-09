import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { genId } from '../lib/time'
import { INITIAL_PORTFOLIOS } from '../mocks/seed'
import * as portfolioApi from '../api/portfolioApi'

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      portfolios: INITIAL_PORTFOLIOS,
      portfoliosError: '',

      fetchPortfolios: async (storeId = 1) => {
        set({ portfoliosError: '' })
        try {
          const data = await portfolioApi.fetchStorePortfolios(storeId)
          set({
            portfolios: data.map((p) => ({
              id: String(p.portfolioId),
              title: p.title,
              description: p.description,
              imageUrl: p.imageUrl,
              isInpaintingAllowed: p.isInpaintingAllowed,
              tags: p.tags || [],
            })),
          })
        } catch (err) {
          set({ portfoliosError: err.message || '포트폴리오를 불러오지 못했어요' })
        }
      },

      recommendTags: async ({ imageUrl, description }) => {
        return portfolioApi.recommendPortfolioTags({ imageUrl, description })
      },

      createPortfolio: async (data) => {
        const res = await portfolioApi.createPortfolio(data)
        // 백엔드가 성공(201) 시에도 빈 바디를 줄 때가 있어 res가 null일 수 있다.
        // 그럴 땐 화면에서 입력한 값 + 임시 로컬 id로 채워 넣는다.
        const item = { ...data, ...res, id: res?.portfolioId !== undefined ? String(res.portfolioId) : genId('p') }
        set((state) => ({ portfolios: [item, ...state.portfolios] }))
        return item
      },

      updatePortfolio: async (id, data) => {
        const res = await portfolioApi.updatePortfolio(id, data)
        const item = { ...data, ...res, id: res?.portfolioId !== undefined ? String(res.portfolioId) : id }
        set((state) => ({
          portfolios: state.portfolios.map((p) => (p.id === id ? { ...p, ...item } : p)),
        }))
        return item
      },

      getById: (id) => get().portfolios.find((p) => p.id === id),
    }),
    { name: 'cake-portfolios' },
  ),
)
