import { SKYRES_COUPON_META } from './skyresCoupons.js'

/** Session-scoped scratch outcomes per slot index — prevents rerolling after removing a coupon. */
export const SCRATCH_SLOT_DRAWS_KEY = 'skyres_scratch_slot_draws_v1'

export function clearScratchSlotDraws() {
  try {
    sessionStorage.removeItem(SCRATCH_SLOT_DRAWS_KEY)
  } catch {
    /* ignore */
  }
}

function loadMap() {
  try {
    const s = sessionStorage.getItem(SCRATCH_SLOT_DRAWS_KEY)
    if (!s) return {}
    const o = JSON.parse(s)
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}

function saveMap(map) {
  try {
    sessionStorage.setItem(SCRATCH_SLOT_DRAWS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function poolWithoutApplied(appliedCoupons) {
  const applied = new Set((appliedCoupons ?? []).map((c) => String(c).toUpperCase()))
  return SKYRES_COUPON_META.map((c) => c.code).filter((code) => !applied.has(code))
}

/**
 * Returns the fixed random code for this slot index (0 = first coupon slot, 1 = second).
 * Same value for the lifetime of the tab session unless {@link clearScratchSlotDraws} runs.
 */
export function getOrAssignCodeForSlot(slotIndex, appliedCoupons) {
  const pool = poolWithoutApplied(appliedCoupons)
  if (pool.length === 0) return null

  const key = String(Math.max(0, Math.floor(slotIndex)))
  const map = loadMap()
  const existing = map[key]

  if (existing && pool.includes(existing)) return existing

  const next = { ...map }
  if (existing && !pool.includes(existing)) delete next[key]

  const fresh = pool[Math.floor(Math.random() * pool.length)]
  next[key] = fresh
  saveMap(next)
  return fresh
}
