import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from './AuthContext.jsx'
import {
  isKnownCoupon,
  priceMultiplier,
  SKYRES_COUPON_META,
} from '../utils/skyresCoupons.js'
import { clearScratchSlotDraws } from '../utils/scratchSlotDraws.js'

/** Hotel nightly rates in DB are TND; destination estimatedBudget is EUR */
export const TND_PER_EUR = 3.42

export function tndToEur(tnd) {
  const n = Number(tnd)
  if (!Number.isFinite(n) || n <= 0) return 0
  return n / TND_PER_EUR
}

/** Same rules as the reservation booking step (local noon avoids DST edge). */
export function nightsBetweenStr(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const d0 = new Date(`${checkIn}T12:00:00`)
  const d1 = new Date(`${checkOut}T12:00:00`)
  const n = Math.round((d1 - d0) / 86400000)
  return n > 0 ? n : 0
}

function addDaysYmd(ymd, days) {
  const d = new Date(`${ymd}T12:00:00`)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export { SKYRES_COUPON_META }

const TripCartContext = createContext(null)

export function TripCartProvider({ children }) {
  const { user } = useAuth()
  const [destination, setDestination] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [nights, setNightsState] = useState(1)
  const [persons, setPersons] = useState(1)
  /** YYYY-MM-DD — shared with booking step & sidebar preview. */
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const checkInRef = useRef('')
  checkInRef.current = checkIn
  /** Up to two distinct uppercase codes (second only if user has zero prior reservations). */
  const [appliedCoupons, setAppliedCoupons] = useState([])

  const maxCouponSlots =
    user != null && Number(user.reservationCount) === 0 ? 2 : 1

  /** When both dates are valid, keep the “nights” number in sync for the sidebar control. */
  useEffect(() => {
    const nb = nightsBetweenStr(checkIn, checkOut)
    if (nb > 0) setNightsState(nb)
  }, [checkIn, checkOut])

  const clearCart = useCallback(() => {
    clearScratchSlotDraws()
    setDestination(null)
    setHotel(null)
    setNightsState(1)
    setPersons(1)
    setCheckIn('')
    setCheckOut('')
    setAppliedCoupons([])
  }, [])

  /** Call when picking another hotel so dates don’t carry over silently. */
  const resetStayDates = useCallback(() => {
    setCheckIn('')
    setCheckOut('')
    setNightsState(1)
  }, [])

  /** Leaving the reservation wizard (e.g. back to list): clear stay + coupons. */
  const resetBookingWizard = useCallback(() => {
    clearScratchSlotDraws()
    setCheckIn('')
    setCheckOut('')
    setNightsState(1)
    setAppliedCoupons([])
  }, [])

  /**
   * Sidebar “nuits” control: updates night count and, if check-in is set, moves check-out
   * so the stay length matches (same as editing the date range).
   */
  const setNights = useCallback((raw) => {
    const n = Math.max(1, Math.min(60, Number(raw) || 1))
    setNightsState(n)
    const ci = checkInRef.current?.trim()
    if (ci) setCheckOut(addDaysYmd(ci, n))
  }, [])

  const setTripDestination = useCallback((d) => {
    setDestination(d)
    setHotel(null)
  }, [])

  const setTripHotel = useCallback((h) => {
    if (!h) {
      setHotel(null)
      return
    }
    setHotel({
      id: h.id,
      name: h.name,
      pricePerNight: h.pricePerNight,
    })
  }, [])

  const applyCoupon = useCallback(
    (raw) => {
      const code = String(raw ?? '')
        .trim()
        .toUpperCase()
      if (!code) return { ok: false, message: 'Saisissez un code.' }
      if (!isKnownCoupon(code)) return { ok: false, message: 'Code promo non reconnu.' }

      const result = { ok: true, message: '' }
      setAppliedCoupons((prev) => {
        if (prev.some((c) => c === code)) {
          result.ok = false
          result.message = 'Ce code est déjà appliqué.'
          return prev
        }
        if (prev.length >= maxCouponSlots) {
          result.ok = false
          result.message =
            maxCouponSlots === 2
              ? 'Vous avez déjà 2 codes (maximum pour une première réservation).'
              : 'Un seul code autorisé (déjà une réservation sur ce compte).'
          return prev
        }
        return [...prev, code]
      })
      return result
    },
    [maxCouponSlots]
  )

  const removeCoupon = useCallback((index) => {
    setAppliedCoupons((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const summary = useMemo(() => {
    const destEur =
      destination?.priceEur != null && Number.isFinite(Number(destination.priceEur))
        ? Math.max(0, Number(destination.priceEur))
        : 0
    const fromDates = nightsBetweenStr(checkIn, checkOut)
    const n = fromDates > 0 ? fromDates : Math.max(1, nights)
    const p = Math.max(1, persons)
    let hotelEur = 0
    let nightEur = 0
    let hasHotel = false
    if (hotel) {
      hasHotel = true
      nightEur = tndToEur(hotel.pricePerNight)
      hotelEur = nightEur * n * p
    }
    const subtotalBeforeCoupons = destEur + hotelEur
    const c1 = appliedCoupons[0] ?? ''
    const c2 = appliedCoupons[1] ?? ''
    let mult = 1
    try {
      mult = priceMultiplier(c1 || null, c2 || null, maxCouponSlots === 2)
    } catch {
      mult = 1
    }
    const totalEur = subtotalBeforeCoupons * mult
    const discountEur = Math.max(0, subtotalBeforeCoupons - totalEur)
    return {
      destEur,
      hotelEur,
      subtotalBeforeCoupons,
      totalEur,
      discountEur,
      couponMultiplier: mult,
      appliedCoupons: [...appliedCoupons],
      maxCouponSlots,
      hasHotel,
      nightEur,
      nights: n,
      persons: p,
    }
  }, [destination, hotel, nights, persons, checkIn, checkOut, appliedCoupons, maxCouponSlots])

  const value = useMemo(
    () => ({
      destination,
      setTripDestination,
      hotel,
      setTripHotel,
      nights,
      setNights,
      checkIn,
      setCheckIn,
      checkOut,
      setCheckOut,
      persons,
      setPersons,
      clearCart,
      resetStayDates,
      resetBookingWizard,
      summary,
      appliedCoupons,
      applyCoupon,
      removeCoupon,
      maxCouponSlots,
    }),
    [
      destination,
      hotel,
      nights,
      setNights,
      checkIn,
      checkOut,
      persons,
      clearCart,
      resetStayDates,
      resetBookingWizard,
      summary,
      appliedCoupons,
      applyCoupon,
      removeCoupon,
      maxCouponSlots,
      setTripDestination,
      setTripHotel,
    ]
  )

  return (
    <TripCartContext.Provider value={value}>{children}</TripCartContext.Provider>
  )
}

export function useTripCart() {
  const ctx = useContext(TripCartContext)
  if (!ctx) {
    throw new Error('useTripCart must be used within TripCartProvider')
  }
  return ctx
}
