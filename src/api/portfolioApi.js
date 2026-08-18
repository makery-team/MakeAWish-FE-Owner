import { client } from './client'

export async function fetchStorePortfolios(storeId = 1) {
  const res = await client.get(`/api/stores/${storeId}`)
  if (!res || !res.categories) return []
  return res.categories.flatMap((c) =>
    (c.portfolios || []).map((p) => ({
      ...p,
      productId: c.id,
      storeId: storeId,
    }))
  )
}

export async function uploadPortfolioImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await client.post('/api/images/upload', formData)
  return res.imageUrl
}

export async function createPortfolio({ title, description, imageUrl, productId, tags }) {
  let finalProductId = productId
  if (!finalProductId) {
    try {
      const { useShopStore } = await import('../store/useShopStore')
      const { profile } = useShopStore.getState()
      if (profile && profile.categories && profile.categories.length > 0) {
        finalProductId = profile.categories[0].id
      }
    } catch (e) {
      console.error('Failed to get productId from shop store, defaulting to 1', e)
    }
  }

  return client.post('/api/portfolios', { title, description, imageUrl, productId: Number(finalProductId), tags })
}

export async function updatePortfolio(portfolioId, { title, description, imageUrl, productId, tags }) {
  return client.patch(`/api/portfolios/${portfolioId}`, {
    title,
    description,
    imageUrl,
    productId: productId ? Number(productId) : undefined,
    tags,
  })
}

export async function recommendPortfolioTags({ imageUrl, description }) {
  // AI 서버로 직접 가는 게 아니라 Spring 서버가 내부적으로 AI를 호출해주는 구조다.
  // 응답은 { recommendedTags: [...] }가 아니라 문자열 배열을 그대로 반환한다.
  return client.post('/api/portfolios/tags/recommend', { imageUrl, description })
}
