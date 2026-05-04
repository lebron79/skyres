/** Safe decode for names passed through query strings */
export function decodeCheckoutName(raw) {
  if (raw == null || raw === '') return 'Booking'
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '))
  } catch {
    return raw
  }
}

/** Strip HTML if an error page was returned as text */
export function humanizeApiError(message) {
  if (typeof message !== 'string') return 'Something went wrong.'
  const t = message.trim()
  if (t.startsWith('<!') || t.startsWith('<html')) return 'Server error — try again in a moment.'
  if (t.startsWith('{')) {
    try {
      const o = JSON.parse(t)
      if (o && typeof o === 'object') {
        const v = Object.values(o).filter(Boolean)
        if (v.length) return v.join(' ')
      }
    } catch {
      /* plain text */
    }
  }
  if (t.length > 280) return `${t.slice(0, 280)}…`
  return t
}
