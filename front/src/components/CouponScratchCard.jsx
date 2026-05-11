import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { SKYRES_COUPON_META } from '../utils/skyresCoupons.js'
import { getOrAssignCodeForSlot } from '../utils/scratchSlotDraws.js'
import './CouponScratchCard.css'

const CANVAS_W = 340
const CANVAS_H = 152
const BRUSH_R = 24
/** Fraction of sampled pixels that must be “cleared” to validate reveal */
const REVEAL_THRESHOLD = 0.34

function pctForCode(code) {
  const row = SKYRES_COUPON_META.find((c) => c.code === code)
  return row?.pct ?? null
}

function sampleScratchProgress(ctx, w, h) {
  const step = 5
  let cleared = 0
  let total = 0
  const { data } = ctx.getImageData(0, 0, w, h)
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (Math.floor(y) * w + Math.floor(x)) * 4 + 3
      total++
      if (data[idx] < 48) cleared++
    }
  }
  return total > 0 ? cleared / total : 0
}

/**
 * Scratch foil to reveal one random SkyRes code; user must enter it below to apply (not auto-applied).
 */
export default function CouponScratchCard({
  applyCoupon,
  appliedCoupons,
  maxCouponSlots,
  variant = 'default',
}) {
  const canvasRef = useRef(null)
  const drawnCodeRef = useRef(null)
  const appliedCouponsRef = useRef(appliedCoupons)
  appliedCouponsRef.current = appliedCoupons

  const scratchingRef = useRef(false)
  /** True once enough foil is scratched away — code shown; no more scratching. */
  const revealDoneRef = useRef(false)
  const frameSkipRef = useRef(0)

  const [prizeCode, setPrizeCode] = useState(null)
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [hint, setHint] = useState('')
  const [scratchPct, setScratchPct] = useState(0)

  const slotsLeft =
    maxCouponSlots > 0 ? Math.max(0, maxCouponSlots - (appliedCoupons?.length ?? 0)) : 0
  const exhausted = slotsLeft <= 0

  const setupRound = useCallback(() => {
    revealDoneRef.current = false
    scratchingRef.current = false
    setScratchRevealed(false)
    setCouponInput('')
    setScratchPct(0)
    setHint('')
    const applied = appliedCouponsRef.current ?? []
    const slotIndex = applied.length
    const code = exhausted ? null : getOrAssignCodeForSlot(slotIndex, applied)
    drawnCodeRef.current = code
    setPrizeCode(code)

    const canvas = canvasRef.current
    if (!canvas || !code) return

    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#d6d3d1')
    g.addColorStop(0.45, '#f5f5f4')
    g.addColorStop(1, '#a8a29e')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i < 12; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * w, Math.random() * h)
      ctx.lineTo(Math.random() * w, Math.random() * h)
      ctx.stroke()
    }
    ctx.fillStyle = 'rgba(64, 64, 64, 0.58)'
    ctx.font = '700 14px ui-sans-serif, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Grattez pour gagner plus de 9 % !', w / 2, h / 2 - 6)
    ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(64, 64, 64, 0.42)'
    ctx.fillText('Réduction mystère jusqu’à 10 %', w / 2, h / 2 + 14)
    ctx.restore()
  }, [exhausted])

  useLayoutEffect(() => {
    setupRound()
  }, [setupRound])

  const prevAppliedLenRef = useRef(appliedCoupons?.length ?? 0)
  useLayoutEffect(() => {
    const len = appliedCoupons?.length ?? 0
    if (len < prevAppliedLenRef.current) {
      setupRound()
    }
    prevAppliedLenRef.current = len
  }, [appliedCoupons, setupRound])

  const completeReveal = useCallback(() => {
    if (revealDoneRef.current) return
    const canvas = canvasRef.current
    const code = drawnCodeRef.current
    if (!canvas || !code) return

    const ctx = canvas.getContext('2d')
    const ratio = sampleScratchProgress(ctx, canvas.width, canvas.height)
    setScratchPct(Math.round(ratio * 100))

    if (ratio < REVEAL_THRESHOLD) return

    revealDoneRef.current = true
    setScratchRevealed(true)
    setCouponInput(code)
    setHint(
      'Code dévoilé ! Saisissez-le ci-dessous (ou modifiez-le si besoin) puis cliquez sur « Appliquer ».'
    )
  }, [])

  const tryFinalize = useCallback(() => {
    completeReveal()
  }, [completeReveal])

  const scratchAt = useCallback(
    (nx, ny) => {
      const canvas = canvasRef.current
      if (!canvas || revealDoneRef.current || !drawnCodeRef.current) return
      const ctx = canvas.getContext('2d')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(nx, ny, BRUSH_R, 0, Math.PI * 2)
      ctx.fill()

      frameSkipRef.current++
      if (frameSkipRef.current % 4 === 0) {
        const r = sampleScratchProgress(ctx, canvas.width, canvas.height)
        setScratchPct(Math.round(r * 100))
        if (r >= REVEAL_THRESHOLD) completeReveal()
      }
    },
    [completeReveal]
  )

  const pointerPos = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    const clientY = e.clientY ?? e.touches?.[0]?.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const onPointerDown = (e) => {
    if (exhausted || !drawnCodeRef.current || revealDoneRef.current) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    scratchingRef.current = true
    const { x, y } = pointerPos(e)
    scratchAt(x, y)
  }

  const onPointerMove = (e) => {
    if (!scratchingRef.current || exhausted || revealDoneRef.current) return
    const { x, y } = pointerPos(e)
    scratchAt(x, y)
  }

  const onPointerUp = () => {
    scratchingRef.current = false
    tryFinalize()
  }

  const revealAll = () => {
    const canvas = canvasRef.current
    if (!canvas || !drawnCodeRef.current || revealDoneRef.current || exhausted) return
    const ctx = canvas.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setScratchPct(100)
    completeReveal()
  }

  const tryApplyManual = useCallback(() => {
    setHint('')
    const raw = couponInput.trim()
    if (!raw) {
      setHint('Saisissez le code promo.')
      return
    }
    const codeUp = raw.toUpperCase()
    const beforeLen = appliedCoupons?.length ?? 0
    const r = applyCoupon(raw)
    if (r.ok) {
      appliedCouponsRef.current = [...(appliedCoupons ?? []), codeUp]
      const nextLen = beforeLen + 1
      if (nextLen < maxCouponSlots) {
        setHint('Code appliqué ! Grattez une nouvelle carte pour un second code.')
        setupRound()
      } else {
        setHint(`Bravo ! Code ${codeUp} appliqué (−${pctForCode(codeUp)}%).`)
      }
    } else {
      setHint(r.message || 'Impossible d’appliquer ce code.')
    }
  }, [applyCoupon, appliedCoupons, couponInput, maxCouponSlots, setupRound])

  const pct = prizeCode ? pctForCode(prizeCode) : null

  const rootClass = ['csc', variant !== 'default' && `csc--${variant}`].filter(Boolean).join(' ')

  const feedbackClass =
    hint.includes('Bravo') || hint.includes('Code appliqué')
      ? 'csc-feedback--ok'
      : hint.includes('dévoilé') || hint.includes('Saisissez-le')
        ? 'csc-feedback--info'
        : 'csc-feedback--warn'

  return (
    <div className={rootClass}>
      <div className="csc-marketing">
        <p className="csc-marketing-kicker">Offre SkyRes</p>
        <p className="csc-marketing-headline">
          Grattez la carte pour gagner <strong>plus de 9&nbsp;%</strong> de réduction
        </p>
        <p className="csc-marketing-sub">Une surprise vous attend — puis saisissez votre code pour l’activer.</p>
      </div>

      <div className="csc-head">
        <span className="csc-head-icon" aria-hidden>
          ✨
        </span>
        <div>
          <p className="csc-title">Carte à gratter</p>
          <p className="csc-sub">
            Le montant exact reste <strong>secret</strong> jusqu’à ce que vous grattiez : vous ne verrez que{' '}
            <strong>votre gain</strong>, pas la liste des autres codes. Retirer un code du panier ne change pas votre
            tirage — un seul résultat par case (pour cette session).
          </p>
        </div>
      </div>

      {exhausted ? (
        <p className="csc-note csc-note--muted">Nombre maximum de codes atteint pour cette réservation.</p>
      ) : !prizeCode ? (
        <p className="csc-note csc-note--muted">Aucun code disponible à tirer.</p>
      ) : (
        <>
          <div className="csc-card">
            <div className="csc-prize">
              <span className="csc-prize-label">{scratchRevealed ? 'Votre code gagné' : 'À découvrir'}</span>
              {scratchRevealed && prizeCode ? (
                <>
                  <span className="csc-prize-code">{prizeCode}</span>
                  {pct != null && <span className="csc-prize-pct">−{pct}% sur le sous-total</span>}
                </>
              ) : (
                <>
                  <span className="csc-prize-mystery" aria-hidden>
                    ? ? ? ? ?
                  </span>
                  <span className="csc-prize-hint-mystery">Grattez la zone pour révéler</span>
                </>
              )}
            </div>
            <canvas
              ref={canvasRef}
              className={`csc-canvas ${scratchRevealed ? 'csc-canvas--disabled' : ''}`}
              width={CANVAS_W}
              height={CANVAS_H}
              role="application"
              aria-label="Carte à gratter : révéler le code promo"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>
          <div className="csc-toolbar">
            <span className="csc-progress" aria-live="polite">
              {!scratchRevealed && scratchPct > 0 ? `Gratté ~${scratchPct}%` : '\u00a0'}
            </span>
            {!scratchRevealed && (
              <button type="button" className="csc-skip" onClick={revealAll}>
                Révéler sans gratter
              </button>
            )}
          </div>

          {scratchRevealed && (
            <div className="csc-apply">
              <label className="csc-apply-label" htmlFor={`csc-input-${variant}`}>
                Activer ce code sur votre panier
              </label>
              <div className="csc-apply-row">
                <input
                  id={`csc-input-${variant}`}
                  type="text"
                  className="csc-apply-input"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="CODE PROMO"
                  maxLength={24}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" className="csc-apply-btn" onClick={tryApplyManual}>
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {hint && (
        <p className={`csc-feedback ${feedbackClass}`} role="status">
          {hint}
        </p>
      )}
    </div>
  )
}
