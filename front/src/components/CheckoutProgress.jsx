/**
 * Shared checkout stepper: Review → Pay → Done.
 * @param {'review' | 'pay' | 'done'} phase
 */
export default function CheckoutProgress({ phase = 'review' }) {
  const activeIndex = phase === 'review' ? 0 : phase === 'pay' ? 1 : 2
  const cls = (i) => {
    if (i < activeIndex) return 'cx-step cx-step-done'
    if (i === activeIndex) return 'cx-step cx-step-active'
    return 'cx-step'
  }
  return (
    <ol className="cx-steps" aria-label="Checkout progress">
      <li className={cls(0)}>
        <span className="cx-step-dot">1</span>
        <span>Review</span>
      </li>
      <li className={cls(1)}>
        <span className="cx-step-dot">2</span>
        <span>Pay</span>
      </li>
      <li className={cls(2)}>
        <span className="cx-step-dot">3</span>
        <span>Done</span>
      </li>
    </ol>
  )
}
