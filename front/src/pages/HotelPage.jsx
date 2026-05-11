// ============================================================
// src/pages/HotelsPage.jsx
// ============================================================
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { hotelAPI } from '../services/hotelAPI'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTripCart } from '../context/TripCartContext.jsx'
import { API_BASE } from '../services/api.js'
import './HotelPage.css'

/** Stored nightly price is in TND (د.ت) — show EUR using indicative rate for UI */
const TND_PER_EUR = 3.42

const HP_CAROUSEL_GAP = 22
const HP_CAROUSEL_AUTO_MS = 2800
/** Max dots shown (scroll is still mapped across the full strip). */
const HOTEL_CAROUSEL_MAX_DOTS = 15

function tndToEur(tnd) {
  const n = Number(tnd)
  if (!Number.isFinite(n) || n <= 0) return null
  return n / TND_PER_EUR
}

function formatHotelNightPrice(tnd) {
  const eur = tndToEur(tnd)
  if (eur == null) return { line: `${tnd} D / nuit`, sub: null }
  const eurStr = eur >= 100 ? eur.toFixed(0) : eur.toFixed(2)
  return { line: `≈ ${eurStr} € / nuit`, sub: `(${Number(tnd)} D)` }
}

// ─── Icônes (identiques) ─────────────────────────────────────────
const SearchIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
)
const StarIcon = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)



// ─── Formulaire vide – conforme à l'entité Hotel ────────────
const EMPTY_FORM = {
  name: '',
  description: '',
  address: '',
  stars: 3,
  pricePerNight: '',
  available: true,
  photoUrl: '',
  averageRating: '',
  distanceToCenter: '',
  hasOutdoorPool: false,
  hasIndoorPool: false,
  hasBeach: false,
  hasParking: false,
  hasSpa: false,
  hasAirportShuttle: false,
  hasFitnessCenter: false,
  hasBar: false,
  destinationId: null,      // à remplir avec un vrai ID depuis une liste déroulante
}

// ─── Modal de création / édition ────────────────────────────
// ─── Modal de création / édition (corrigée) ─────────────────
function HotelModal({ initial, onSave, onClose, saving, destinations }) {
  // Initialisation correcte du destinationId si l'hôtel a une destination
  const getInitialForm = () => {
    const base = { ...EMPTY_FORM, ...initial }
    if (initial?.destination?.id) {
      base.destinationId = initial.destination.id
    }
    return base
  }

  const [form, setForm] = useState(getInitialForm)

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const isValid = form.name.trim() && form.address.trim() && form.pricePerNight > 0

  return (
    <div className="hp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hp-modal">
        <div className="hp-modal-header">
          <h2 className="hp-modal-title">
            {initial?.id ? 'Modifier l’hôtel' : 'Nouvel hôtel'}
          </h2>
          <button className="hp-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="hp-form-grid">
          <div className="hp-field hp-field--full">
            <label>Nom *</label>
            <input value={form.name} onChange={set('name')} placeholder="Hôtel Magnifique" />
          </div>
          <div className="hp-field hp-field--full">
            <label>Adresse *</label>
            <input value={form.address} onChange={set('address')} placeholder="12 rue de la Paix, Paris" />
          </div>
          <div className="hp-field">
            <label>Étoiles (1‑5)</label>
            <input type="number" min="1" max="5" value={form.stars} onChange={set('stars')} />
          </div>
          <div className="hp-field">
            <label>Prix / nuit (D) *</label>
            <input type="number" min="0" step="1" value={form.pricePerNight} onChange={set('pricePerNight')} />
          </div>
          <div className="hp-field">
            <label>Note /10</label>
            <input type="number" min="0" max="10" step="0.1" value={form.averageRating} onChange={set('averageRating')} />
          </div>
          <div className="hp-field">
            <label>Distance centre (km)</label>
            <input type="number" min="0" step="0.1" value={form.distanceToCenter} onChange={set('distanceToCenter')} />
          </div>
          <div className="hp-field hp-field--full">
            <label>URL photo</label>
            <input value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://..." />
          </div>
          <div className="hp-field hp-field--full">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} />
          </div>

      {destinations && destinations.length > 0 && (
            <div className="hp-field hp-field--full">
              <label>Destination associée</label>
              <select value={form.destinationId || ''} onChange={set('destinationId')}>
                <option value="">Aucune</option>
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.city}, {d.country}   {/* ← correction : affichage ville + pays */}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Équipements (checkboxes) */}
          <div className="hp-field-group">
            <label className="hp-label-block">Équipements</label>
            <div className="hp-checkbox-grid">
              <label><input type="checkbox" checked={form.hasOutdoorPool} onChange={set('hasOutdoorPool')} /> Piscine ext.</label>
              <label><input type="checkbox" checked={form.hasIndoorPool} onChange={set('hasIndoorPool')} /> Piscine int.</label>
              <label><input type="checkbox" checked={form.hasBeach} onChange={set('hasBeach')} /> Accès plage</label>
              <label><input type="checkbox" checked={form.hasParking} onChange={set('hasParking')} /> Parking</label>
              <label><input type="checkbox" checked={form.hasSpa} onChange={set('hasSpa')} /> Spa</label>
              <label><input type="checkbox" checked={form.hasAirportShuttle} onChange={set('hasAirportShuttle')} /> Navette aéroport</label>
              <label><input type="checkbox" checked={form.hasFitnessCenter} onChange={set('hasFitnessCenter')} /> Fitness</label>
              <label><input type="checkbox" checked={form.hasBar} onChange={set('hasBar')} /> Bar</label>
            </div>
          </div>

          <div className="hp-field hp-field--checkbox">
            <label><input type="checkbox" checked={form.available} onChange={set('available')} /> Disponible</label>
          </div>
        </div>

        <div className="hp-modal-actions">
          <button className="hp-btn hp-btn--ghost" onClick={onClose}>Annuler</button>
          <button
            className="hp-btn hp-btn--primary"
            disabled={saving || !isValid}
            onClick={() => onSave(form)}
          >
            {saving ? 'Enregistrement…' : initial?.id ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}

function resolveHotelPhotoUrl(url) {
  if (!url || !String(url).trim()) return null
  const s = String(url).trim()
  if (/^https?:\/\//i.test(s)) return s
  const path = s.startsWith('/') ? s : `/${s}`
  return `${API_BASE}${path}`
}

// ─── Modal de consultation (détails) ─────────────────────────
function ViewHotelModal({ hotel, onClose }) {
  const [heroFailed, setHeroFailed] = useState(false)
  if (!hotel) return null

  const rawPhoto = hotel.photoUrl && String(hotel.photoUrl).trim()
  const heroSrc = rawPhoto && !heroFailed ? resolveHotelPhotoUrl(rawPhoto) : null

  const nightEur = tndToEur(hotel.pricePerNight)
  const nightPriceDisplay =
    nightEur != null
      ? `${nightEur >= 100 ? nightEur.toFixed(0) : nightEur.toFixed(2)} €`
      : null

  const destBudget =
    hotel.destination?.estimatedBudget != null && Number(hotel.destination.estimatedBudget) > 0
      ? Number(hotel.destination.estimatedBudget).toFixed(0)
      : null

  const destLabel = hotel.destination
    ? [hotel.destination.city, hotel.destination.country].filter(Boolean).join(', ')
    : null

  const amenityItems = [
    hotel.hasOutdoorPool && { key: 'pool-o', icon: '🏊', label: 'Piscine ext.' },
    hotel.hasIndoorPool && { key: 'pool-i', icon: '🏊', label: 'Piscine int.' },
    hotel.hasBeach && { key: 'beach', icon: '🏖️', label: 'Plage' },
    hotel.hasParking && { key: 'park', icon: '🅿️', label: 'Parking' },
    hotel.hasSpa && { key: 'spa', icon: '💆', label: 'Spa' },
    hotel.hasAirportShuttle && { key: 'shuttle', icon: '🚌', label: 'Navette' },
    hotel.hasFitnessCenter && { key: 'gym', icon: '🏋️', label: 'Fitness' },
    hotel.hasBar && { key: 'bar', icon: '🍹', label: 'Bar' },
  ].filter(Boolean)

  return (
    <div className="hp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="hp-modal hp-modal--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hp-view-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="hp-detail-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        <div className="hp-detail-hero">
          {heroSrc ? (
            <img
              src={heroSrc}
              alt=""
              className="hp-detail-hero-img"
              loading="eager"
              decoding="async"
              onError={() => setHeroFailed(true)}
            />
          ) : (
            <div className="hp-detail-hero-placeholder" aria-hidden>
              <span>🏨</span>
            </div>
          )}
          <div className="hp-detail-hero-scrim" aria-hidden />
          <div className="hp-detail-hero-badges">
            <span className="hp-detail-badge hp-detail-badge--stars" aria-label={`${hotel.stars} étoiles`}>
              {'★'.repeat(Math.min(5, Math.max(1, hotel.stars || 1)))}
            </span>
            {hotel.averageRating != null && (
              <span className="hp-detail-badge hp-detail-badge--rating">
                <StarIcon /> {Number(hotel.averageRating).toFixed(1)} / 10
              </span>
            )}
          </div>
        </div>

        <div className="hp-detail-body">
          {destLabel && <p className="hp-detail-kicker">{destLabel}</p>}
          <h2 id="hp-view-title" className="hp-detail-name">
            {hotel.name}
          </h2>

          <div className="hp-detail-stats">
            <div className="hp-detail-stat">
              <span className="hp-detail-stat-label">Prix / nuit</span>
              <span className="hp-detail-stat-value">
                {nightPriceDisplay != null ? (
                  <>
                    ≈ {nightPriceDisplay}
                    <span className="hp-detail-stat-sub"> ({hotel.pricePerNight} D)</span>
                  </>
                ) : (
                  `${hotel.pricePerNight} D`
                )}
              </span>
            </div>
            <div className="hp-detail-stat">
              <span className="hp-detail-stat-label">Centre-ville</span>
              <span className="hp-detail-stat-value">{hotel.distanceToCenter ?? '—'} km</span>
            </div>
            <div className="hp-detail-stat">
              <span className="hp-detail-stat-label">Disponibilité</span>
              <span className={`hp-detail-stat-value ${hotel.available ? 'hp-detail-stat-value--ok' : ''}`}>
                {hotel.available ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>

          {destBudget != null && (
            <div className="hp-detail-callout" role="note">
              <span className="hp-detail-callout-title">Forfait destination</span>
              <p className="hp-detail-callout-text">
                <strong>{destBudget} €</strong> ajoutés une seule fois au total de votre séjour (en euros), avec
                l’hébergement.
              </p>
            </div>
          )}

          <dl className="hp-detail-dl">
            <div className="hp-detail-dl-row">
              <dt>Adresse</dt>
              <dd>{hotel.address || '—'}</dd>
            </div>
            {destLabel && (
              <div className="hp-detail-dl-row">
                <dt>Destination</dt>
                <dd>{destLabel}</dd>
              </div>
            )}
            <div className="hp-detail-dl-row hp-detail-dl-row--muted">
              <dt>Réf.</dt>
              <dd>#{hotel.id}</dd>
            </div>
          </dl>

          <section className="hp-detail-section">
            <h3 className="hp-detail-section-title">Équipements</h3>
            {amenityItems.length > 0 ? (
              <ul className="hp-detail-amenities">
                {amenityItems.map((a) => (
                  <li key={a.key} className="hp-detail-amenity">
                    <span aria-hidden>{a.icon}</span> {a.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hp-detail-empty">Aucun équipement renseigné.</p>
            )}
          </section>

          {hotel.description && (
            <section className="hp-detail-section">
              <h3 className="hp-detail-section-title">À propos</h3>
              <p className="hp-detail-desc">{hotel.description}</p>
            </section>
          )}
        </div>

        <div className="hp-detail-footer">
          <button type="button" className="hp-btn hp-btn--primary hp-detail-footer-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
// ─── Carte d’un hôtel ───────────────────────────────────────
function HotelCard({ hotel, onEdit, onDelete, onView, onReserve, deleting, isAdmin }) {
  const [imgFailed, setImgFailed] = useState(false)
  const photo = hotel.photoUrl && String(hotel.photoUrl).trim()
  const showPhoto = photo && !imgFailed
  const price = formatHotelNightPrice(hotel.pricePerNight)

  return (
    <article className="hp-card">
      <div className="hp-card-media">
        {showPhoto ? (
          <img
            className="hp-card-img"
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="hp-card-media-placeholder" aria-hidden>
            <span className="hp-card-media-placeholder-icon">🏨</span>
          </div>
        )}
        {hotel.stars >= 4 && <span className="hp-trending-badge">🏆 Très bien noté</span>}
      </div>
      <div className="hp-card-body">
        <h3 className="hp-card-name">{hotel.name}</h3>
        <p className="hp-card-location">{hotel.address}</p>
        {hotel.description && (
          <p className="hp-card-desc">
            {hotel.description.length > 100 ? hotel.description.slice(0,100)+'…' : hotel.description}
          </p>
        )}
        <div className="hp-card-tags">
          <span className="hp-tag">⭐ {hotel.stars}</span>
          <span className="hp-tag hp-tag--price" title={price.sub || undefined}>
            {price.line}
          </span>
          {hotel.hasOutdoorPool && <span className="hp-tag">🏊 Piscine</span>}
          {hotel.hasParking && <span className="hp-tag">🅿️ Parking</span>}
        </div>
        {hotel.averageRating && (
          <div className="hp-rating"><StarIcon /> {hotel.averageRating}/10</div>
        )}
      </div>
      <div className={`hp-card-actions${isAdmin ? ' hp-card-actions--admin' : ' hp-card-actions--guest'}`}>
        <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={() => onView(hotel)}>
          👁️ Voir
        </button>
        {isAdmin ? (
          <>
            <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={() => onEdit(hotel)}>
              <EditIcon /> Modifier
            </button>
            <button
              type="button"
              className="hp-btn hp-btn--danger hp-btn--sm"
              disabled={deleting}
              onClick={() => onDelete(hotel.id)}
            >
              <TrashIcon /> {deleting ? '…' : 'Supprimer'}
            </button>
          </>
        ) : (
          <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={() => onReserve(hotel)}>
            Réserver
          </button>
        )}
      </div>
    </article>
  )
}

// ─── Barre de filtre avancé (POST /api/hotels/filter) ────────
function FilterBar({ onFilter, onReset }) {
  const [f, setF] = useState({ minStars: '', maxPrice: '', hasPool: false, hasParking: false, hasSpa: false })
  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setF(prev => ({ ...prev, [k]: val }))
  }
  return (
    <form className="hp-filter-bar" onSubmit={(e) => { e.preventDefault(); onFilter(f) }}>
      <div className="hp-filter-field">
        <label>Étoiles min</label>
        <input type="number" min="1" max="5" value={f.minStars} onChange={set('minStars')} />
      </div>
      <div className="hp-filter-field">
        <label>Prix max (€)</label>
        <input type="number" min="0" value={f.maxPrice} onChange={set('maxPrice')} />
      </div>
      <div className="hp-filter-check">
        <label><input type="checkbox" checked={f.hasPool} onChange={set('hasPool')} /> Piscine (ext/int)</label>
        <label><input type="checkbox" checked={f.hasParking} onChange={set('hasParking')} /> Parking</label>
        <label><input type="checkbox" checked={f.hasSpa} onChange={set('hasSpa')} /> Spa</label>
      </div>
      <div className="hp-filter-actions">
        <button type="submit" className="hp-btn hp-btn--primary">Filtrer</button>
        <button type="button" className="hp-btn hp-btn--ghost" onClick={() => { setF({ minStars: '', maxPrice: '', hasPool: false, hasParking: false, hasSpa: false }); onReset() }}>Reset</button>
      </div>
    </form>
  )
}

// ─── Onglets ─────────────────────────────────────────────────
const TABS = [
  { id: 'all',      label: 'Tous', emoji: '🏨' },
  { id: 'toprated', label: 'Top notés', emoji: '⭐' },
]

// ─── Page principale ─────────────────────────────────────────
export default function HotelsPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const destinationId = searchParams.get('destinationId')
  const { setTripDestination, setTripHotel, destination: tripDestination } = useTripCart()
  const api = hotelAPI(token)
  const isAdmin = user?.role === 'ADMIN'
  const carouselRef = useRef(null)
  const hotelScrollRafPending = useRef(false)
  const [carouselDot, setCarouselDot] = useState(0)
  /** Matches .hp-carousel breakpoints: 3 / 2 / 1 cards per view */
  const [cardsPerView, setCardsPerView] = useState(3)

  useEffect(() => {
    const mq1100 = window.matchMedia('(max-width: 1100px)')
    const mq640 = window.matchMedia('(max-width: 640px)')
    const syncBp = () => {
      if (mq640.matches) setCardsPerView(1)
      else if (mq1100.matches) setCardsPerView(2)
      else setCardsPerView(3)
    }
    syncBp()
    mq1100.addEventListener('change', syncBp)
    mq640.addEventListener('change', syncBp)
    return () => {
      mq1100.removeEventListener('change', syncBp)
      mq640.removeEventListener('change', syncBp)
    }
  }, [])

  const goReserveHotel = (hotel) => {
    setTripHotel(hotel)
    if (!token) {
      navigate('/login', { state: { redirectTo: `/reservations?hotelId=${hotel.id}` } })
      return
    }
    navigate(`/reservations?hotelId=${hotel.id}`)
  }

  const [tab, setTab] = useState('all')
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [toast, setToast] = useState('')
  const [viewHotel, setViewHotel] = useState(null)
  const [destinations, setDestinations] = useState([]) // pour le select
  const [filterDestination, setFilterDestination] = useState(null)

  const hotelCarouselDotCount = Math.max(
    1,
    Math.min(HOTEL_CAROUSEL_MAX_DOTS, Math.ceil(hotels.length / Math.max(1, cardsPerView)))
  )

  const syncHotelCarouselDots = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    if (max <= 4) {
      setCarouselDot(0)
      return
    }
    const t = el.scrollLeft / max
    const last = hotelCarouselDotCount - 1
    if (last <= 0) {
      setCarouselDot(0)
      return
    }
    const dot = Math.min(last, Math.max(0, Math.round(t * last)))
    setCarouselDot(dot)
  }, [hotelCarouselDotCount])

  const onHotelCarouselScroll = useCallback(() => {
    if (hotelScrollRafPending.current) return
    hotelScrollRafPending.current = true
    requestAnimationFrame(() => {
      hotelScrollRafPending.current = false
      syncHotelCarouselDots()
    })
  }, [syncHotelCarouselDots])

  const scrollHotelCarousel = useCallback((dir) => {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector('.hp-card')
    if (!card) return
    const delta = card.offsetWidth + HP_CAROUSEL_GAP
    const max = el.scrollWidth - el.clientWidth
    if (max <= 4) return
    if (dir < 0) {
      if (el.scrollLeft <= 4) el.scrollTo({ left: max, behavior: 'smooth' })
      else el.scrollBy({ left: -delta, behavior: 'smooth' })
    } else {
      if (el.scrollLeft >= max - 4) el.scrollTo({ left: 0, behavior: 'smooth' })
      else el.scrollBy({ left: delta, behavior: 'smooth' })
    }
  }, [])

  const scrollHotelCarouselToDot = useCallback(
    (i) => {
      const el = carouselRef.current
      if (!el) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 4) return
      const last = hotelCarouselDotCount - 1
      if (last <= 0) return
      const clamped = Math.min(last, Math.max(0, i))
      el.scrollTo({ left: max * (clamped / last), behavior: 'smooth' })
    },
    [hotelCarouselDotCount]
  )

  useEffect(() => {
    setCarouselDot((d) => {
      const last = Math.max(0, hotelCarouselDotCount - 1)
      return Math.min(last, d)
    })
  }, [hotelCarouselDotCount])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      syncHotelCarouselDots()
    })
    return () => cancelAnimationFrame(id)
  }, [cardsPerView, syncHotelCarouselDots])

  useEffect(() => {
    if (!destinationId) {
      setFilterDestination(null)
      return
    }
    const id = Number(destinationId)
    if (!Number.isFinite(id)) {
      setFilterDestination(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { destinationAPI } = await import('../services/destinationAPI')
        const d = await destinationAPI(token).getById(id)
        if (!cancelled) setFilterDestination(d || null)
      } catch {
        if (!cancelled) setFilterDestination(null)
      }
    })()
    return () => { cancelled = true }
  }, [destinationId, token])

  useEffect(() => {
    if (!filterDestination) return
    const fid = filterDestination.id
    if (!tripDestination || tripDestination.id !== fid) {
      setTripDestination({
        id: fid,
        city: filterDestination.city,
        country: filterDestination.country,
        priceEur: Math.max(0, Number(filterDestination.estimatedBudget) || 0),
      })
    }
  }, [filterDestination, tripDestination, setTripDestination])

  useEffect(() => {
    const el = carouselRef.current
    if (!el || hotels.length === 0) return undefined
    const step = () => {
      const card = el.querySelector('.hp-card')
      if (!card) return
      const delta = card.offsetWidth + HP_CAROUSEL_GAP
      const max = el.scrollWidth - el.clientWidth
      if (max <= 4) return
      if (el.scrollLeft >= max - 4) el.scrollTo({ left: 0, behavior: 'smooth' })
      else el.scrollBy({ left: delta, behavior: 'smooth' })
    }
    const id = setInterval(step, HP_CAROUSEL_AUTO_MS)
    return () => clearInterval(id)
  }, [hotels])

  useLayoutEffect(() => {
    const el = carouselRef.current
    if (!el || hotels.length === 0) return
    el.scrollLeft = 0
    setCarouselDot(0)
    requestAnimationFrame(() => {
      syncHotelCarouselDots()
    })
  }, [hotels, syncHotelCarouselDots])

  useEffect(() => {
    const el = carouselRef.current
    if (!el || hotels.length === 0) return undefined
    const sync = () => syncHotelCarouselDots()
    el.addEventListener('scrollend', sync)
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scrollend', sync)
      window.removeEventListener('resize', sync)
    }
  }, [hotels, syncHotelCarouselDots])

 // Charger les destinations (pour le select dans le modal)
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { destinationAPI } = await import('../services/destinationAPI')
        const destApi = destinationAPI(token)
        const data = await destApi.getAll()
        setDestinations(data)
      } catch (err) { console.error("Impossible de charger les destinations", err) }
    }
    fetchDestinations()
  }, [token])

  // Charger les hôtels (avec ou sans filtre destination)
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let data
      if (destinationId) {
        // Appel spécifique pour les hôtels d'une destination
        data = await api.getByDestination(Number(destinationId))
      } else {
        data = await api.getAll()
      }
      // Appliquer le filtre "top notés" si l'onglet est actif
      if (tab === 'toprated') {
        data = data.filter(h => h.averageRating >= 8.0).sort((a,b) => b.averageRating - a.averageRating)
      }
      setHotels(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tab, token, destinationId])   // ← dépend de destinationId

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return fetchData()
    setLoading(true)
    try {
      const all = await api.getAll()
      const filtered = all.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase()))
      setHotels(filtered)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleFilter = async (params) => {
    setLoading(true)
    try {
      const filters = {}
      if (params.minStars) filters.minStars = parseInt(params.minStars)
      if (params.maxPrice) {
        const eur = parseFloat(params.maxPrice)
        if (Number.isFinite(eur) && eur > 0) filters.maxPrice = eur * TND_PER_EUR
      }
      if (params.hasPool) filters.hasPool = true
      if (params.hasParking) filters.hasParking = true
      if (params.hasSpa) filters.hasSpa = true
      const data = await api.filter(filters)
      setHotels(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

 const handleSave = async (formData) => {
  setSaving(true)
  try {
    const payload = { ...formData }

    // Supprimer l'ancien éventuel objet destination
    delete payload.destination

    // Transformer destinationId en objet destination { id }
    if (payload.destinationId !== undefined && payload.destinationId !== '') {
      payload.destination = { id: Number(payload.destinationId) }
    } else {
      payload.destination = null
    }
    delete payload.destinationId

    // Appel API
    if (modal?.hotel?.id) {
      await api.update(modal.hotel.id, payload)
      showToast('Hôtel modifié ✓')
    } else {
      await api.create(payload)
      showToast('Hôtel créé ✓')
    }

    setModal(null)
    fetchData()
  } catch (err) {
    setError(err.message)
  } finally {
    setSaving(false)
  }
}

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet hôtel ?')) return
    setDeletingId(id)
    try {
      await api.delete(id)
      showToast('Hôtel supprimé')
      fetchData()
    } catch (err) { setError(err.message) }
    finally { setDeletingId(null) }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className="hp-page">
      {toast && <div className="hp-toast">{toast}</div>}
      {modal && (
        <HotelModal
          initial={modal.hotel || {}}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
          destinations={destinations}
        />
      )}
      {viewHotel && <ViewHotelModal hotel={viewHotel} onClose={() => setViewHotel(null)} />}

      {filterDestination && (
        <div className="hp-destination-strip" role="status">
          <span>
            <strong>{filterDestination.city}</strong>, {filterDestination.country} — {hotels.length} hôtel
            {hotels.length !== 1 ? 's' : ''} lié{hotels.length !== 1 ? 's' : ''} à cette destination. Le total du panier (à droite) est en <strong>€</strong> (hôtel converti depuis le tarif nuit + forfait destination).
          </span>
          <Link to="/destinations" className="hp-btn hp-btn--ghost hp-btn--sm">
            ← Destinations
          </Link>
        </div>
      )}

      <div className="hp-header">
        <div>
          <h1 className="hp-title">Hôtels</h1>
          <p className="hp-subtitle">
            {filterDestination
              ? `${filterDestination.city} — hébergements disponibles`
              : isAdmin
                ? 'Gérez vos établissements'
                : 'Parcourez les hôtels et réservez votre séjour'}
          </p>
        </div>
        {isAdmin && (
          <button className="hp-btn hp-btn--primary" onClick={() => setModal({})}>
            <PlusIcon /> Ajouter
          </button>
        )}
      </div>

      <div className="hp-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`hp-tab ${tab === t.id ? 'hp-tab--active' : ''}`}
                  onClick={() => { setTab(t.id); setSearch(''); setShowFilter(false) }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <div className="hp-toolbar">
          <form className="hp-search-wrap" onSubmit={handleSearch}>
            <SearchIcon/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom ou adresse..." />
            <button type="submit" className="hp-btn hp-btn--primary hp-btn--sm">Rechercher</button>
          </form>
          <button className={`hp-btn hp-btn--ghost ${showFilter ? 'hp-btn--active' : ''}`} onClick={() => setShowFilter(!showFilter)}>⚙ Filtres</button>
        </div>
      )}
      {showFilter && tab === 'all' && <FilterBar onFilter={handleFilter} onReset={fetchData} />}
      {error && <div className="hp-error">{error}</div>}

      {loading ? (
        <div className="hp-loading"><div className="hp-spinner"/><span>Chargement…</span></div>
      ) : hotels.length === 0 ? (
        <div className="hp-empty"><span>🏨</span><p>Aucun hôtel trouvé.</p>{tab==='all' && isAdmin && <button className="hp-btn hp-btn--primary" onClick={() => setModal({})}><PlusIcon/> Créer</button>}</div>
      ) : (
        <div className="hp-carousel-shell">
          <button
            type="button"
            className="hp-carousel-arrow hp-carousel-arrow--prev"
            aria-label="Faire défiler vers la gauche"
            onClick={() => scrollHotelCarousel(-1)}
          >
            ‹
          </button>
          <div className="hp-carousel-track">
            <div
              className="hp-carousel"
              ref={carouselRef}
              onScroll={onHotelCarouselScroll}
            >
              {hotels.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  isAdmin={isAdmin}
                  onEdit={(hotel) => setModal({ hotel })}
                  onView={setViewHotel}
                  onDelete={handleDelete}
                  onReserve={goReserveHotel}
                  deleting={deletingId === h.id}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="hp-carousel-arrow hp-carousel-arrow--next"
            aria-label="Faire défiler vers la droite"
            onClick={() => scrollHotelCarousel(1)}
          >
            ›
          </button>
          {hotelCarouselDotCount > 1 && (
            <div
              className={`hp-carousel-dots${hotelCarouselDotCount > 10 ? ' hp-carousel-dots--many' : ''}`}
              role="tablist"
              aria-label="Pages du carrousel"
            >
              {Array.from({ length: hotelCarouselDotCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={carouselDot === i}
                  aria-label={`Page ${i + 1} sur ${hotelCarouselDotCount}`}
                  className={`hp-carousel-dot${carouselDot === i ? ' hp-carousel-dot--active' : ''}`}
                  onClick={() => scrollHotelCarouselToDot(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}