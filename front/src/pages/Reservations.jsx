import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
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

const PAYMENT_METHODS = [
  { key: 'CARD',   label: 'Credit / Debit Card',  icon: '💳', desc: 'Visa, Mastercard, Amex' },
  { key: 'PAYPAL', label: 'PayPal',                icon: '🅿️', desc: 'Pay with your PayPal account' },
  { key: 'CASH',   label: 'Cash on arrival',       icon: '💵', desc: 'Pay at the hotel' },
]

export default function Reservations() {
  const { user, token } = useAuth()

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

  const [form, setForm] = useState({
    checkIn: '', checkOut: '', numberOfPersons: 1, couponCode: '',
  })

  const [paymentMethod, setPaymentMethod]   = useState('CARD')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentDone, setPaymentDone]       = useState(null) // payment response

  const [showBudget, setShowBudget]   = useState(false)
  const [budgetHotel, setBudgetHotel] = useState(null)
  const [budgetForm, setBudgetForm]   = useState({ checkIn: '', checkOut: '', numberOfPersons: 1, couponCode: '' })
  const [budget, setBudget]           = useState(null)

  const [step, setStep]       = useState('list') // list | search | book | payment | confirmed
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { if (user) loadReservations() }, [user])

  const loadReservations = async () => {
    try {
      const data = await apiFetch(`/api/reservations/user/${user.id}`, {}, token)
      setReservations(Array.isArray(data) ? data : [])
    } catch { setReservations([]) }
  }

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
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          numberOfPersons: Number(form.numberOfPersons),
          couponCode: form.couponCode || null,
        }),
      }, token)
      setCreatedReservation(res)
      setPaymentMethod('CARD')
      setPaymentDone(null)
      setStep('payment')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) { setMessage(`✗ ${err.message}`) }
    setLoading(false)
  }

  // Step 2: pay
  const handlePay = async () => {
  if (!createdReservation) return

  // PayPal — ouvre PayPal dans un nouvel onglet puis confirme
  if (paymentMethod === 'PAYPAL') {
    const confirmed = window.confirm(
      `You will be redirected to PayPal to pay $${createdReservation.totalPrice?.toFixed(2)}.\n\nClick OK to proceed.`
    )
    if (!confirmed) return
    window.open('https://www.paypal.com/checkoutnow', '_blank')
    // simulate payment after redirect
    const simulate = window.confirm(
      'Have you completed the PayPal payment?\n\nClick OK to confirm your booking.'
    )
    if (!simulate) return
  }

  setPaymentLoading(true)
  setMessage('')
  try {
    const payment = await apiFetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        reservationId: createdReservation.id,
        amount: createdReservation.totalPrice,
        method: paymentMethod,
      }),
    }, token)
    setPaymentDone(payment)
    setStep('confirmed')
    await loadReservations()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) { setMessage(`✗ ${err.message}`) }
  setPaymentLoading(false)
}

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return
    try {
      await apiFetch(`/api/reservations/${id}/cancel`, { method: 'PUT' }, token)
      setMessage('✓ Reservation cancelled')
      await loadReservations()
    } catch (err) { setMessage(`✗ ${err.message}`) }
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
        }),
      }, token)
      setBudget(data)
    } catch (err) { setMessage(`✗ ${err.message}`) }
    setLoading(false)
  }

  const openBudget = (hotel) => {
    setBudgetHotel(hotel); setBudget(null)
    setBudgetForm({ checkIn: '', checkOut: '', numberOfPersons: 1, couponCode: '' })
    setShowBudget(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goHome = () => {
    setStep('list'); setSelectedHotel(null)
    setCreatedReservation(null); setPaymentDone(null)
    setForm({ checkIn: '', checkOut: '', numberOfPersons: 1, couponCode: '' })
    setMessage('')
  }

  const statusColor = (s) => ({
    CONFIRMED: '#059669', PENDING: '#f59e0b',
    CANCELLED: '#dc2626', COMPLETED: '#3b82f6',
  }[s] || '#6b7280')

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

  const methodIcon = (m) => PAYMENT_METHODS.find(p => p.key === m)?.icon || '💳'

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="res-page">
      <div className="res-topbar">
        <Link to="/" className="res-back">← Back to home</Link>
      </div>

      {/* Progress bar */}
      {step !== 'list' && (
        <div className="res-progress">
          {['search', 'book', 'payment', 'confirmed'].map((s, i) => (
            <div key={s} className={`res-progress-step ${step === s ? 'active' : ''} ${['book','payment','confirmed'].includes(step) && i === 0 ? 'done' : ''} ${['payment','confirmed'].includes(step) && i === 1 ? 'done' : ''} ${step === 'confirmed' && i === 2 ? 'done' : ''}`}>
              <div className="res-progress-dot">{i + 1}</div>
              <span>{['Search Hotel', 'Book', 'Payment', 'Confirmed'][i]}</span>
            </div>
          ))}
        </div>
      )}

      <div className="res-header">
        <h1>
          {step === 'list'      && '🏨 My Reservations'}
          {step === 'search'    && '🔍 Find a Hotel'}
          {step === 'book'      && '📋 Booking Details'}
          {step === 'payment'   && '💳 Payment'}
          {step === 'confirmed' && '✅ Booking Confirmed!'}
        </h1>
        <div className="res-header-btns">
          {step !== 'list' && step !== 'confirmed' && (
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
              <span>{stars(budgetHotel.stars)} · ${budgetHotel.pricePerNight}/night</span>
            </div>
            <form onSubmit={handleBudget} className="res-form">
              <div className="res-form-row">
                <label>Check-in<input type="date" value={budgetForm.checkIn} onChange={e => setBudgetForm(f => ({ ...f, checkIn: e.target.value }))} required /></label>
                <label>Check-out<input type="date" value={budgetForm.checkOut} onChange={e => setBudgetForm(f => ({ ...f, checkOut: e.target.value }))} required /></label>
              </div>
              <div className="res-form-row">
                <label>Persons<input type="number" min="1" value={budgetForm.numberOfPersons} onChange={e => setBudgetForm(f => ({ ...f, numberOfPersons: e.target.value }))} /></label>
                <label>Coupon<input type="text" placeholder="SKYRES10…" value={budgetForm.couponCode} onChange={e => setBudgetForm(f => ({ ...f, couponCode: e.target.value }))} /></label>
              </div>
              <button type="submit" className="res-btn-primary" disabled={loading}>{loading ? 'Calculating…' : 'Calculate'}</button>
            </form>
            {budget && (
              <div className="budget-result">
                <div className="budget-rows">
                  <div className="budget-row"><span>Nights</span><span>{budget.numberOfNights}</span></div>
                  <div className="budget-row"><span>Persons</span><span>{budget.numberOfPersons}</span></div>
                  <div className="budget-row"><span>Price/night</span><span>${budget.pricePerNight?.toFixed(2)}</span></div>
                  <div className="budget-row"><span>Subtotal</span><span>${budget.subtotal?.toFixed(2)}</span></div>
                  {budget.discount > 0 && <div className="budget-row discount"><span>Discount ({budget.couponApplied})</span><span>-${budget.discount?.toFixed(2)}</span></div>}
                  <div className="budget-row total"><span>Total</span><span>${budget.total?.toFixed(2)}</span></div>
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
              <p className="res-hint">{stars(selectedHotel.stars)} · ${selectedHotel.pricePerNight}/night{selectedHotel.averageRating ? ` · Rating ${selectedHotel.averageRating.toFixed(1)}` : ''}</p>
            </div>
            <button className="res-btn-outline" onClick={() => setStep('search')}>← Change hotel</button>
          </div>
          <form onSubmit={handleBook} className="res-form">
            <div className="res-form-row">
              <label>Check-in<input type="date" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} required /></label>
              <label>Check-out<input type="date" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} required /></label>
            </div>
            <div className="res-form-row">
              <label>Number of persons<input type="number" min="1" value={form.numberOfPersons} onChange={e => setForm(f => ({ ...f, numberOfPersons: e.target.value }))} required /></label>
              <label>Coupon Code <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span><input type="text" placeholder="SKYRES10, WELCOME…" value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))} /></label>
            </div>
            <div className="res-book-tip">💡 Coupons: <strong>SKYRES10</strong> (10%), <strong>SKYRES20</strong> (20%), <strong>WELCOME</strong> (15%), <strong>SUMMER25</strong> (25%)</div>
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
              <div className="res-summary-item"><span>Check-in</span><strong>{createdReservation.checkIn}</strong></div>
              <div className="res-summary-item"><span>Check-out</span><strong>{createdReservation.checkOut}</strong></div>
              <div className="res-summary-item"><span>Persons</span><strong>{createdReservation.numberOfPersons}</strong></div>
              <div className="res-summary-item"><span>Status</span>
                <span className="res-status-pill" style={{ background: statusColor(createdReservation.status) }}>
                  {createdReservation.status}
                </span>
              </div>
              <div className="res-summary-item total"><span>Total Amount</span><strong className="res-total-amount">${createdReservation.totalPrice?.toFixed(2)}</strong></div>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="res-card">
            <h2>💳 Choose Payment Method</h2>
            <p className="res-hint">Select your preferred payment method to confirm the booking</p>

            <div className="res-payment-methods">
              {PAYMENT_METHODS.map(m => (
                <div
                  key={m.key}
                  className={`res-payment-option ${paymentMethod === m.key ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(m.key)}
                >
                  <div className="res-payment-radio">
                    <div className={`res-radio-dot ${paymentMethod === m.key ? 'active' : ''}`} />
                  </div>
                  <div className="res-payment-icon">{m.icon}</div>
                  <div className="res-payment-info">
                    <strong>{m.label}</strong>
                    <span>{m.desc}</span>
                  </div>
                  {paymentMethod === m.key && <div className="res-payment-check">✓</div>}
                </div>
              ))}
            </div>

            {/* Card form simulation */}
            {paymentMethod === 'CARD' && (
              <div className="res-card-form">
                <h3>Card Details</h3>
                <div className="res-form">
                  <label>Card Number<input type="text" placeholder="1234 5678 9012 3456" maxLength="19" /></label>
                  <div className="res-form-row">
                    <label>Expiry Date<input type="text" placeholder="MM/YY" maxLength="5" /></label>
                    <label>CVV<input type="text" placeholder="123" maxLength="3" /></label>
                  </div>
                  <label>Cardholder Name<input type="text" placeholder="John Doe" /></label>
                </div>
              </div>
            )}

            {paymentMethod === 'PAYPAL' && (
              <div className="res-paypal-info">
                <p>🔗 You will be redirected to PayPal to complete your payment securely.</p>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="res-cash-info">
                <p>💵 You will pay <strong>${createdReservation.totalPrice?.toFixed(2)}</strong> in cash upon arrival at the hotel.</p>
                <p>Your reservation will be held for 24 hours.</p>
              </div>
            )}

            <div className="res-payment-footer">
              <div className="res-payment-total">
                <span>Total to pay</span>
                <strong>${createdReservation.totalPrice?.toFixed(2)}</strong>
              </div>
              <button
                className="res-btn-pay"
                onClick={handlePay}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <span>Processing… ⏳</span>
                ) : (
                  <span>{methodIcon(paymentMethod)} Pay ${createdReservation.totalPrice?.toFixed(2)}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: CONFIRMED ── */}
{step === 'confirmed' && createdReservation && paymentDone && (
  <div>
    {/* Success banner */}
    <div className="res-confirmed-banner">
      <div className="res-confirmed-checkmark">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div>
        <h2>Booking Confirmed</h2>
        <p>Your reservation at <strong>{createdReservation.hotelName}</strong> has been confirmed successfully.</p>
      </div>
    </div>

    {/* Booking details */}
    <div className="res-card">
      <h2>Booking Details</h2>
      <div className="res-summary-grid">
        <div className="res-summary-item"><span>Reservation ID</span><strong>#{createdReservation.id}</strong></div>
        <div className="res-summary-item"><span>Hotel</span><strong>{createdReservation.hotelName}</strong></div>
        <div className="res-summary-item"><span>Check-in</span><strong>{createdReservation.checkIn}</strong></div>
        <div className="res-summary-item"><span>Check-out</span><strong>{createdReservation.checkOut}</strong></div>
        <div className="res-summary-item"><span>Guests</span><strong>{createdReservation.numberOfPersons} person(s)</strong></div>
        <div className="res-summary-item"><span>Payment Method</span><strong>{paymentDone.method}</strong></div>
        <div className="res-summary-item"><span>Payment Status</span>
          <span className="res-status-pill" style={{ background: '#059669' }}>PAID</span>
        </div>
        <div className="res-summary-item"><span>Booking Status</span>
          <span className="res-status-pill" style={{ background: '#059669' }}>CONFIRMED</span>
        </div>
        <div className="res-summary-item total"><span>Amount Paid</span><strong className="res-total-amount">${paymentDone.amount?.toFixed(2)}</strong></div>
      </div>
    </div>

    {/* Documents */}
    <div className="res-card">
      <h2>Your Documents</h2>
      <p className="res-hint">Download your invoice or present the QR code at hotel check-in</p>
      <div className="res-confirmed-actions">
        <button className="res-doc-btn pdf" onClick={() => handlePdf(createdReservation.id)}>
          <div className="res-doc-icon pdf-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <strong>Download Invoice</strong>
            <span>PDF receipt for your records</span>
          </div>
        </button>
        <button className="res-doc-btn qr" onClick={() => handleQr(createdReservation.id)}>
          <div className="res-doc-icon qr-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="3" height="3"/>
            </svg>
          </div>
          <div>
            <strong>View QR Code</strong>
            <span>Present at hotel check-in</span>
          </div>
        </button>
      </div>
    </div>

    <div className="res-confirmed-footer">
      <button className="res-btn-primary" onClick={goHome}>
        Back to My Reservations
      </button>
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
            {reservations.map(r => (
              <div key={r.id} className="res-item">
                <div className="res-item-header">
                  <div>
                    <h3>{r.hotelName}</h3>
                    <span className="res-id">Reservation #{r.id}</span>
                  </div>
                  <span className="res-status" style={{ background: statusColor(r.status) }}>{r.status}</span>
                </div>
                <div className="res-item-details">
                  <div><span>📅</span> {r.checkIn} → {r.checkOut}</div>
                  <div><span>👥</span> {r.numberOfPersons} person(s)</div>
                  <div><span>💵</span> Total: <strong>${r.totalPrice?.toFixed(2)}</strong></div>
                </div>
                <div className="res-item-actions">
                  <button className="res-action-btn pdf" onClick={() => handlePdf(r.id)}>📄 Invoice PDF</button>
                  <button className="res-action-btn qr" onClick={() => handleQr(r.id)}>⬛ QR Code</button>
                  {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                    <button className="res-action-btn cancel" onClick={() => handleCancel(r.id)}>✕ Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}