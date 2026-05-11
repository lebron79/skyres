import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './PaymentHistory.css'

function formatEur(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number(n))
}

function formatWhen(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

export default function PaymentHistory() {
  const { user, token } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    const auth =
      (typeof token === 'string' ? token.trim() : '') ||
      (typeof localStorage !== 'undefined' ? (localStorage.getItem('authToken') ?? '').trim() : '')
    if (!auth) {
      setLoading(false)
      setError('Not signed in')
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch('/api/payments/me', { method: 'GET' }, auth)
        if (!cancelled) setRows(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) {
          const msg = e.status === 401 ? 'Session expired or not authorized. Please sign in again.' : (e.message || 'Could not load payments')
          setError(msg)
          setRows([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, token])

  return (
    <div className="pay-hist">
      <div className="pay-hist-inner">
        <Link to="/" className="pay-hist-back">
          ← Back to home
        </Link>
        <header className="pay-hist-head">
          <p className="pay-hist-kicker">Your account</p>
          <h1 className="pay-hist-title">Payment history</h1>
          <p className="pay-hist-sub">Confirmed payments linked to your reservations.</p>
        </header>

        {loading && <p className="pay-hist-status">Loading…</p>}
        {error && <p className="pay-hist-error">{error}</p>}
        {!loading && !error && rows.length === 0 && (
          <p className="pay-hist-empty">No payments yet. Complete a booking to see it here.</p>
        )}

        {!loading && rows.length > 0 && (
          <div className="pay-hist-table-wrap">
            <table className="pay-hist-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hotel</th>
                  <th>Reservation</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th className="pay-hist-num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{formatWhen(p.paidAt)}</td>
                    <td>{p.hotelName || '—'}</td>
                    <td>#{p.reservationId}</td>
                    <td>{p.method || '—'}</td>
                    <td>
                      <span className={`pay-hist-badge pay-hist-badge--${String(p.status || '').toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="pay-hist-num">{formatEur(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pay-hist-actions">
          <Link to="/reservations" className="pay-hist-btn pay-hist-btn--primary">
            Manage reservations →
          </Link>
          <Link to="/#account-bookings" className="pay-hist-btn pay-hist-btn--ghost">
            View my bookings
          </Link>
        </div>
      </div>
    </div>
  )
}
