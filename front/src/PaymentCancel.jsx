import { Link } from 'react-router-dom'
import './PaymentPage.css'

export default function PaymentCancel() {
  return (
    <div className="cx-overlay cx-overlay-cancel" role="dialog" aria-modal="true" aria-labelledby="cx-cancel-title">
      <div className="cx-overlay-bg" aria-hidden />
      <div className="cx-modal cx-modal-cancel">
        <div className="cx-cancel-icon" aria-hidden>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="2" opacity="0.35" />
            <path d="M20 20l16 16M36 20L20 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="cx-eyebrow cx-eyebrow-amber">Checkout closed</p>
        <h1 id="cx-cancel-title" className="cx-modal-title">No charge made</h1>
        <p className="cx-modal-body">
          You left Stripe before paying. Nothing was billed — pick your experience again whenever you like.
        </p>
        <div className="cx-modal-actions cx-modal-actions-split">
          <Link to="/" className="cx-btn cx-btn-primary cx-btn-wide">Back to SkyRes</Link>
          <Link to="/#activities" className="cx-btn cx-btn-ghost">Browse activities</Link>
        </div>
      </div>
    </div>
  )
}
