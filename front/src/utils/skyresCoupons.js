/** Mirrors backend CouponService — official Skyres codes (% shown for UI). */

export const SKYRES_COUPON_META = [
  { code: 'ILSKYRES1', pct: 7 },
  { code: 'FASKYRES3', pct: 8 },
  { code: 'AKSKYRES2', pct: 9 },
  { code: 'YNSKYRES4', pct: 10 },
]

const SKY = Object.fromEntries(SKYRES_COUPON_META.map((c) => [c.code, c.pct / 100]))

const LEGACY = {
  SKYRES10: 0.1,
  SKYRES20: 0.2,
  WELCOME: 0.15,
  SUMMER25: 0.25,
}

function normalize(code) {
  if (code == null || String(code).trim() === '') return null
  return String(code).trim().toUpperCase()
}

function discountOrZero(key) {
  if (key == null) return 0
  if (Object.prototype.hasOwnProperty.call(SKY, key)) return SKY[key]
  return LEGACY[key] ?? 0
}

export function isKnownCoupon(code) {
  return discountOrZero(normalize(code)) > 0
}

/**
 * @param {string|null|undefined} firstCode
 * @param {string|null|undefined} secondCode
 * @param {boolean} allowSecondCoupon
 * @returns {number} multiplier applied to subtotal (e.g. 0.9 for 10% off)
 */
export function priceMultiplier(firstCode, secondCode, allowSecondCoupon) {
  const c1 = normalize(firstCode)
  const c2 = normalize(secondCode)
  if (c1 == null) {
    if (c2 != null) throw new Error('Indiquez d’abord le premier code promo.')
    return 1
  }
  let m = 1 - discountOrZero(c1)
  if (c2 == null) return m
  if (!allowSecondCoupon) {
    throw new Error('Un seul code pour les comptes ayant déjà une réservation.')
  }
  if (c1 === c2) throw new Error('Impossible d’appliquer le même code deux fois.')
  m *= 1 - discountOrZero(c2)
  return m
}
