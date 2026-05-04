// ============================================================
// src/services/hotelAPI.js
// Utilise ton apiFetch existant + token depuis AuthContext
//
// Usage dans un composant :
//   const { token } = useAuth()
//   const api = hotelAPI(token)
//   const hotels = await api.getAll()
// ============================================================
import { apiFetch } from './api'

/**
 * @param {string | null} token — token JWT depuis useAuth()
 */
export function hotelAPI(token) {
  const req = (path, options = {}) => apiFetch(path, options, token)

  return {
    // POST /api/hotels
    create: (data) =>
      req('/api/hotels', { method: 'POST', body: JSON.stringify(data) }),

    // GET /api/hotels
    getAll: () =>
      req('/api/hotels'),

    // GET /api/hotels/{id}
    getById: (id) =>
      req(`/api/hotels/${id}`),

    // PUT /api/hotels/{id}
    update: (id, data) =>
      req(`/api/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // DELETE /api/hotels/{id}
    delete: (id) =>
      req(`/api/hotels/${id}`, { method: 'DELETE' }),

    // POST /api/hotels/filter — filtre dynamique tous critères
    filter: (filters) =>
      req('/api/hotels/filter', { method: 'POST', body: JSON.stringify(filters) }),

    // GET /api/hotels/destination/{id}
    getByDestination: (destinationId) =>
      req(`/api/hotels/destination/${destinationId}`),

    // GET /api/hotels/destination/{id}/top-rated
    getTopRatedByDestination: (destinationId) =>
      req(`/api/hotels/destination/${destinationId}/top-rated`),
  }
}