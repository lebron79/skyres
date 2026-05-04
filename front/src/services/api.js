export const API_BASE = 'http://localhost:9000'

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

/** @param {string | null | undefined} token */
export async function apiFetch(path, options = {}, token) {
  const headers = { ...options.headers }
  const hasBody = options.body != null && options.body !== ''
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) headers.Authorization = `Bearer ${token}`

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
