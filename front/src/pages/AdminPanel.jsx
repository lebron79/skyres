import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'
import './AdminPanel.css'

function RoleBadge({ role }) {
  const map = {
    ADMIN:   { cls: 'admin-badge-purple', label: '⚙ Admin' },
    GUIDE:   { cls: 'admin-badge-teal',   label: '🧭 Guide' },
    TOURIST: { cls: 'admin-badge-blue',   label: '✈ Tourist' },
  }
  const { cls, label } = map[role] ?? { cls: 'admin-badge-gray', label: role }
  return <span className={`admin-badge ${cls}`}>{label}</span>
}

function BoolBadge({ value, trueLabel = 'Yes', falseLabel = 'No' }) {
  return value
    ? <span className="admin-badge admin-badge-green">✓ {trueLabel}</span>
    : <span className="admin-badge admin-badge-gray">✗ {falseLabel}</span>
}

function PayStatusBadge({ status }) {
  const map = {
    PAID:    'admin-badge-green',
    PENDING: 'admin-badge-amber',
    FAILED:  'admin-badge-red',
    REFUNDED:'admin-badge-gray',
  }
  const s = (status ?? '').toUpperCase()
  return <span className={`admin-badge ${map[s] ?? 'admin-badge-gray'}`}>{status ?? '—'}</span>
}

function UserCell({ firstName, lastName, email }) {
  const initials = `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`
  return (
    <div className="admin-user-cell">
      <div className="admin-user-cell-avatar">{initials || '?'}</div>
      <div>
        <div className="admin-user-cell-name">{firstName} {lastName}</div>
        {email && <div className="admin-user-cell-sub">{email}</div>}
      </div>
    </div>
  )
}

function EditBtn({ onClick }) {
  return (
    <button type="button" className="admin-action-btn admin-action-btn-edit" onClick={onClick}>
      ✏ Edit
    </button>
  )
}

function DeleteBtn({ onClick }) {
  return (
    <button type="button" className="admin-action-btn admin-action-btn-delete" onClick={onClick}>
      🗑 Delete
    </button>
  )
}

const ACTIVITY_PRESETS = [
  'Desert safari',
  'Scuba diving',
  'Mountain trek',
  'City food tour',
  'Sunset cruise',
  'Museum guided tour',
  'Wine tasting experience',
  'Hot air balloon ride',
  'Northern lights chase',
  'Cooking class',
]

function AccessDenied() {
  return (
    <div className="admin-root">
      <div className="admin-card admin-card--narrow admin-card--glass">
        <h1>Access denied</h1>
        <p className="admin-muted">This area is reserved for administrators.</p>
        <Link to="/" className="admin-btn admin-btn-primary">Back to home</Link>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const { token, user, refreshUser } = useAuth()
  const [tab, setTab] = useState('guides')
  const [guides, setGuides] = useState([])
  const [activities, setActivities] = useState([])
  const [destinations, setDestinations] = useState([])
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [reservations, setReservations] = useState([])
  const [guideApplications, setGuideApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [templatePick, setTemplatePick] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [guideForm, setGuideForm] = useState({
    id: null,
    userId: '',
    languages: '',
    hourlyRate: '',
    available: true,
    region: '',
  })
  const [activityForm, setActivityForm] = useState({
    id: null,
    name: '',
    type: '',
    description: '',
    price: '',
    season: '',
    minAge: '0',
    imageUrl: '',
    destinationId: '',
  })
  const [destinationForm, setDestinationForm] = useState({
    id: null,
    country: '',
    city: '',
    description: '',
    imageUrl: '',
    climate: '',
    estimatedBudget: '',
    averageRating: '',
    trending: false,
  })
  const [userForm, setUserForm] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'TOURIST',
    phone: '',
    photoUrl: '',
    bio: '',
  })

  const showSuccess = useCallback((msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }, [])

  const loadGuides = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/guides', { method: 'GET' }, token)
      setGuides(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load guides')
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/activities', { method: 'GET' }, token)
      setActivities(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/admin/users', { method: 'GET' }, token)
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadDestinations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/destinations', { method: 'GET' }, token)
      setDestinations(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadBilling = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [paymentsData, reservationsData] = await Promise.all([
        apiFetch('/api/admin/payments', { method: 'GET' }, token),
        apiFetch('/api/admin/reservations', { method: 'GET' }, token),
      ])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setReservations(Array.isArray(reservationsData) ? reservationsData : [])
    } catch (e) {
      const status = Number(e?.status)
      if (status === 403) {
        setError('Forbidden: billing data is only available for ADMIN accounts.')
      } else {
        setError(e.message || 'Failed to load billing data')
      }
      setPayments([])
      setReservations([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadGuideApplications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/admin/guide-applications?status=PENDING', { method: 'GET' }, token)
      setGuideApplications(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load guide applications')
      setGuideApplications([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    if (tab === 'guides') loadGuides()
    else if (tab === 'activities') loadActivities()
    else if (tab === 'destinations') loadDestinations()
    else if (tab === 'users') loadUsers()
    else if (tab === 'guideApplications') loadGuideApplications()
    else loadBilling()
  }, [tab, user?.role, loadGuides, loadActivities, loadDestinations, loadUsers, loadGuideApplications, loadBilling])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const resetGuideForm = () =>
    setGuideForm({ id: null, userId: '', languages: '', hourlyRate: '', available: true, region: '' })

  const resetActivityForm = () =>
    setActivityForm({
      id: null,
      name: '',
      type: '',
      description: '',
      price: '',
      season: '',
      minAge: '0',
      imageUrl: '',
      destinationId: '',
    })

  const resetUserForm = () =>
    setUserForm({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'TOURIST',
      phone: '',
      photoUrl: '',
      bio: '',
    })

  const resetDestinationForm = () =>
    setDestinationForm({
      id: null,
      country: '',
      city: '',
      description: '',
      imageUrl: '',
      climate: '',
      estimatedBudget: '',
      averageRating: '',
      trending: false,
    })

  const fillActivityWithGroq = async () => {
    const name = activityForm.name?.trim()
    if (!name) {
      setError('Choose a template or enter an activity name first.')
      return
    }
    setAiLoading(true)
    setError(null)
    try {
      const data = await apiFetch(
        '/api/admin/activities/suggest-details',
        { method: 'POST', body: JSON.stringify({ name }) },
        token
      )
      setActivityForm((f) => ({
        ...f,
        name: f.name || name,
        type: data.type ?? f.type,
        description: data.description ?? f.description,
        price: data.price != null ? String(data.price) : f.price,
        season: data.season ?? f.season,
        minAge: data.minAge != null ? String(data.minAge) : f.minAge,
      }))
    } catch (err) {
      setError(err.message || 'AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const saveGuide = async (e) => {
    e.preventDefault()
    setError(null)
    const uid = Number(guideForm.userId)
    if (!guideForm.id && (!Number.isFinite(uid) || uid <= 0)) {
      setError('User ID is required for a new guide (existing user).')
      return
    }
    const body = {
      userId: uid,
      languages: guideForm.languages || null,
      hourlyRate: guideForm.hourlyRate === '' ? null : Number(guideForm.hourlyRate),
      available: guideForm.available,
      region: guideForm.region || null,
    }
    try {
      if (guideForm.id) {
        await apiFetch(`/api/guides/${guideForm.id}`, { method: 'PUT', body: JSON.stringify(body) }, token)
      } else {
        await apiFetch('/api/guides', { method: 'POST', body: JSON.stringify(body) }, token)
      }
      resetGuideForm()
      showSuccess(guideForm.id ? 'Guide updated successfully.' : 'Guide created successfully.')
      await loadGuides()
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  const deleteGuide = async (id) => {
    if (!window.confirm('Delete this guide?')) return
    setError(null)
    try {
      await apiFetch(`/api/guides/${id}`, { method: 'DELETE' }, token)
      if (guideForm.id === id) resetGuideForm()
      showSuccess('Guide deleted.')
      await loadGuides()
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const editGuide = (g) => {
    setGuideForm({
      id: g.id,
      userId: g.user?.id ?? '',
      languages: g.languages ?? '',
      hourlyRate: g.hourlyRate ?? '',
      available: !!g.available,
      region: g.region ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveActivity = async (e) => {
    e.preventDefault()
    setError(null)
    const dest = activityForm.destinationId.trim()
    const body = {
      name: activityForm.name,
      type: activityForm.type || null,
      description: activityForm.description || null,
      price: activityForm.price === '' ? null : Number(activityForm.price),
      season: activityForm.season || null,
      minAge: activityForm.minAge === '' ? 0 : Number(activityForm.minAge),
      imageUrl: activityForm.imageUrl || null,
      destinationId: dest === '' ? null : Number(dest),
    }
    if (!body.name?.trim()) {
      setError('Activity name is required.')
      return
    }
    try {
      if (activityForm.id) {
        await apiFetch(`/api/activities/${activityForm.id}`, { method: 'PUT', body: JSON.stringify(body) }, token)
      } else {
        await apiFetch('/api/activities', { method: 'POST', body: JSON.stringify(body) }, token)
      }
      resetActivityForm()
      showSuccess(activityForm.id ? 'Activity updated.' : 'Activity created.')
      await loadActivities()
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  const deleteActivity = async (id) => {
    if (!window.confirm('Delete this activity?')) return
    setError(null)
    try {
      await apiFetch(`/api/activities/${id}`, { method: 'DELETE' }, token)
      if (activityForm.id === id) resetActivityForm()
      showSuccess('Activity deleted.')
      await loadActivities()
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const editActivity = (a) => {
    setActivityForm({
      id: a.id,
      name: a.name ?? '',
      type: a.type ?? '',
      description: a.description ?? '',
      price: a.price ?? '',
      season: a.season ?? '',
      minAge: String(a.minAge ?? 0),
      imageUrl: a.imageUrl ?? '',
      destinationId: a.destination?.id != null ? String(a.destination.id) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveUser = async (e) => {
    e.preventDefault()
    setError(null)
    const body = {
      firstName: userForm.firstName.trim(),
      lastName: userForm.lastName.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      phone: userForm.phone.trim() || null,
      photoUrl: userForm.photoUrl.trim() || null,
      bio: userForm.bio.trim() || null,
      ...(userForm.password.trim() ? { password: userForm.password.trim() } : {}),
    }
    if (!body.firstName || !body.lastName || !body.email) {
      setError('First name, last name and email are required.')
      return
    }
    if (!userForm.id && !body.password) {
      setError('Password is required when creating a new user.')
      return
    }
    try {
      if (userForm.id) {
        await apiFetch(`/api/admin/users/${userForm.id}`, { method: 'PUT', body: JSON.stringify(body) }, token)
      } else {
        await apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(body) }, token)
      }
      resetUserForm()
      showSuccess(userForm.id ? 'User updated.' : 'User created.')
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  const saveDestination = async (e) => {
    e.preventDefault()
    setError(null)
    const body = {
      country: destinationForm.country.trim(),
      city: destinationForm.city.trim(),
      description: destinationForm.description.trim() || null,
      imageUrl: destinationForm.imageUrl.trim() || null,
      climate: destinationForm.climate.trim() || null,
      estimatedBudget:
        destinationForm.estimatedBudget === '' ? null : Number(destinationForm.estimatedBudget),
      averageRating:
        destinationForm.averageRating === '' ? null : Number(destinationForm.averageRating),
      trending: destinationForm.trending,
    }
    if (!body.country || !body.city) {
      setError('Country and city are required for a destination.')
      return
    }
    try {
      if (destinationForm.id) {
        await apiFetch(`/api/destinations/${destinationForm.id}`, { method: 'PUT', body: JSON.stringify(body) }, token)
      } else {
        await apiFetch('/api/destinations', { method: 'POST', body: JSON.stringify(body) }, token)
      }
      resetDestinationForm()
      showSuccess(destinationForm.id ? 'Destination updated.' : 'Destination created.')
      await loadDestinations()
    } catch (err) {
      setError(err.message || 'Save failed')
    }
  }

  const editDestination = (d) => {
    setDestinationForm({
      id: d.id,
      country: d.country ?? '',
      city: d.city ?? '',
      description: d.description ?? '',
      imageUrl: d.imageUrl ?? '',
      climate: d.climate ?? '',
      estimatedBudget: d.estimatedBudget ?? '',
      averageRating: d.averageRating ?? '',
      trending: !!d.trending,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteDestination = async (id) => {
    if (!window.confirm('Delete this destination?')) return
    setError(null)
    try {
      await apiFetch(`/api/destinations/${id}`, { method: 'DELETE' }, token)
      if (destinationForm.id === id) resetDestinationForm()
      showSuccess('Destination deleted.')
      await loadDestinations()
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const seedCatalogNow = async () => {
    setSeedLoading(true)
    setError(null)
    try {
      await apiFetch('/api/admin/seed-catalog', { method: 'POST' }, token)
      if (tab === 'destinations') {
        await Promise.all([loadDestinations(), loadActivities(), loadGuides()])
      }
    } catch (err) {
      setError(err.message || 'Could not seed catalog')
    } finally {
      setSeedLoading(false)
    }
  }

  const editUser = (u) => {
    setUserForm({
      id: u.id,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email ?? '',
      password: '',
      role: u.role ?? 'TOURIST',
      phone: u.phone ?? '',
      photoUrl: u.photoUrl ?? '',
      bio: u.bio ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    setError(null)
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }, token)
      if (userForm.id === id) resetUserForm()
      showSuccess('User deleted.')
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  const approveGuideApplication = async (id) => {
    setError(null)
    try {
      await apiFetch(`/api/admin/guide-applications/${id}/approve`, { method: 'POST', body: '{}' }, token)
      showSuccess('Application approved — user is now a guide.')
      await loadGuideApplications()
    } catch (err) {
      setError(err.message || 'Approve failed')
    }
  }

  const rejectGuideApplication = async (id) => {
    const reason = window.prompt('Optional message for the applicant (shown on their apply page):', '') ?? ''
    setError(null)
    try {
      await apiFetch(
        `/api/admin/guide-applications/${id}/reject`,
        { method: 'POST', body: JSON.stringify({ reason }) },
        token
      )
      showSuccess('Application rejected.')
      await loadGuideApplications()
    } catch (err) {
      setError(err.message || 'Reject failed')
    }
  }

  if (user?.role !== 'ADMIN') {
    return <AccessDenied />
  }

  const tabCounts = {
    guides: guides.length,
    activities: activities.length,
    destinations: destinations.length,
    users: users.length,
    guideApplications: guideApplications.length,
    billing: payments.length,
  }

  const tabMeta = {
    guides:       { label: 'Guide profiles',            sub: 'Link platform users to certified guides.' },
    activities:   { label: 'Activities catalogue',       sub: 'Create experiences — use Groq AI to fill metadata from the activity name.' },
    destinations: { label: 'Destination management',    sub: 'Create and maintain destination cards used across search and activities.' },
    users:        { label: 'User management',           sub: 'Create, edit profiles/roles, and delete platform users.' },
    guideApplications: { label: 'Guide applications',   sub: 'Review requests from tourists who want to become guides.' },
    billing:      { label: 'Payments & Reservations',   sub: 'Track paid users, payment status, and reservation records.' },
  }

  return (
    <div className="admin-root">
      <aside className="admin-sidebar-nav">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-sidebar-logo">
            <span className="admin-logo-mark">✈</span>
            SkyRes
          </Link>
          <p className="admin-sidebar-subtitle">Admin Console</p>
        </div>

        <p className="admin-sidebar-label">Navigation</p>
        <nav className="admin-sidebar-tabs">
          {[
            { key: 'guides',       icon: '🧭', label: 'Guides' },
            { key: 'activities',   icon: '🎯', label: 'Activities' },
            { key: 'destinations', icon: '🌍', label: 'Destinations' },
            { key: 'users',        icon: '👥', label: 'Users' },
            { key: 'guideApplications', icon: '📝', label: 'Guide apps' },
            { key: 'billing',      icon: '💳', label: 'Billing' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              className={tab === key ? 'active' : ''}
              onClick={() => setTab(key)}
            >
              <span className="admin-tab-icon">{icon}</span>
              {label}
              {tabCounts[key] > 0 && (
                <span className="admin-tab-count">{tabCounts[key]}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-user">
            <div className="admin-user-avatar">
              {(user?.email?.[0] ?? 'A').toUpperCase()}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-label">Signed in as</div>
              <div className="admin-user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-page-head">
          <div className="admin-page-head-row">
            <h1>
              {tabMeta[tab].label}
              {tabCounts[tab] > 0 && (
                <span className="admin-record-count">{tabCounts[tab]} records</span>
              )}
            </h1>
            <div className="admin-page-actions">
              {(tab === 'destinations' || tab === 'activities' || tab === 'guides') && (
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={seedCatalogNow}
                  disabled={seedLoading}
                >
                  {seedLoading ? <><span className="admin-spinner" /> Seeding…</> : '🌱 Seed sample data'}
                </button>
              )}
            </div>
          </div>
          <p className="admin-page-sub">{tabMeta[tab].sub}</p>
        </header>

        {error && <div className="admin-alert">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

      {tab === 'guides' && (
        <div className="admin-grid">
          <section className="admin-card admin-card--glass">
            <h2>{guideForm.id ? `Edit guide #${guideForm.id}` : 'New guide'}</h2>
            <p className="admin-hint">Links a user account as a guide. <code>userId</code> must exist in the database.</p>
            <form className="admin-form" onSubmit={saveGuide}>
              {!guideForm.id && (
                <label>
                  User ID *
                  <input
                    type="number"
                    min="1"
                    value={guideForm.userId}
                    onChange={(e) => setGuideForm((f) => ({ ...f, userId: e.target.value }))}
                    required={!guideForm.id}
                  />
                </label>
              )}
              <label>
                Languages
                <input
                  type="text"
                  placeholder="e.g. FR, EN, AR"
                  value={guideForm.languages}
                  onChange={(e) => setGuideForm((f) => ({ ...f, languages: e.target.value }))}
                />
              </label>
              <label>
                Hourly rate
                <input
                  type="number"
                  step="0.01"
                  value={guideForm.hourlyRate}
                  onChange={(e) => setGuideForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={guideForm.available}
                  onChange={(e) => setGuideForm((f) => ({ ...f, available: e.target.checked }))}
                />
                Available
              </label>
              <label>
                Region
                <input
                  type="text"
                  value={guideForm.region}
                  onChange={(e) => setGuideForm((f) => ({ ...f, region: e.target.value }))}
                />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn-primary">{guideForm.id ? 'Update' : 'Create'}</button>
                {guideForm.id && (
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={resetGuideForm}>Cancel edit</button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-card admin-card--table admin-card--glass">
            <div className="admin-card-head">
              <h2>All guides</h2>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadGuides} disabled={loading}>
                {loading ? <span className="admin-spinner" /> : '↻'} Refresh
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Languages</th>
                    <th>Rate</th>
                    <th>Region</th>
                    <th>Avail.</th>
                    <th>Rating</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {guides.map((g) => (
                    <tr key={g.id}>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{g.id}</td>
                      <td>
                        {g.user
                          ? <UserCell firstName={g.user.firstName} lastName={g.user.lastName} email={g.user.email} />
                          : <span className="admin-muted">—</span>}
                      </td>
                      <td>{g.languages ?? <span className="admin-muted">—</span>}</td>
                      <td>{g.hourlyRate != null ? `$${g.hourlyRate}/h` : <span className="admin-muted">—</span>}</td>
                      <td>{g.region ?? <span className="admin-muted">—</span>}</td>
                      <td><BoolBadge value={g.available} trueLabel="Available" falseLabel="Unavailable" /></td>
                      <td>{g.averageRating != null ? `⭐ ${g.averageRating.toFixed(1)}` : <span className="admin-muted">—</span>}</td>
                      <td>
                        <div className="admin-actions">
                          <EditBtn onClick={() => editGuide(g)} />
                          <DeleteBtn onClick={() => deleteGuide(g.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && guides.length === 0 && (
                <div className="admin-empty">
                  <span className="admin-empty-icon">🧭</span>
                  No guides yet. Create one using the form.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'activities' && (
        <div className="admin-grid">
          <section className="admin-card admin-card--glass">
            <h2>{activityForm.id ? `Edit activity #${activityForm.id}` : 'New activity'}</h2>
            <p className="admin-hint"><code>destinationId</code> optional — must match an existing destination row ID.</p>

            <div className="admin-ai-panel">
              <div className="admin-ai-panel-head">
                <span className="admin-ai-badge">Groq AI</span>
                <h3>Generate fields from name</h3>
                <p className="admin-ai-desc">Pick a template or type a name, then let the model fill type, description, price, season and min age.</p>
              </div>
              <div className="admin-ai-row">
                <label className="admin-ai-label">
                  Quick template
                  <select
                    className="admin-select"
                    value={templatePick}
                    onChange={(e) => {
                      const v = e.target.value
                      setTemplatePick('')
                      if (v) setActivityForm((f) => ({ ...f, name: v }))
                    }}
                  >
                    <option value="">Choose idea…</option>
                    {ACTIVITY_PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="admin-btn admin-btn-ai"
                  disabled={aiLoading || !activityForm.name?.trim()}
                  onClick={fillActivityWithGroq}
                >
                  {aiLoading ? 'Generating…' : '✨ Fill with AI'}
                </button>
              </div>
            </div>

            <form className="admin-form" onSubmit={saveActivity}>
              <label>
                Name *
                <input
                  type="text"
                  list="activity-presets-list"
                  value={activityForm.name}
                  onChange={(e) => setActivityForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <datalist id="activity-presets-list">
                  {ACTIVITY_PRESETS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </label>
              <label>
                Type
                <input
                  type="text"
                  placeholder="excursion, hiking, diving…"
                  value={activityForm.type}
                  onChange={(e) => setActivityForm((f) => ({ ...f, type: e.target.value }))}
                />
              </label>
              <label>
                Description
                <textarea
                  rows={3}
                  value={activityForm.description}
                  onChange={(e) => setActivityForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  step="0.01"
                  value={activityForm.price}
                  onChange={(e) => setActivityForm((f) => ({ ...f, price: e.target.value }))}
                />
              </label>
              <label>
                Season
                <input
                  type="text"
                  placeholder="summer, winter…"
                  value={activityForm.season}
                  onChange={(e) => setActivityForm((f) => ({ ...f, season: e.target.value }))}
                />
              </label>
              <label>
                Min age
                <input
                  type="number"
                  min="0"
                  value={activityForm.minAge}
                  onChange={(e) => setActivityForm((f) => ({ ...f, minAge: e.target.value }))}
                />
              </label>
              <label>
                Image URL
                <input
                  type="url"
                  value={activityForm.imageUrl}
                  onChange={(e) => setActivityForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </label>
              <label>
                Destination ID
                <input
                  type="number"
                  min="1"
                  placeholder="optional"
                  value={activityForm.destinationId}
                  onChange={(e) => setActivityForm((f) => ({ ...f, destinationId: e.target.value }))}
                />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn-primary">{activityForm.id ? 'Update' : 'Create'}</button>
                {activityForm.id && (
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={resetActivityForm}>Cancel edit</button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-card admin-card--table admin-card--glass">
            <div className="admin-card-head">
              <h2>All activities</h2>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadActivities} disabled={loading}>
                {loading ? <span className="admin-spinner" /> : '↻'} Refresh
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Season</th>
                    <th>Destination</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{a.id}</td>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td>{a.type ? <span className="admin-badge admin-badge-teal">{a.type}</span> : <span className="admin-muted">—</span>}</td>
                      <td>{a.price != null ? <strong>${a.price}</strong> : <span className="admin-muted">—</span>}</td>
                      <td>{a.season ?? <span className="admin-muted">—</span>}</td>
                      <td>
                        {a.destination
                          ? `${a.destination.city ?? ''}, ${a.destination.country ?? ''}`
                          : <span className="admin-muted">—</span>}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <EditBtn onClick={() => editActivity(a)} />
                          <DeleteBtn onClick={() => deleteActivity(a.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && activities.length === 0 && (
                <div className="admin-empty">
                  <span className="admin-empty-icon">🎯</span>
                  No activities yet. Create one or seed sample data.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-grid">
          <section className="admin-card admin-card--glass">
            <h2>{userForm.id ? `Edit user #${userForm.id}` : 'New user'}</h2>
            <p className="admin-hint">Admins can create users and assign role (TOURIST, GUIDE, ADMIN).</p>
            <form className="admin-form" onSubmit={saveUser}>
              <label>
                First name *
                <input
                  type="text"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </label>
              <label>
                Last name *
                <input
                  type="text"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
              <label>
                Password {userForm.id ? '(leave empty to keep current)' : '*'}
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                  required={!userForm.id}
                />
              </label>
              <label>
                Role *
                <select
                  className="admin-select"
                  value={userForm.role}
                  onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="TOURIST">TOURIST</option>
                  <option value="GUIDE">GUIDE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </label>
              <label>
                Phone
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </label>
              <label>
                Photo URL
                <input
                  type="url"
                  value={userForm.photoUrl}
                  onChange={(e) => setUserForm((f) => ({ ...f, photoUrl: e.target.value }))}
                />
              </label>
              <label>
                Bio
                <textarea
                  rows={3}
                  value={userForm.bio}
                  onChange={(e) => setUserForm((f) => ({ ...f, bio: e.target.value }))}
                />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn-primary">{userForm.id ? 'Update' : 'Create'}</button>
                {userForm.id && (
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={resetUserForm}>Cancel edit</button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-card admin-card--table admin-card--glass">
            <div className="admin-card-head">
              <h2>All users</h2>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadUsers} disabled={loading}>
                {loading ? <span className="admin-spinner" /> : '↻'} Refresh
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{u.id}</td>
                      <td><UserCell firstName={u.firstName} lastName={u.lastName} /></td>
                      <td style={{ fontSize: '0.82rem' }}>{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td style={{ fontSize: '0.82rem' }}>{u.phone ?? <span className="admin-muted">—</span>}</td>
                      <td>
                        <div className="admin-actions">
                          <EditBtn onClick={() => editUser(u)} />
                          <DeleteBtn onClick={() => deleteUser(u.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && users.length === 0 && (
                <div className="admin-empty">
                  <span className="admin-empty-icon">👥</span>
                  No users found.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'destinations' && (
        <div className="admin-grid">
          <section className="admin-card admin-card--glass">
            <h2>{destinationForm.id ? `Edit destination #${destinationForm.id}` : 'New destination'}</h2>
            <p className="admin-hint">This section manages destination profiles shown in discovery and search.</p>
            <form className="admin-form" onSubmit={saveDestination}>
              <label>
                Country *
                <input
                  type="text"
                  value={destinationForm.country}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, country: e.target.value }))}
                  required
                />
              </label>
              <label>
                City *
                <input
                  type="text"
                  value={destinationForm.city}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, city: e.target.value }))}
                  required
                />
              </label>
              <label>
                Climate
                <input
                  type="text"
                  value={destinationForm.climate}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, climate: e.target.value }))}
                />
              </label>
              <label>
                Description
                <textarea
                  rows={3}
                  value={destinationForm.description}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label>
                Image URL
                <input
                  type="url"
                  value={destinationForm.imageUrl}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </label>
              <label>
                Estimated budget
                <input
                  type="number"
                  step="0.01"
                  value={destinationForm.estimatedBudget}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, estimatedBudget: e.target.value }))}
                />
              </label>
              <label>
                Average rating (0-5)
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={destinationForm.averageRating}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, averageRating: e.target.value }))}
                />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={destinationForm.trending}
                  onChange={(e) => setDestinationForm((f) => ({ ...f, trending: e.target.checked }))}
                />
                Trending
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn-primary">{destinationForm.id ? 'Update' : 'Create'}</button>
                {destinationForm.id && (
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={resetDestinationForm}>Cancel edit</button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-card admin-card--table admin-card--glass">
            <div className="admin-card-head">
              <h2>All destinations</h2>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadDestinations} disabled={loading}>
                {loading ? <span className="admin-spinner" /> : '↻'} Refresh
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Climate</th>
                    <th>Budget</th>
                    <th>Rating</th>
                    <th>Trending</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {destinations.map((d) => (
                    <tr key={d.id}>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{d.id}</td>
                      <td style={{ fontWeight: 600 }}>{d.city}</td>
                      <td>{d.country}</td>
                      <td>{d.climate ?? <span className="admin-muted">—</span>}</td>
                      <td>{d.estimatedBudget != null ? `$${d.estimatedBudget}` : <span className="admin-muted">—</span>}</td>
                      <td>{d.averageRating != null ? `⭐ ${d.averageRating}` : <span className="admin-muted">—</span>}</td>
                      <td><BoolBadge value={d.trending} trueLabel="Trending" falseLabel="Normal" /></td>
                      <td>
                        <div className="admin-actions">
                          <EditBtn onClick={() => editDestination(d)} />
                          <DeleteBtn onClick={() => deleteDestination(d.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && destinations.length === 0 && (
                <div className="admin-empty">
                  <span className="admin-empty-icon">🌍</span>
                  No destinations found. Seed sample data to get started.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'guideApplications' && (
        <div className="admin-grid">
          <section className="admin-card admin-card--table admin-card--glass" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-card-head">
              <h2>Pending guide applications</h2>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadGuideApplications} disabled={loading}>
                {loading ? <span className="admin-spinner" /> : '↻'} Refresh
              </button>
            </div>
            <p className="admin-hint" style={{ marginTop: 0 }}>
              Approving creates the guide profile, sets the user role to <strong>GUIDE</strong>, and lists them publicly.
              The applicant should refresh their session or sign in again to get a JWT with the new role.
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Applicant</th>
                    <th>Languages</th>
                    <th>Rate</th>
                    <th>Region</th>
                    <th>Pitch</th>
                    <th>Submitted</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {guideApplications.map((a) => (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{a.id}</td>
                      <td>
                        <UserCell firstName={a.userFirstName} lastName={a.userLastName} email={a.userEmail} />
                      </td>
                      <td>{a.languages ?? <span className="admin-muted">—</span>}</td>
                      <td>{a.hourlyRate != null ? `$${a.hourlyRate}/hr` : <span className="admin-muted">—</span>}</td>
                      <td>{a.region ?? <span className="admin-muted">—</span>}</td>
                      <td style={{ maxWidth: 220, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                        {a.pitch || <span className="admin-muted">—</span>}
                      </td>
                      <td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</td>
                      <td>
                        <div className="admin-actions">
                          <button type="button" className="admin-action-btn admin-action-btn-edit" onClick={() => approveGuideApplication(a.id)}>
                            ✓ Approve
                          </button>
                          <button type="button" className="admin-action-btn admin-action-btn-delete" onClick={() => rejectGuideApplication(a.id)}>
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && guideApplications.length === 0 && (
                <div className="admin-empty">
                  <span className="admin-empty-icon">📝</span>
                  No pending applications.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'billing' && (
        <div>
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Total payments</div>
              <div className="admin-stat-card-value teal">{payments.length}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Revenue collected</div>
              <div className="admin-stat-card-value teal">
                ${payments.reduce((s, p) => s + (p.amount ?? 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Reservations</div>
              <div className="admin-stat-card-value">{reservations.length}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card-label">Paid</div>
              <div className="admin-stat-card-value teal">
                {payments.filter(p => (p.status ?? '').toUpperCase() === 'PAID').length}
              </div>
            </div>
          </div>

          <div className="admin-grid">
            <section className="admin-card admin-card--table admin-card--glass">
              <div className="admin-card-head">
                <h2>Payments</h2>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={loadBilling} disabled={loading}>
                  {loading ? <span className="admin-spinner" /> : '↻'} Refresh
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Hotel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{p.id}</td>
                        <td><UserCell firstName={p.userFirstName} lastName={p.userLastName} email={p.userEmail} /></td>
                        <td>{p.amount != null ? <strong>${p.amount}</strong> : <span className="admin-muted">—</span>}</td>
                        <td><PayStatusBadge status={p.status} /></td>
                        <td>{p.method ?? <span className="admin-muted">—</span>}</td>
                        <td>{p.hotelName ?? <span className="admin-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && payments.length === 0 && (
                  <div className="admin-empty">
                    <span className="admin-empty-icon">💳</span>
                    No payments found.
                  </div>
                )}
              </div>
            </section>

            <section className="admin-card admin-card--table admin-card--glass">
              <div className="admin-card-head">
                <h2>Reservations</h2>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Hotel</th>
                      <th>Status</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Persons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id}>
                        <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{r.id}</td>
                        <td><UserCell firstName={r.userFirstName} lastName={r.userLastName} email={r.userEmail} /></td>
                        <td>{r.hotelName ?? <span className="admin-muted">—</span>}</td>
                        <td><PayStatusBadge status={r.status} /></td>
                        <td style={{ fontSize: '0.82rem' }}>{r.checkIn ?? <span className="admin-muted">—</span>}</td>
                        <td style={{ fontSize: '0.82rem' }}>{r.checkOut ?? <span className="admin-muted">—</span>}</td>
                        <td>{r.numberOfPersons ?? <span className="admin-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && reservations.length === 0 && (
                  <div className="admin-empty">
                    <span className="admin-empty-icon">🏨</span>
                    No reservations found.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
