// ============================================================
// src/pages/HotelsPage.jsx
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { hotelAPI } from '../services/hotelAPI'
import { useSearchParams } from 'react-router-dom';
import './HotelPage.css'   // tu peux copier/coller le CSS de DestinationsPage et remplacer "dp-" par "hp-"

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

// ─── Modal de consultation (détails) ─────────────────────────
function ViewHotelModal({ hotel, onClose }) {
  if (!hotel) return null
  return (
    <div className="hp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hp-modal" style={{ maxWidth: '700px' }}>
        <div className="hp-modal-header">
          <h2 className="hp-modal-title">Détails de l’hôtel</h2>
          <button className="hp-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="hp-view-grid">
          <div><strong>ID :</strong> {hotel.id}</div>
          <div><strong>Nom :</strong> {hotel.name}</div>
          <div><strong>Adresse :</strong> {hotel.address}</div>
          <div><strong>Étoiles :</strong> {'⭐'.repeat(hotel.stars)}</div>
          <div><strong>Prix / nuit :</strong> {hotel.pricePerNight} D</div>
          <div><strong>Note :</strong> {hotel.averageRating ?? '—'} /10</div>
          <div><strong>Distance centre :</strong> {hotel.distanceToCenter} km</div>
          <div><strong>Disponible :</strong> {hotel.available ? 'Oui' : 'Non'}</div>
          
        
          {hotel.destination && (
            <div>
              <strong>Destination :</strong> {hotel.destination.city}, {hotel.destination.country}
            </div>
          )}

          <div className="hp-view-field--full"><strong>Équipements :</strong>
            {[
              hotel.hasOutdoorPool && 'Piscine ext.',
              hotel.hasIndoorPool && 'Piscine int.',
              hotel.hasBeach && 'Plage',
              hotel.hasParking && 'Parking',
              hotel.hasSpa && 'Spa',
              hotel.hasAirportShuttle && 'Navette',
              hotel.hasFitnessCenter && 'Fitness',
              hotel.hasBar && 'Bar'
            ].filter(Boolean).join(', ') || 'Aucun'}
          </div>
          <div className="hp-view-field--full"><strong>Description :</strong><br/>{hotel.description || '—'}</div>
          {hotel.photoUrl && <div className="hp-view-field--full"><img src={hotel.photoUrl} alt="hôtel" style={{maxWidth:'100%', borderRadius:'8px'}}/></div>}
        </div>
        <div className="hp-modal-actions">
          <button className="hp-btn hp-btn--primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
// ─── Carte d’un hôtel ───────────────────────────────────────
function HotelCard({ hotel, onEdit, onDelete, onView, deleting }) {
  return (
    <article className="hp-card">
      {hotel.stars >= 4 && <span className="hp-trending-badge">🏆 Très bien noté</span>}
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
          <span className="hp-tag">{hotel.pricePerNight} D / nuit</span>
          {hotel.hasOutdoorPool && <span className="hp-tag">🏊 Piscine</span>}
          {hotel.hasParking && <span className="hp-tag">🅿️ Parking</span>}
        </div>
        {hotel.averageRating && (
          <div className="hp-rating"><StarIcon /> {hotel.averageRating}/10</div>
        )}
      </div>
      <div className="hp-card-actions">
        <button className="hp-btn hp-btn--ghost hp-btn--sm" onClick={() => onView(hotel)}>👁️ Voir</button>
        <button className="hp-btn hp-btn--ghost hp-btn--sm" onClick={() => onEdit(hotel)}><EditIcon /> Modifier</button>
        <button className="hp-btn hp-btn--danger hp-btn--sm" disabled={deleting} onClick={() => onDelete(hotel.id)}>
          <TrashIcon /> {deleting ? '…' : 'Supprimer'}
        </button>
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
  const { token } = useAuth()
  const [searchParams] = useSearchParams();
  const destinationId = searchParams.get('destinationId');
  const api = hotelAPI(token)

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
      if (params.maxPrice) filters.maxPrice = parseFloat(params.maxPrice)
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

      <div className="hp-header">
        <div><h1 className="hp-title">Hôtels</h1><p className="hp-subtitle">Gérez vos établissements</p></div>
        <button className="hp-btn hp-btn--primary" onClick={() => setModal({})}><PlusIcon /> Ajouter</button>
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
        <div className="hp-empty"><span>🏨</span><p>Aucun hôtel trouvé.</p>{tab==='all' && <button className="hp-btn hp-btn--primary" onClick={() => setModal({})}><PlusIcon/> Créer</button>}</div>
      ) : (
        <div className="hp-grid">{hotels.map(h => <HotelCard key={h.id} hotel={h} onEdit={(hotel) => setModal({ hotel })} onView={setViewHotel} onDelete={handleDelete} deleting={deletingId === h.id} />)}</div>
      )}
    </div>
  )
}