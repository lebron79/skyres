import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import CheckoutProgress from './components/CheckoutProgress.jsx'
import { apiFetch } from './services/api.js'
import { decodeCheckoutName, humanizeApiError } from './checkoutUi.js'
import './PaymentPage.css'

function formatMoneyEur(amount) {
  if (amount == null || Number.isNaN(amount)) return null
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function PaymentPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const type = (searchParams.get('type') || '').toLowerCase()
  const name = useMemo(() => decodeCheckoutName(searchParams.get('name')), [searchParams])
  const rawPrice = searchParams.get('price')
  const priceNum = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN
  const priceLabel = Number.isFinite(priceNum) ? formatMoneyEur(priceNum) : null
  const id = searchParams.get('id')
  const refId = searchParams.get('refId') ?? id

  const isActivity = type === 'activity'
  const isGuide = type === 'guide'
  const isReservation = type === 'reservation'
  const valid = isActivity || isGuide || isReservation
  const canCheckout = valid && Number.isFinite(priceNum) && priceNum >= 0.5 && !!token

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  /** User must confirm order on Review before seeing Stripe (Pay). */
  const [checkoutPhase, setCheckoutPhase] = useState('review')

  const startCheckout = async () => {
    if (!canCheckout) return
    setErr(null)
    setBusy(true)
    try {
      const res = await apiFetch(
        '/api/payments/checkout',
        {
          method: 'POST',
          body: JSON.stringify({
            type,
            refId: refId ?? '',
            name,
            amountEur: priceNum,
          }),
        },
        token
      )
      if (res?.url) {
        window.location.href = res.url
        return
      }
      setErr('No checkout URL returned.')
    } catch (e) {
      setErr(humanizeApiError(e?.message || 'Checkout failed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="cx-root">
      <div className="cx-ambient" aria-hidden />
      <header className="cx-topbar">
        <Link to="/" className="cx-back">
          <span className="cx-back-icon" aria-hidden>←</span>
          SkyRes
        </Link>
      </header>

      <main className="cx-main">
        {valid && <CheckoutProgress phase={checkoutPhase === 'review' ? 'review' : 'pay'} />}

        {!valid ? (
          <div className="cx-panel cx-panel-solo">
            <div className="cx-panel-icon cx-panel-icon-warn" aria-hidden>!</div>
            <p className="cx-eyebrow">Checkout</p>
            <h1 className="cx-title">Nothing to pay yet</h1>
            <p className="cx-body">
              Pick an activity, guide, or complete a hotel reservation, then open checkout again.
            </p>
            <Link to="/" className="cx-btn cx-btn-primary">Browse SkyRes</Link>
          </div>
        ) : checkoutPhase === 'review' ? (
          <div className="cx-grid cx-grid-review">
            <section className="cx-panel cx-panel-review">
              <p className="cx-eyebrow">Order summary</p>
              <h1 className="cx-title cx-title-clamp">{name}</h1>
              <ul className="cx-rows">
                <li>
                  <span>Type</span>
                  <span className="cx-tag">
                    {isActivity ? 'Activity' : isGuide ? 'Guide' : 'Reservation'}
                  </span>
                </li>
                {refId != null && refId !== '' && (
                  <li>
                    <span>Reference</span>
                    <span className="cx-mono">#{refId}</span>
                  </li>
                )}
                {isGuide && priceLabel && (
                  <li>
                    <span>Rate</span>
                    <span>{priceLabel} / hr</span>
                  </li>
                )}
                {(isActivity || isReservation) && priceLabel && (
                  <li>
                    <span>Total (EUR)</span>
                    <span className="cx-price">{priceLabel}</span>
                  </li>
                )}
              </ul>
              {!priceLabel && (
                <p className="cx-hint">Set a price (min. €0.50) so checkout can run.</p>
              )}
              {priceLabel && Number.isFinite(priceNum) && priceNum < 0.5 && (
                <p className="cx-hint">Stripe needs at least €0.50 for a test charge.</p>
              )}
              {!token && (
                <p className="cx-hint cx-hint-warn">Session missing — go home and sign in again.</p>
              )}
              <div className="cx-review-actions">
                <button
                  type="button"
                  className="cx-btn cx-btn-primary cx-btn-wide"
                  disabled={!priceLabel || !Number.isFinite(priceNum) || priceNum < 0.5 || !token}
                  onClick={() => setCheckoutPhase('pay')}
                >
                  Continue to payment
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="cx-grid cx-grid-pay">
            <section className="cx-panel">
              <button type="button" className="cx-back-step" onClick={() => setCheckoutPhase('review')}>
                ← Back to review
              </button>
              <p className="cx-eyebrow">Order summary</p>
              <h1 className="cx-title cx-title-clamp">{name}</h1>
              <ul className="cx-rows">
                <li>
                  <span>Type</span>
                  <span className="cx-tag">
                    {isActivity ? 'Activity' : isGuide ? 'Guide' : 'Reservation'}
                  </span>
                </li>
                {refId != null && refId !== '' && (
                  <li>
                    <span>Reference</span>
                    <span className="cx-mono">#{refId}</span>
                  </li>
                )}
                {isGuide && priceLabel && (
                  <li>
                    <span>Rate</span>
                    <span>{priceLabel} / hr</span>
                  </li>
                )}
                {(isActivity || isReservation) && priceLabel && (
                  <li>
                    <span>Total (EUR)</span>
                    <span className="cx-price">{priceLabel}</span>
                  </li>
                )}
              </ul>
              {!priceLabel && (
                <p className="cx-hint">Set a price (min. €0.50) so checkout can run.</p>
              )}
              {priceLabel && Number.isFinite(priceNum) && priceNum < 0.5 && (
                <p className="cx-hint">Stripe needs at least €0.50 for a test charge.</p>
              )}
              {!token && (
                <p className="cx-hint cx-hint-warn">Session missing — go home and sign in again.</p>
              )}
            </section>

            <section className="cx-panel cx-panel-accent">
              <div className="cx-stripe-mark" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path fill="#635BFF" d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.684 6.104 1.872 4.56 3.09 3.79 4.914 3.79 7.005c0 3.261 1.872 4.748 6.635 6.358 2.478.831 3.356 1.664 3.356 2.9 0 1.012-.919 1.575-2.597 1.575-1.872 0-4.267-.919-6.09-2.065l-.919 5.57c2.065 1.012 4.748 1.575 7.322 1.575 2.748 0 4.9-.72 6.358-1.987 1.664-1.387 2.409-3.356 2.409-5.57 0-3.356-1.872-4.9-6.635-6.51z"/>
                </svg>
              </div>
              <p className="cx-eyebrow">Secure pay</p>
              <h2 className="cx-subtitle">Stripe Checkout (EUR)</h2>
              <p className="cx-body">
                You’ll finish on Stripe’s page (test mode). Try{' '}
                <strong className="cx-cc">4242 4242 4242 4242</strong>
                {' '}— any future expiry, any CVC.
              </p>
              {err && <div className="cx-alert" role="alert">{err}</div>}
              <button
                type="button"
                className={`cx-btn cx-btn-pay${canCheckout ? '' : ' cx-btn-pay-disabled'}`}
                disabled={!canCheckout || busy}
                onClick={startCheckout}
              >
                <span className="cx-btn-pay-inner">
                  {busy ? (
                    <>
                      <span className="cx-spinner" aria-hidden />
                      Opening Stripe…
                    </>
                  ) : (
                    <>Pay {priceLabel ?? 'now'}</>
                  )}
                </span>
              </button>
              {!canCheckout && priceLabel && priceNum >= 0.5 && !token && (
                <p className="cx-hint">Sign in required for checkout.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
