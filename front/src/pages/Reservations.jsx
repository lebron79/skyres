import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTripCart, nightsBetweenStr } from '../context/TripCartContext.jsx'
import { priceMultiplier } from '../utils/skyresCoupons.js'
import CouponScratchCard from '../components/CouponScratchCard.jsx'
import { apiFetch } from '../services/api.js'
import './Reservations.css'

const AMENITIES = [
  { key: 'outdoorPool',    label: '🏊 Outdoor Pool' },
  { key: 'indoorPool',     label: '🏊 Indoor Pool' },
  { key: 'beach',          label: '🏖️ Beach' },
  { key: 'parking',        label: '🚗 Parking' },
  { key: 'spa',            label: '💆 Spa' },
  { key: 'airportShuttle', label: '🚌 Airport Shuttle' },
  { key: 'fitnessCenter',  label: '🏋️ Fitness Center' },
  { key: 'bar',            label: '🍹 Bar' },
]

/** Hotel nightly rate in DB is TND; destination estimatedBudget is EUR (same as backend). */
const TND_PER_EUR = 3.42

function hotelNightEur(pricePerNightTnd) {
  const n = Number(pricePerNightTnd)
  if (!Number.isFinite(n) || n <= 0) return 0
  return n / TND_PER_EUR
}

function destinationFeeEur(dest) {
  if (!dest || dest.estimatedBudget == null) return 0
  const v = Number(dest.estimatedBudget)
  return Number.isFinite(v) && v > 0 ? v : 0
}

function formatEur(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number(n))
}

/** When the reservation was created (booking placed). */
function formatReservationBookedAt(iso) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return null
  }
}

export default function Reservations() {
  const { user, token } = useAuth()
  const {
    appliedCoupons,
    applyCoupon,
    removeCoupon,
    maxCouponSlots,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    persons,
    setPersons,
    setTripHotel,
    resetStayDates,
    resetBookingWizard,
  } = useTripCart()
  const [searchParams] = useSearchParams()

  const [reservations, setReservations]     = useState([])
  const [hotels, setHotels]                 = useState([])
  const [hotelsLoading, setHotelsLoading]   = useState(false)
  const [hotelsSearched, setHotelsSearched] = useState(false)
  const [selectedHotel, setSelectedHotel]   = useState(null)
  const [createdReservation, setCreatedReservation] = useState(null)

  const [filters, setFilters] = useState({
    minStars: '', maxStars: '', minRating: '', maxPrice: '', keyword: '',
    outdoorPool: false, indoorPool: false, beach: false, parking: false,
    spa: false, airportShuttle: false, fitnessCenter: false, bar: false,
  })

  const [showBudget, setShowBudget]   = useState(false)
  const [budgetHotel, setBudgetHotel] = useState(null)
  const [budgetForm, setBudgetForm]   = useState({ checkIn: '', checkOut: '', numberOfPersons: 1, couponCode: '', secondCouponCode: '' })
  const [budget, setBudget]           = useState(null)

  const [step, setStep]       = useState('list') // list | search | book | payment
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const bookingEstimateEur = useMemo(() => {
    if (step !== 'book' || !selectedHotel) return null
    const n = nightsBetweenStr(checkIn, checkOut)
    if (n <= 0) return null
    const p = Math.max(1, persons)
    const nightEur = hotelNightEur(selectedHotel.pricePerNight)
    const hotelPart = nightEur * n * p
    const destPart = destinationFeeEur(selectedHotel.destination)
    const subtotal = hotelPart + destPart
    const c1 = appliedCoupons[0] ?? ''
    const c2 = appliedCoupons[1] ?? ''
    let mult = 1
    try {
      mult = priceMultiplier(c1 || null, c2 || null, maxCouponSlots === 2)
    } catch {
      mult = 1
    }
    const totalEur = subtotal * mult
    const discountEur = Math.max(0, subtotal - totalEur)
    return {
      nights: n,
      persons: p,
      hotelPart,
      destPart,
      subtotal,
      totalEur,
      discountEur,
    }
  }, [step, selectedHotel, checkIn, checkOut, persons, appliedCoupons, maxCouponSlots])

  /** Single primitive so useEffect deps array length never changes (avoids Fast Refresh / hook mismatch warnings). */
  const reservationsSessionKey = useMemo(() => {
    const uid = user?.id
    if (uid == null) return ''
    const fromState = (token ?? '').trim()
    const fromStorage =
      typeof localStorage !== 'undefined' ? (localStorage.getItem('authToken') ?? '').trim() : ''
    const auth = fromState || fromStorage
    if (!auth) return ''
    return `${uid}\t${auth}`
  }, [user?.id, token])

  useEffect(() => {
    if (!reservationsSessionKey) return
    const tab = reservationsSessionKey.indexOf('\t')
    if (tab < 1) return
    const userId = Number(reservationsSessionKey.slice(0, tab))
    const auth = reservationsSessionKey.slice(tab + 1)
    if (!Number.isFinite(userId) || !auth) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiFetch(`/api/reservations/user/${userId}`, {}, auth)
        if (!cancelled) setReservations(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setReservations([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reservationsSessionKey])

  useEffect(() => {
    if (step !== 'book' || !selectedHotel?.id) return
    setTripHotel({
      id: selectedHotel.id,
      name: selectedHotel.name,
      pricePerNight: selectedHotel.pricePerNight,
    })
  }, [step, selectedHotel, setTripHotel])

  const deepLinkHotelId = searchParams.get('hotelId')

  // Deep link: /reservations?hotelId=123 → load hotel and open booking step
  useEffect(() => {
    if (!deepLinkHotelId || user?.id == null) return
    const auth = (token ?? '').trim() || (typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : '')?.trim() ?? ''
    if (!auth) return
    const id = Number(deepLinkHotelId)
    if (!Number.isFinite(id) || id < 1) return
    let cancelled = false
    ;(async () => {
      try {
        const hotel = await apiFetch(`/api/hotels/${id}`, {}, auth)
        if (cancelled || !hotel?.id) return
        resetStayDates()
        setSelectedHotel(hotel)
        setStep('book')
        setMessage('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        if (!cancelled) setMessage(`✗ ${err.message}`)
      }
    })()
    return () => { cancelled = true }
  }, [deepLinkHotelId, user?.id, token, resetStayDates])

  const loadReservations = useCallback(async () => {
    if (!reservationsSessionKey) return
    const tab = reservationsSessionKey.indexOf('\t')
    if (tab < 1) return
    const userId = Number(reservationsSessionKey.slice(0, tab))
    const auth = reservationsSessionKey.slice(tab + 1)
    if (!Number.isFinite(userId) || !auth) return
    try {
      const data = await apiFetch(`/api/reservations/user/${userId}`, {}, auth)
      setReservations(Array.isArray(data) ? data : [])
    } catch {
      setReservations([])
    }
  }, [reservationsSessionKey])

  const searchHotels = async (e) => {
    e?.preventDefault()
    setHotelsLoading(true)
    setHotelsSearched(true)
    setSelectedHotel(null)
    try {
      const body = {
        minStars:      filters.minStars      ? Number(filters.minStars)  : null,
        maxStars:      filters.maxStars      ? Number(filters.maxStars)  : null,
        minRating:     filters.minRating     ? Number(filters.minRating) : null,
        maxPrice:      filters.maxPrice      ? Number(filters.maxPrice)  : null,
        keyword:       filters.keyword       || null,
        outdoorPool:   filters.outdoorPool   || null,
        indoorPool:    filters.indoorPool    || null,
        beach:         filters.beach         || null,
        parking:       filters.parking       || null,
        spa:           filters.spa           || null,
        airportShuttle:filters.airportShuttle|| null,
        fitnessCenter: filters.fitnessCenter || null,
        bar:           filters.bar           || null,
        destinationId: null, maxDistanceKm: null, minPrice: null,
      }
      const data = await apiFetch('/api/hotels/filter', { method: 'POST', body: JSON.stringify(body) }, token)
      setHotels(Array.isArray(data) ? data : [])
    } catch (err) { setMessage(`✗ ${err.message}`); setHotels([]) }
    setHotelsLoading(false)
  }

  const resetFilters = () => {
    setFilters({ minStars: '', maxStars: '', minRating: '', maxPrice: '', keyword: '',
      outdoorPool: false, indoorPool: false, beach: false, parking: false,
      spa: false, airportShuttle: false, fitnessCenter: false, bar: false })
    setHotels([]); setHotelsSearched(false); setSelectedHotel(null)
  }

  const selectHotel = (hotel) => {
    resetStayDates()
    setSelectedHotel(hotel)
    setStep('book')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 1: create reservation → go to payment
  const handleBook = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await apiFetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          hotelId: selectedHotel.id,
          checkIn,
          checkOut,
          numberOfPersons: Number(persons),
          couponCode: appliedCoupons[0] || null,
          secondCouponCode: appliedCoupons[1] || null,
        }),
      }, token)
      setCreatedReservation(res)
      setStep('payment')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) { setMessage(`✗ ${err.message}`) }
    setLoading(false)
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return
    try {
      await apiFetch(`/api/reservations/${id}/cancel`, { method: 'PUT' }, token)
      setMessage('✓ Reservation cancelled')
      await loadReservations()
    } catch (err) { setMessage(`✗ ${err.message}`) }
  }

  const handleDeleteCancelled = async (id) => {
    if (!window.confirm('Remove this cancelled reservation from your list permanently?')) return
    try {
      await apiFetch(`/api/reservations/${id}`, { method: 'DELETE' }, token)
      setMessage('✓ Reservation removed from your list')
      await loadReservations()
    } catch (err) {
      setMessage(`✗ ${err.message}`)
    }
  }

  const handlePdf = async (id) => {
    try {
      const res = await fetch(`http://localhost:9000/api/reservations/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `invoice-${id}.pdf`; a.click()
      window.URL.revokeObjectURL(url)
    } catch { setMessage('✗ Failed to download PDF') }
  }

  const handleQr = (id) => {
    window.open(`http://localhost:9000/api/reservations/${id}/qrcode`, '_blank')
  }

  const handleBudget = async (e) => {
    e.preventDefault()
    setLoading(true); setBudget(null)
    try {
      const data = await apiFetch('/api/budget/simulate', {
        method: 'POST',
        body: JSON.stringify({
          hotelId: budgetHotel.id,
          checkIn: budgetForm.checkIn,
          checkOut: budgetForm.checkOut,
          numberOfPersons: Number(budgetForm.numberOfPersons),
          couponCode: budgetForm.couponCode || null,
          secondCouponCode: budgetForm.secondCouponCode?.trim() || null,
          userId: user?.id ?? null,
        }),
      }, token)
      setBudget(data)
    } catch (err) { setMessage(`✗ ${err.message}`) }
    setLoading(false)
  }

  const openBudget = (hotel) => {
    setBudgetHotel(hotel)
    setBudget(null)
    setBudgetForm({
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      numberOfPersons: persons,
      couponCode: appliedCoupons[0] || '',
      secondCouponCode: appliedCoupons[1] || '',
    })
    setShowBudget(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goHome = () => {
    setStep('list')
    setSelectedHotel(null)
    setCreatedReservation(null)
    setMessage('')
    resetBookingWizard()
  }

  const statusColor = (s) => ({
    CONFIRMED: '#059669', PENDING: '#f59e0b',
    CANCELLED: '#dc2626', COMPLETED: '#3b82f6',
  }[s] || '#6b7280')

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="res-page">
      <div className="res-topbar">
        <Link to="/" className="res-back">← Back to home</Link>
      </div>

      {/* Progress bar */}
      {step !== 'list' && (
        <div className="res-progress">
          {(() => {
            const wizardSteps = ['search', 'book', 'payment']
            const labels = ['Search Hotel', 'Book', 'Payment']
            const activeIdx = wizardSteps.indexOf(step)
            return wizardSteps.map((s, i) => (
              <div
                key={s}
                className={`res-progress-step ${step === s ? 'active' : ''} ${activeIdx > i ? 'done' : ''}`}
              >
                <div className="res-progress-dot">{i + 1}</div>
                <span>{labels[i]}</span>
              </div>
            ))
          })()}
        </div>
      )}

      <div className="res-header">
        <h1>
          {step === 'list'      && '🏨 My Reservations'}
          {step === 'search'    && '🔍 Find a Hotel'}
          {step === 'book'      && '📋 Booking Details'}
          {step === 'payment'   && '💳 Payment'}
        </h1>
        <div className="res-header-btns">
          {step !== 'list' && (
            <button className="res-btn-outline" onClick={() => {
              if (step === 'book') setStep('search')
              else if (step === 'payment') setStep('book')
              else goHome()
            }}>← Back</button>
          )}
          {step === 'list' && (
            <button className="res-btn-primary" onClick={() => setStep('search')}>
              + New Reservation
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`res-message ${message.startsWith('✓') ? 'success' : 'error'}`}>
          {message}
          <button className="res-msg-close" onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      {/* ── BUDGET MODAL ── */}
      {showBudget && budgetHotel && (
        <div className="res-modal-overlay" onClick={() => setShowBudget(false)}>
          <div className="res-modal" onClick={e => e.stopPropagation()}>
            <div className="res-modal-header">
              <h2>💰 Budget Simulator</h2>
              <button className="res-modal-close" onClick={() => setShowBudget(false)}>✕</button>
            </div>
            <div className="res-modal-hotel">
              <strong>{budgetHotel.name}</strong>
              <span>{stars(budgetHotel.stars)} · {formatEur(hotelNightEur(budgetHotel.pricePerNight))}/night</span>
            </div>
            <form onSubmit={handleBudget} className="res-form">
              <div className="res-form-row">
                <label>Check-in<input type="date" value={budgetForm.checkIn} onChange={e => setBudgetForm(f => ({ ...f, checkIn: e.target.value }))} required /></label>
                <label>Check-out<input type="date" value={budgetForm.checkOut} onChange={e => setBudgetForm(f => ({ ...f, checkOut: e.target.value }))} required /></label>
              </div>
              <div className="res-form-row">
                <label>Persons<input type="number" min="1" value={budgetForm.numberOfPersons} onChange={e => setBudgetForm(f => ({ ...f, numberOfPersons: e.target.value }))} /></label>
                <label>Coupon 1<input type="text" placeholder="ILSKYRES1…" value={budgetForm.couponCode} onChange={e => setBudgetForm(f => ({ ...f, couponCode: e.target.value }))} /></label>
              </div>
              {Number(user?.reservationCount) === 0 && (
                <div className="res-form-row">
                  <label>Coupon 2 (1ère réservation)<input type="text" placeholder="2e code distinct" value={budgetForm.secondCouponCode} onChange={e => setBudgetForm(f => ({ ...f, secondCouponCode: e.target.value }))} /></label>
                </div>
              )}
              <button type="submit" className="res-btn-primary" disabled={loading}>{loading ? 'Calculating…' : 'Calculate'}</button>
            </form>
            {budget && (
              <div className="budget-result">
                <div className="budget-rows">
                  <div className="budget-row"><span>Nights</span><span>{budget.numberOfNights}</span></div>
                  <div className="budget-row"><span>Persons</span><span>{budget.numberOfPersons}</span></div>
                  <div className="budget-row"><span>Price/night (→ EUR)</span><span>{formatEur(hotelNightEur(budget.pricePerNight))}</span></div>
                  {(budget.destinationCity || budget.destinationCountry) && (
                    <div className="budget-row"><span>Destination</span><span>{[budget.destinationCity, budget.destinationCountry].filter(Boolean).join(', ')}</span></div>
                  )}
                  <div className="budget-row"><span>Hotel stay (EUR)</span><span>{formatEur(budget.hotelStaySubtotal)}</span></div>
                  {budget.destinationPackageFee != null && budget.destinationPackageFee > 0 && (
                    <div className="budget-row"><span>Destination package (EUR)</span><span>{formatEur(budget.destinationPackageFee)}</span></div>
                  )}
                  <div className="budget-row"><span>Subtotal (EUR)</span><span>{formatEur(budget.subtotal)}</span></div>
                  {budget.discount > 0 && <div className="budget-row discount"><span>Discount ({budget.couponApplied})</span><span>-{formatEur(budget.discount)}</span></div>}
                  <div className="budget-row total"><span>Total (EUR)</span><span>{formatEur(budget.total)}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP: SEARCH ── */}
      {step === 'search' && (
        <div>
          <div className="res-card">
            <p className="res-hint">Filter hotels then click "Select" to proceed to booking</p>
            <form onSubmit={searchHotels} className="res-filter-form">
              <div className="res-filter-row">
                <label>Hotel name<input type="text" placeholder="Search by name…" value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} /></label>
                <label>Max price/night ($)<input type="number" min="0" placeholder="e.g. 300" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} /></label>
                <label>
                  Min rating
                  <select value={filters.minRating} onChange={e => setFilters(f => ({ ...f, minRating: e.target.value }))}>
                    <option value="">Any rating</option>
                    <option value="6.0">Pleasant (6+)</option>
                    <option value="7.5">Good (7.5+)</option>
                    <option value="8.0">Superb (8+)</option>
                    <option value="9.0">Fabulous (9+)</option>
                    <option value="9.5">Exceptional (9.5+)</option>
                  </select>
                </label>
              </div>
              <div className="res-filter-row">
                <label>Min stars
                  <select value={filters.minStars} onChange={e => setFilters(f => ({ ...f, minStars: e.target.value }))}>
                    <option value="">Any</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{stars(n)}</option>)}
                  </select>
                </label>
                <label>Max stars
                  <select value={filters.maxStars} onChange={e => setFilters(f => ({ ...f, maxStars: e.target.value }))}>
                    <option value="">Any</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{stars(n)}</option>)}
                  </select>
                </label>
              </div>
              <div className="res-filter-amenities">
                <p className="res-filter-label">Amenities</p>
                <div className="res-amenities-grid">
                  {AMENITIES.map(a => (
                    <label key={a.key} className="res-amenity-check">
                      <input type="checkbox" checked={filters[a.key]} onChange={e => setFilters(f => ({ ...f, [a.key]: e.target.checked }))} />
                      {a.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="res-filter-actions">
                <button type="submit" className="res-btn-primary" disabled={hotelsLoading}>{hotelsLoading ? 'Searching…' : '🔍 Search Hotels'}</button>
                <button type="button" className="res-btn-outline" onClick={resetFilters}>Reset</button>
              </div>
            </form>
          </div>

          {hotelsSearched && (
            <div className="res-card">
              <div className="res-table-header">
                <h2>Results</h2>
                <span className="res-table-count">{hotels.length} hotel(s) found</span>
              </div>
              {hotels.length === 0 ? (
                <div className="res-empty-small">No hotels match your filters.</div>
              ) : (
                <div className="res-table-wrap">
                  <table className="res-table">
                    <thead>
                      <tr>
                        <th>Hotel</th>
                        <th>Stars</th>
                        <th>Rating</th>
                        <th>Price/night</th>
                        <th>Amenities</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotels.map(h => (
                        <tr key={h.id} className={selectedHotel?.id === h.id ? 'selected' : ''}>
                          <td><div className="res-hotel-name">{h.name}</div><div className="res-hotel-addr">{h.address}</div></td>
                          <td><span className="res-stars">{stars(h.stars)}</span></td>
                          <td>{h.averageRating != null ? <span className="res-rating">{h.averageRating.toFixed(1)}</span> : '—'}</td>
                          <td><strong>${h.pricePerNight}</strong></td>
                          <td>
                            <div className="res-amenity-icons">
                              {h.hasOutdoorPool    && <span title="Outdoor Pool">🏊</span>}
                              {h.hasIndoorPool     && <span title="Indoor Pool">🏊</span>}
                              {h.hasBeach          && <span title="Beach">🏖️</span>}
                              {h.hasParking        && <span title="Parking">🚗</span>}
                              {h.hasSpa            && <span title="Spa">💆</span>}
                              {h.hasAirportShuttle && <span title="Shuttle">🚌</span>}
                              {h.hasFitnessCenter  && <span title="Fitness">🏋️</span>}
                              {h.hasBar            && <span title="Bar">🍹</span>}
                            </div>
                          </td>
                          <td>
                            <div className="res-table-actions">
                              <button className="res-action-btn pdf" onClick={() => openBudget(h)}>💰 Budget</button>
                              <button className="res-action-btn select" onClick={() => selectHotel(h)}>✓ Select</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP: BOOK ── */}
      {step === 'book' && selectedHotel && (
        <div className="res-card">
          <div className="res-book-hotel">
            <div>
              <h2>{selectedHotel.name}</h2>
              <p className="res-hint">
                {stars(selectedHotel.stars)} · {formatEur(hotelNightEur(selectedHotel.pricePerNight))}/night
                {selectedHotel.averageRating ? ` · Rating ${selectedHotel.averageRating.toFixed(1)}` : ''}
                {selectedHotel.destination && (
                  <> · {[selectedHotel.destination.city, selectedHotel.destination.country].filter(Boolean).join(', ')}</>
                )}
              </p>
            </div>
            <button className="res-btn-outline" onClick={() => setStep('search')}>← Change hotel</button>
          </div>
          {bookingEstimateEur && (
            <div className="res-book-estimate">
              <strong>Estimation (EUR)</strong>
              <div className="res-summary-grid">
                <div className="res-summary-item">
                  <span>Hôtel ({bookingEstimateEur.nights} nuit{bookingEstimateEur.nights > 1 ? 's' : ''} × {bookingEstimateEur.persons} pers.)</span>
                  <strong>{formatEur(bookingEstimateEur.hotelPart)}</strong>
                </div>
                {bookingEstimateEur.destPart > 0 && (
                  <div className="res-summary-item">
                    <span>Forfait destination (1× séjour)</span>
                    <strong>{formatEur(bookingEstimateEur.destPart)}</strong>
                  </div>
                )}
                <div className="res-summary-item">
                  <span>Sous-total (avant coupons)</span>
                  <strong>{formatEur(bookingEstimateEur.subtotal)}</strong>
                </div>
                {bookingEstimateEur.discountEur > 0.005 && (
                  <div className="res-summary-item res-summary-discount">
                    <span>Réduction coupons</span>
                    <strong>−{formatEur(bookingEstimateEur.discountEur)}</strong>
                  </div>
                )}
                <div className="res-summary-item total">
                  <span>Total estimé</span>
                  <strong>{formatEur(bookingEstimateEur.totalEur)}</strong>
                </div>
              </div>
              <p className="res-book-estimate-note">
                Même calcul que le panneau « Votre voyage » (dates, personnes, codes). Montants en EUR, alignés avec le serveur au paiement.
              </p>
            </div>
          )}
          <form onSubmit={handleBook} className="res-form">
            <div className="res-form-row">
              <label>Check-in<input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required /></label>
              <label>Check-out<input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required /></label>
            </div>
            <div className="res-form-row">
              <label>Number of persons<input type="number" min={1} max={20} value={persons} onChange={(e) => setPersons(Math.max(1, Number(e.target.value) || 1))} required /></label>
            </div>
            <div className="res-book-coupon-block">
              <p className="res-book-coupon-title">Codes promo</p>
              <p className="res-book-coupon-hint">
                {maxCouponSlots === 2
                  ? 'Première réservation : jusqu’à 2 codes distincts — grattez une carte par code (identique au panneau de droite).'
                  : 'Un seul code par réservation (compte déjà une réservation).'}
              </p>
              <CouponScratchCard
                applyCoupon={applyCoupon}
                appliedCoupons={appliedCoupons}
                maxCouponSlots={maxCouponSlots}
                variant="booking"
              />
              {appliedCoupons.length > 0 && (
                <ul className="res-book-coupon-chips" aria-label="Codes appliqués">
                  {appliedCoupons.map((code, i) => (
                    <li key={`${code}-${i}`}>
                      <span className="res-book-chip">{code}</span>
                      <button
                        type="button"
                        className="res-book-chip-remove"
                        onClick={() => removeCoupon(i)}
                        aria-label={`Retirer ${code}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="res-book-tip">💡 Les mêmes codes et dates sont utilisés dans « Votre voyage » à droite.</div>
            <div className="res-form-actions">
              <button type="button" className="res-btn-outline" onClick={() => openBudget(selectedHotel)}>💰 Simulate Budget</button>
              <button type="submit" className="res-btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Continue to Payment →'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── STEP: PAYMENT ── */}
      {step === 'payment' && createdReservation && (
        <div>
          {/* Reservation summary */}
          <div className="res-card res-summary-card">
            <h2>📋 Reservation Summary</h2>
            <div className="res-summary-grid">
              <div className="res-summary-item"><span>Hotel</span><strong>{createdReservation.hotelName}</strong></div>
              {(createdReservation.destinationCity || createdReservation.destinationCountry) && (
                <div className="res-summary-item"><span>Destination</span><strong>{[createdReservation.destinationCity, createdReservation.destinationCountry].filter(Boolean).join(', ')}</strong></div>
              )}
              <div className="res-summary-item"><span>Check-in</span><strong>{createdReservation.checkIn}</strong></div>
              <div className="res-summary-item"><span>Check-out</span><strong>{createdReservation.checkOut}</strong></div>
              <div className="res-summary-item"><span>Persons</span><strong>{createdReservation.numberOfPersons}</strong></div>
              <div className="res-summary-item"><span>Status</span>
                <span className="res-status-pill" style={{ background: statusColor(createdReservation.status) }}>
                  {createdReservation.status}
                </span>
              </div>
              {createdReservation.hotelStaySubtotal != null && (
                <div className="res-summary-item"><span>Hôtel (hébergement, EUR)</span><strong>{formatEur(createdReservation.hotelStaySubtotal)}</strong></div>
              )}
              {createdReservation.destinationPackageFee != null && createdReservation.destinationPackageFee > 0 && (
                <div className="res-summary-item"><span>Forfait destination (EUR)</span><strong>{formatEur(createdReservation.destinationPackageFee)}</strong></div>
              )}
              <div className="res-summary-item total"><span>Total (EUR)</span><strong className="res-total-amount">{formatEur(createdReservation.totalPrice)}</strong></div>
            </div>
          </div>

          <div className="res-card res-stripe-only">
            <h2>💳 Paiement Stripe</h2>
            <p className="res-hint">
              Le règlement se fait uniquement via Stripe (carte, test ou production selon la config du serveur).
            </p>
            {createdReservation.totalPrice != null && Number(createdReservation.totalPrice) >= 0.5 ? (
              <>
                <Link
                  className="res-btn-primary res-stripe-cta"
                  to={`/payment?type=reservation&refId=${createdReservation.id}&name=${encodeURIComponent(`${createdReservation.hotelName} — #${createdReservation.id}`)}&price=${encodeURIComponent(String(createdReservation.totalPrice))}`}
                >
                  Payer avec Stripe — {formatEur(createdReservation.totalPrice)}
                </Link>
                <p className="res-stripe-note">
                  Après le paiement, revenez à <strong>Mes réservations</strong> pour voir le statut mis à jour (webhook Stripe recommandé côté serveur).
                </p>
              </>
            ) : (
              <p className="res-hint">Montant trop faible ou indisponible pour le checkout Stripe.</p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP: LIST ── */}
      {step === 'list' && (
        reservations.length === 0 ? (
          <div className="res-empty">
            <p>🏨 No reservations yet</p>
            <button className="res-btn-primary" onClick={() => setStep('search')}>Search & Book a Hotel</button>
          </div>
        ) : (
          <div className="res-list">
            {reservations.map(r => {
              const bookedAt = formatReservationBookedAt(r.createdAt)
              return (
              <div key={r.id} className="res-item">
                <div className="res-item-header">
                  <div>
                    <h3>{r.hotelName}</h3>
                    <span className="res-id">Reservation #{r.id}</span>
                  </div>
                  <span className="res-status" style={{ background: statusColor(r.status) }}>{r.status}</span>
                </div>
                <div className="res-item-details">
                  {bookedAt && (
                    <div><span>📋</span> Booked {bookedAt}</div>
                  )}
                  <div><span>📅</span> {r.checkIn} → {r.checkOut}</div>
                  <div><span>👥</span> {r.numberOfPersons} person(s)</div>
                  <div><span>💵</span> Total: <strong>{formatEur(r.totalPrice)}</strong></div>
                </div>
                <div className="res-item-actions">
                  <button className="res-action-btn pdf" onClick={() => handlePdf(r.id)}>📄 Invoice PDF</button>
                  <button className="res-action-btn qr" onClick={() => handleQr(r.id)}>⬛ QR Code</button>
                  {String(r.status || '').toUpperCase() === 'PENDING' && (
                    <button className="res-action-btn cancel" onClick={() => handleCancel(r.id)}>✕ Cancel</button>
                  )}
                  {String(r.status || '').toUpperCase() === 'CANCELLED' && (
                    <button type="button" className="res-action-btn delete" onClick={() => handleDeleteCancelled(r.id)}>
                      🗑 Remove
                    </button>
                  )}
                </div>
              </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}