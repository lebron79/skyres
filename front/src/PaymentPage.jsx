import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { apiFetch } from './services/api.js'
import { decodeCheckoutName, humanizeApiError } from './checkoutUi.js'
import './PaymentPage.css'

function formatMoney(amount) {
  if (amount == null || Number.isNaN(amount)) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default function PaymentPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const type = (searchParams.get('type') || '').toLowerCase()
  const name = useMemo(() => decodeCheckoutName(searchParams.get('name')), [searchParams])
  const rawPrice = searchParams.get('price')
  const priceNum = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN
  const priceLabel = Number.isFinite(priceNum) ? formatMoney(priceNum) : null
  const id = searchParams.get('id')

  const isActivity = type === 'activity'
  const isGuide = type === 'guide'
  const valid = isActivity || isGuide
  const canCheckout = valid && Number.isFinite(priceNum) && priceNum >= 0.5 && !!token

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

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
            refId: id ?? '',
            name,
            amountUsd: priceNum,
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
        <ol className="cx-steps" aria-label="Checkout progress">
          <li className="cx-step cx-step-done">
            <span className="cx-step-dot">1</span>
            <span>Review</span>
          </li>
          <li className="cx-step cx-step-active">
            <span className="cx-step-dot">2</span>
            <span>Pay</span>
          </li>
          <li className="cx-step">
            <span className="cx-step-dot">3</span>
            <span>Done</span>
          </li>
        </ol>

        {!valid ? (
          <div className="cx-panel cx-panel-solo">
            <div className="cx-panel-icon cx-panel-icon-warn" aria-hidden>!</div>
            <p className="cx-eyebrow">Checkout</p>
            <h1 className="cx-title">Nothing to pay yet</h1>
            <p className="cx-body">
              Pick an activity or guide on the home page, then use Book again to open checkout.
            </p>
            <Link to="/" className="cx-btn cx-btn-primary">Browse SkyRes</Link>
          </div>
        ) : (
          <div className="cx-grid">
            <section className="cx-panel">
              <p className="cx-eyebrow">Order summary</p>
              <h1 className="cx-title cx-title-clamp">{name}</h1>
              <ul className="cx-rows">
                <li>
                  <span>Type</span>
                  <span className="cx-tag">{isActivity ? 'Activity' : 'Guide'}</span>
                </li>
                {id != null && id !== '' && (
                  <li>
                    <span>Reference</span>
                    <span className="cx-mono">#{id}</span>
                  </li>
                )}
                {isGuide && priceLabel && (
                  <li>
                    <span>Rate</span>
                    <span>{priceLabel} / hr</span>
                  </li>
                )}
                {isActivity && priceLabel && (
                  <li>
                    <span>Total</span>
                    <span className="cx-price">{priceLabel}</span>
                  </li>
                )}
              </ul>
              {!priceLabel && (
                <p className="cx-hint">Set a price in admin (min. $0.50) so checkout can run.</p>
              )}
              {priceLabel && Number.isFinite(priceNum) && priceNum < 0.5 && (
                <p className="cx-hint">Stripe needs at least $0.50 for a test charge.</p>
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
              <h2 className="cx-subtitle">Stripe Checkout</h2>
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
