import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTripCart } from './context/TripCartContext.jsx'
import CheckoutProgress from './components/CheckoutProgress.jsx'
import './PaymentPage.css'

const HOME_REDIRECT_SECONDS = 5

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { clearCart } = useTripCart()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(HOME_REDIRECT_SECONDS)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/', { replace: true })
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, navigate])

  const copyId = async () => {
    if (!sessionId) return
    try {
      await navigator.clipboard.writeText(sessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="cx-root">
      <div className="cx-ambient" aria-hidden />
      <header className="cx-topbar">
        <Link to="/" className="cx-back">
          <span className="cx-back-icon" aria-hidden>
            ←
          </span>
          SkyRes
        </Link>
      </header>

      <main className="cx-main cx-main-done">
        <CheckoutProgress phase="done" />

        <div className="cx-done-wrap">
          <div className="cx-done-card cx-modal-success">
            <div className="cx-success-burst" aria-hidden />
            <div className="cx-success-icon-wrap">
              <svg className="cx-success-check" viewBox="0 0 52 52" aria-hidden>
                <circle className="cx-success-check-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="cx-success-check-tick" fill="none" d="M14 27l8 8 16-18" />
              </svg>
            </div>
            <p className="cx-eyebrow cx-eyebrow-light">Payment confirmed</p>
            <h1 className="cx-modal-title">You&apos;re all set</h1>
            <p className="cx-modal-body">
              Test payment completed. Your booking flow can hook webhooks next to mark orders paid and send
              email.
            </p>
            {sessionId && (
              <div className="cx-receipt">
                <span className="cx-receipt-label">Stripe session</span>
                <code className="cx-receipt-code">{sessionId}</code>
                <button type="button" className="cx-copy-btn" onClick={copyId}>
                  {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>
            )}
            <p className="cx-countdown" role="status">
              {secondsLeft > 0
                ? `Returning to the home page in ${secondsLeft}s…`
                : 'Redirecting…'}
            </p>
            <div className="cx-modal-actions">
              <Link to="/" className="cx-btn cx-btn-primary cx-btn-wide">
                Continue to home now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
