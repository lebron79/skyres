import { Link, useLocation } from 'react-router-dom'
import { useTripCart } from '../context/TripCartContext.jsx'
import CouponScratchCard from './CouponScratchCard.jsx'
import './TripCartSidebar.css'

function formatEur(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number(n))
}

export default function TripCartSidebar() {
  const location = useLocation()
  const {
    destination,
    hotel,
    setNights,
    persons,
    setPersons,
    summary,
    clearCart,
    appliedCoupons,
    applyCoupon,
    removeCoupon,
    maxCouponSlots,
  } = useTripCart()

  const path = location.pathname
  const show =
    path === '/destinations' ||
    path === '/hotels' ||
    path === '/reservations'
  const hideForPaymentFlow =
    path === '/payment' || path === '/payment/success' || path === '/payment/cancel'

  if (!show || !destination || hideForPaymentFlow) return null

  return (
    <aside className="trip-cart" aria-label="Panier voyage">
      <div className="trip-cart-inner">
        <div className="trip-cart-head">
          <h2 className="trip-cart-title">Votre voyage</h2>
          <button type="button" className="trip-cart-clear" onClick={clearCart}>
            Vider
          </button>
        </div>

        <div className="trip-cart-block">
          <div className="trip-cart-label">Destination</div>
          <div className="trip-cart-line">
            <span>
              {destination.city}, {destination.country}
            </span>
            <strong>{formatEur(summary.destEur)}</strong>
          </div>
          <p className="trip-cart-hint">Forfait lieu (une fois) — payé en € au checkout.</p>
        </div>

        {hotel ? (
          <div className="trip-cart-block">
            <div className="trip-cart-label">Hôtel</div>
            <div className="trip-cart-line trip-cart-line--stack">
              <span className="trip-cart-hotel-name">{hotel.name}</span>
              <span className="trip-cart-muted">
                {formatEur(summary.nightEur)} / nuit × {summary.nights} nuit
                {summary.nights > 1 ? 's' : ''} × {summary.persons} pers.
              </span>
              <strong>{formatEur(summary.hotelEur)}</strong>
            </div>
          </div>
        ) : (
          <p className="trip-cart-pick">Choisissez un hôtel sur la page Hôtels pour mettre à jour le total.</p>
        )}

        <div className="trip-cart-controls">
          <label>
            Nuits (aperçu)
            <input
              type="number"
              min={1}
              max={60}
              value={summary.nights}
              onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
          <label>
            Personnes
            <input
              type="number"
              min={1}
              max={20}
              value={persons}
              onChange={(e) => setPersons(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
        </div>

        <div className="trip-cart-block trip-cart-coupon-block">
          <div className="trip-cart-label">Codes promo</div>
          <p className="trip-cart-coupon-hint">
            {maxCouponSlots === 2
              ? 'Première réservation : jusqu’à 2 codes — une carte à gratter par code.'
              : 'Un seul code par réservation (compte déjà une réservation).'}
          </p>
          <CouponScratchCard
            applyCoupon={applyCoupon}
            appliedCoupons={appliedCoupons}
            maxCouponSlots={maxCouponSlots}
            variant="sidebar"
          />
          {appliedCoupons.length > 0 && (
            <ul className="trip-cart-coupon-chips" aria-label="Codes appliqués">
              {appliedCoupons.map((code, i) => (
                <li key={`${code}-${i}`}>
                  <span className="trip-cart-chip">{code}</span>
                  <button
                    type="button"
                    className="trip-cart-chip-remove"
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

        {summary.discountEur > 0.005 && (
          <div className="trip-cart-discount">
            <span>Réduction coupons</span>
            <strong>−{formatEur(summary.discountEur)}</strong>
          </div>
        )}

        <div className="trip-cart-total">
          <span>Total estimé</span>
          <strong>{formatEur(summary.totalEur)}</strong>
        </div>

        <div className="trip-cart-actions">
          {hotel ? (
            <Link className="trip-cart-btn trip-cart-btn--primary" to="/reservations">
              Continuer vers réservation
            </Link>
          ) : (
            <Link className="trip-cart-btn trip-cart-btn--ghost" to="/hotels">
              Voir les hôtels
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
