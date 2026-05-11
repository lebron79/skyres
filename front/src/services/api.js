export const API_BASE = 'http://localhost:9000'

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

/** @param {string | null | undefined} token */
export async function apiFetch(path, options = {}, token) {
  const raw =
    token ??
    (typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null)
  const authToken = typeof raw === 'string' ? raw.trim() : raw
  const headers = { ...options.headers }
  const hasBody = options.body != null && options.body !== ''
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch(apiUrl(path), { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    const err = new Error(text || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) return res.json()
  return res.text()
}

/** GET (or other) public endpoints: never sends Authorization (avoids 403 with stale JWT on permitAll routes). */
export async function apiFetchPublic(path, options = {}) {
  const headers = { ...options.headers }
  const hasBody = options.body != null && options.body !== ''
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(apiUrl(path), { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    const err = new Error(text || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) return res.json()
  return res.text()
}
