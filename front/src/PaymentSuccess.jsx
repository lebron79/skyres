import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './PaymentPage.css'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [copied, setCopied] = useState(false)

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
    <div className="cx-overlay cx-overlay-success" role="dialog" aria-modal="true" aria-labelledby="cx-success-title">
      <div className="cx-overlay-bg" aria-hidden />
      <div className="cx-modal cx-modal-success">
        <div className="cx-success-burst" aria-hidden />
        <div className="cx-success-icon-wrap">
          <svg className="cx-success-check" viewBox="0 0 52 52" aria-hidden>
            <circle className="cx-success-check-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="cx-success-check-tick" fill="none" d="M14 27l8 8 16-18" />
          </svg>
        </div>
        <p className="cx-eyebrow cx-eyebrow-light">Payment confirmed</p>
        <h1 id="cx-success-title" className="cx-modal-title">You&apos;re all set</h1>
        <p className="cx-modal-body">
          Test payment completed. Your booking flow can hook webhooks next to mark orders paid and send email.
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
        <div className="cx-modal-actions">
          <Link to="/" className="cx-btn cx-btn-primary cx-btn-wide">Continue exploring</Link>
        </div>
      </div>
    </div>
  )
}
