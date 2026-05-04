// ============================================================
// src/services/destinationAPI.js
// Utilise ton apiFetch existant + token depuis AuthContext
//
// Usage dans un composant :
//   const { token } = useAuth()
//   const api = destinationAPI(token)
//   const data = await api.getAll()
// ============================================================
import { apiFetch } from './api'

/**
 * @param {string | null} token  — token JWT depuis useAuth()
 */
export function destinationAPI(token) {
  const req = (path, options = {}) => apiFetch(path, options, token)

  return {
    // POST /api/destinations
    create: (data) =>
      req('/api/destinations', { method: 'POST', body: JSON.stringify(data) }),

    // GET /api/destinations
    getAll: () =>
      req('/api/destinations'),

    // GET /api/destinations/{id}
    getById: (id) =>
      req(`/api/destinations/${id}`),

    // PUT /api/destinations/{id}
    update: (id, data) =>
      req(`/api/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // DELETE /api/destinations/{id}
    delete: (id) =>
      req(`/api/destinations/${id}`, { method: 'DELETE' }),

    // GET /api/destinations/search?keyword=paris
    search: (keyword) =>
      req(`/api/destinations/search?keyword=${encodeURIComponent(keyword)}`),

    // GET /api/destinations/trending
    getTrending: () =>
      req('/api/destinations/trending'),

    // GET /api/destinations/top-rated
    getTopRated: () =>
      req('/api/destinations/top-rated'),

    // GET /api/destinations/country/{country}
    getByCountry: (country) =>
      req(`/api/destinations/country/${encodeURIComponent(country)}`),

    // GET /api/destinations/climate/{climate}
    getByClimate: (climate) =>
      req(`/api/destinations/climate/${encodeURIComponent(climate)}`),

    // GET /api/destinations/filter?country=...&climate=...
    filter: (params = {}) => {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== '' && v != null)
        )
      ).toString()
      return req(`/api/destinations/filter${query ? `?${query}` : ''}`)
    },
  }
}