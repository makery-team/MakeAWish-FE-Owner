import { client } from './client'

export async function createProduct(storeId, payload) {
  return client.post(`/api/stores/${storeId}/products`, payload)
}

export async function updateProduct(storeId, productId, payload) {
  return client.put(`/api/stores/${storeId}/products/${productId}`, payload)
}

export async function deleteProduct(storeId, productId) {
  return client.delete(`/api/stores/${storeId}/products/${productId}`)
}
