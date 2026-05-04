// ============================================================
// src/pages/DestinationsPage.jsx
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { destinationAPI } from '../services/destinationAPI'
import './DestinationsPage.css'

// ─── Icônes ──────────────────────────────────────────────────
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

// ─── Formulaire vide ─────────────────────────────────────────
const EMPTY_FORM = {
   country: '', city: '',
  description: '', climate: '',
  rating: '', price: '', trending: false,
}

// ─── Modal ───────────────────────────────────────────────────
function DestinationModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial })

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const isValid =  form.country.trim()

  return (
    <div className="dp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dp-modal">
        <div className="dp-modal-header">
          <h2 className="dp-modal-title">
            {initial?.id ? 'Modifier la destination' : 'Nouvelle destination'}
          </h2>
          <button className="dp-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dp-form-grid">
          <div className="dp-field">
            <label>Pays *</label>
            <input value={form.country} onChange={set('country')} placeholder="Ex: Grèce"/>
          </div>
          <div className="dp-field">
            <label>Ville</label>
            <input value={form.city} onChange={set('city')} placeholder="Ex: Oia"/>
          </div>
          <div className="dp-field dp-field--full">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')}
              rows={3} placeholder="Décrivez la destination…"/>
          </div>
          <div className="dp-field">
            <label>Climat</label>
            <input value={form.climate} onChange={set('climate')} placeholder="Ex: méditerranéen"/>
          </div>
          <div className="dp-field">
            <label>Note (0–5)</label>
            <input type="number" min="0" max="5" step="0.1"
              value={form.averageRating} onChange={set('averageRating')} placeholder="4.5"/>
          </div>
          <div className="dp-field">
            <label>Prix estimé (€)</label>
            <input type="number" value={form.estimatedBudget} onChange={set('estimatedBudget')} placeholder="800"/>
          </div>
          <div className="dp-field dp-field--checkbox">
            <label>
              <input type="checkbox" checked={form.trending} onChange={set('trending')}/>
              Marquer comme tendance
            </label>
          </div>
        </div>

        <div className="dp-modal-actions">
          <button className="dp-btn dp-btn--ghost" onClick={onClose}>Annuler</button>
          <button
            className="dp-btn dp-btn--primary"
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
// ─── View Modal (affiche toutes les colonnes) ──────────────────────────
function ViewDestinationModal({ dest, onClose }) {
  if (!dest) return null

  return (
    <div className="dp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dp-modal" style={{ maxWidth: '600px' }}>
        <div className="dp-modal-header">
          <h2 className="dp-modal-title">Détails de la destination</h2>
          <button className="dp-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="dp-view-grid">
          <div className="dp-view-field"><strong>ID :</strong> {dest.id}</div>
          <div className="dp-view-field"><strong>Pays :</strong> {dest.country}</div>
          <div className="dp-view-field"><strong>Ville :</strong> {dest.city || '—'}</div>
          <div className="dp-view-field"><strong>Description :</strong> {dest.description || '—'}</div>
          <div className="dp-view-field"><strong>Climat :</strong> {dest.climate || '—'}</div>
          <div className="dp-view-field"><strong>Note :</strong> {dest.averageRating ?? '—'}</div>
          <div className="dp-view-field"><strong>Prix (€) :</strong> {dest.estimatedBudget ?? '—'}</div>
          <div className="dp-view-field"><strong>Tendance :</strong> {dest.trending ? 'Oui 🔥' : 'Non'}</div>
          {dest.createdAt && <div className="dp-view-field"><strong>Créé le :</strong> {new Date(dest.createdAt).toLocaleString()}</div>}
          {dest.updatedAt && <div className="dp-view-field"><strong>Mis à jour :</strong> {new Date(dest.updatedAt).toLocaleString()}</div>}
        </div>

        <div className="dp-modal-actions">
          <button className="dp-btn dp-btn--primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}


// ─── Carte ───────────────────────────────────────────────────
function DestCard({ dest, onEdit, onDelete,onView, deleting }) {
  return (
    <article className="dp-card">
      {dest.trending && <span className="dp-trending-badge">🔥 Tendance</span>}
      <div className="dp-card-body">
        <h3 className="dp-card-name">{dest.name}</h3>
        <p className="dp-card-location">
          {[dest.city, dest.country].filter(Boolean).join(', ')}
        </p>
        {dest.description && (
          <p className="dp-card-desc">
            {dest.description.length > 100
              ? dest.description.slice(0, 100) + '…'
              : dest.description}
          </p>
        )}
        <div className="dp-card-tags">
          {dest.climate && <span className="dp-tag">{dest.climate}</span>}
          {dest.estimatedBudget   && <span className="dp-tag">~{dest.estimatedBudget} €</span>}
        </div>
        {dest.averageRating != null && dest.averageRating !== '' && (
          <div className="dp-rating">
            <StarIcon /> {Number(dest.averageRating).toFixed(1)}
          </div>
        )}
      </div>
      <div className="dp-card-actions">
         <button className="dp-btn dp-btn--ghost dp-btn--sm" onClick={() => onView(dest)}>
          👁️ Voir plus
        </button>
        <button className="dp-btn dp-btn--ghost dp-btn--sm" onClick={() => onEdit(dest)}>
          <EditIcon /> Modifier
        </button>
        <button
          className="dp-btn dp-btn--danger dp-btn--sm"
          disabled={deleting}
          onClick={() => onDelete(dest.id)}
        >
          <TrashIcon /> {deleting ? '…' : 'Supprimer'}
        </button>
      </div>
    </article>
  )
}

// ─── Filtre combiné ───────────────────────────────────────────
function FilterBar({ onFilter, onReset }) {
  const [f, setF] = useState({ country: '', climate: '', minAverageRating: '' })
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <form className="dp-filter-bar"
      onSubmit={(e) => { e.preventDefault(); onFilter(f) }}>
      <div className="dp-filter-field">
        <label>Pays</label>
        <input value={f.country} onChange={set('country')} placeholder="France"/>
      </div>
      <div className="dp-filter-field">
        <label>Climat</label>
        <input value={f.climate} onChange={set('climate')} placeholder="tropical"/>
      </div>
      <div className="dp-filter-field">
        <label>Note min.</label>
        <input type="number" min="0" max="5" step="0.1"
          value={f.minAverageRating} onChange={set('minAverageRating')} placeholder="4.0"/>
      </div>
      <div className="dp-filter-actions">
        <button type="submit" className="dp-btn dp-btn--primary">Filtrer</button>
        <button type="button" className="dp-btn dp-btn--ghost"
          onClick={() => { setF({ country: '', climate: '', minAverageRating: '' }); onReset() }}>
          Reset
        </button>
      </div>
    </form>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────
const TABS = [
  { id: 'all',      label: 'Toutes',    emoji: '🌍' },
  { id: 'trending', label: 'Tendances', emoji: '🔥' },
  { id: 'toprated', label: 'Top notés', emoji: '⭐' },
]

// ─── Page principale ──────────────────────────────────────────
export default function DestinationsPage() {
  const { token } = useAuth()

  // API instanciée avec le token courant
  const api = destinationAPI(token)

  const [tab,          setTab]          = useState('all')
  const [destinations, setDestinations] = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [modal,        setModal]        = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [deletingId,   setDeletingId]   = useState(null)
  const [search,       setSearch]       = useState('')
  const [showFilter,   setShowFilter]   = useState(false)
  const [toast,        setToast]        = useState('')

  // ── Fetch selon tab ────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let data
      if (tab === 'all')      data = await api.getAll()
      if (tab === 'trending') data = await api.getTrending()
      if (tab === 'toprated') data = await api.getTopRated()
      setDestinations(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, token])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Recherche ──────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return fetchData()
    setLoading(true)
    try {
      const data = await api.search(search.trim())
      setDestinations(data || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Filtre ─────────────────────────────────────────────────
  const handleFilter = async (params) => {
    setLoading(true)
    try {
      const data = await api.filter(params)
      setDestinations(data || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── CRUD ───────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (modal.dest?.id) {
        await api.update(modal.dest.id, formData)
        showToast('Destination modifiée ✓')
      } else {
        await api.create(formData)
        showToast('Destination créée ✓')
      }
      setModal(null)
      fetchData()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette destination ?')) return
    setDeletingId(id)
    try {
      await api.delete(id)
      showToast('Destination supprimée')
      fetchData()
    } catch (err) { setError(err.message) }
    finally { setDeletingId(null) }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }
  const [viewDest, setViewDest] = useState(null)  

  return (
    <div className="dp-page">
      {toast && <div className="dp-toast">{toast}</div>}

      {modal && (
        <DestinationModal
          initial={modal.dest || {}}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {/* Header */}
      <div className="dp-header">
        <div>
          <h1 className="dp-title">Destinations</h1>
          <p className="dp-subtitle">Gérez vos destinations de voyage</p>
        </div>
        <button className="dp-btn dp-btn--primary" onClick={() => setModal({})}>
          <PlusIcon /> Ajouter
        </button>
      </div>

      {/* Tabs */}
      <div className="dp-tabs">
        {TABS.map((t) => (
          <button key={t.id}
            className={`dp-tab ${tab === t.id ? 'dp-tab--active' : ''}`}
            onClick={() => { setTab(t.id); setSearch(''); setShowFilter(false) }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Recherche + filtres (onglet "Toutes" uniquement) */}
      {tab === 'all' && (
        <div className="dp-toolbar">
          <form className="dp-search-wrap" onSubmit={handleSearch}>
            <SearchIcon/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher pays, ville, description…"
            />
            <button type="submit" className="dp-btn dp-btn--primary dp-btn--sm">
              Rechercher
            </button>
          </form>
          <button
            className={`dp-btn dp-btn--ghost ${showFilter ? 'dp-btn--active' : ''}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            ⚙ Filtres
          </button>
        </div>
      )}

      {showFilter && tab === 'all' && (
        <FilterBar onFilter={handleFilter} onReset={fetchData}/>
      )}

      {error && <div className="dp-error">{error}</div>}

      {/* Contenu */}
      {loading ? (
        <div className="dp-loading">
          <div className="dp-spinner"/>
          <span>Chargement…</span>
        </div>
      ) : destinations.length === 0 ? (
        <div className="dp-empty">
          <span>🗺️</span>
          <p>Aucune destination trouvée.</p>
          {tab === 'all' && (
            <button className="dp-btn dp-btn--primary" onClick={() => setModal({})}>
              <PlusIcon/> Créer la première
            </button>
          )}
        </div>
      ) : (
        <div className="dp-grid">
          {destinations.map((d) => (
            <DestCard
              key={d.id}
              dest={d}
              onEdit={(dest) => setModal({ dest })}
              onView={() => setViewDest(d)}   
              onDelete={handleDelete}
              deleting={deletingId === d.id}
            />
          ))}
        </div>
      )}

      {viewDest && (
  <ViewDestinationModal
    dest={viewDest}
    onClose={() => setViewDest(null)}
  />
)}
    </div>
  )
}
