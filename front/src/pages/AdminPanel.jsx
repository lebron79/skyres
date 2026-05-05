import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'
import './AdminPanel.css'

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
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [templatePick, setTemplatePick] = useState('')
  const [error, setError] = useState(null)
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

  useEffect(() => {
    if (tab === 'guides') loadGuides()
    else if (tab === 'activities') loadActivities()
    else loadUsers()
  }, [tab, loadGuides, loadActivities, loadUsers])

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
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Save failed')
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
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Delete failed')
    }
  }

  if (user?.role !== 'ADMIN') {
    return <AccessDenied />
  }

  return (
    <div className="admin-root">
      <aside className="admin-sidebar-nav">
        <Link to="/" className="admin-sidebar-logo">✈ SkyRes</Link>
        <p className="admin-sidebar-label">Console</p>
        <nav className="admin-sidebar-tabs">
          <button type="button" className={tab === 'guides' ? 'active' : ''} onClick={() => setTab('guides')}>
            <span className="admin-tab-icon">👤</span>
            Guides
          </button>
          <button type="button" className={tab === 'activities' ? 'active' : ''} onClick={() => setTab('activities')}>
            <span className="admin-tab-icon">🎯</span>
            Activities
          </button>
          <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
            <span className="admin-tab-icon">🧑</span>
            Users
          </button>
        </nav>
        <p className="admin-sidebar-foot">Signed in as<br /><strong>{user?.email}</strong></p>
      </aside>

      <main className="admin-main">
        <header className="admin-page-head">
          <h1>
            {tab === 'guides'
              ? 'Guide profiles'
              : tab === 'activities'
                ? 'Activities catalogue'
                : 'User management'}
          </h1>
          <p className="admin-page-sub">
            {tab === 'guides'
              ? 'Link platform users to certified guides.'
              : tab === 'activities'
                ? 'Create experiences — use Groq AI to fill metadata from the activity name.'
                : 'Create, edit roles, and delete platform users.'}
          </p>
        </header>

        {error && <div className="admin-alert">{error}</div>}

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
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadGuides} disabled={loading}>Refresh</button>
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
                      <td>{g.id}</td>
                      <td>
                        {g.user ? (
                          <span>{g.user.firstName} {g.user.lastName} <span className="admin-muted">({g.user.email})</span></span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{g.languages ?? '—'}</td>
                      <td>{g.hourlyRate ?? '—'}</td>
                      <td>{g.region ?? '—'}</td>
                      <td>{g.available ? 'Yes' : 'No'}</td>
                      <td>{g.averageRating != null ? g.averageRating.toFixed(1) : '—'}</td>
                      <td className="admin-actions">
                        <button type="button" className="admin-link" onClick={() => editGuide(g)}>Edit</button>
                        <button type="button" className="admin-link danger" onClick={() => deleteGuide(g.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && guides.length === 0 && <p className="admin-empty">No guides yet.</p>}
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
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadActivities} disabled={loading}>Refresh</button>
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
                      <td>{a.id}</td>
                      <td>{a.name}</td>
                      <td>{a.type ?? '—'}</td>
                      <td>{a.price ?? '—'}</td>
                      <td>{a.season ?? '—'}</td>
                      <td>
                        {a.destination
                          ? `${a.destination.city ?? ''}, ${a.destination.country ?? ''} (#${a.destination.id})`
                          : '—'}
                      </td>
                      <td className="admin-actions">
                        <button type="button" className="admin-link" onClick={() => editActivity(a)}>Edit</button>
                        <button type="button" className="admin-link danger" onClick={() => deleteActivity(a.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && activities.length === 0 && <p className="admin-empty">No activities yet.</p>}
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
              <button type="button" className="admin-btn admin-btn-ghost" onClick={loadUsers} disabled={loading}>Refresh</button>
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
                      <td>{u.id}</td>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.phone ?? '—'}</td>
                      <td className="admin-actions">
                        <button type="button" className="admin-link" onClick={() => editUser(u)}>Edit</button>
                        <button type="button" className="admin-link danger" onClick={() => deleteUser(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && users.length === 0 && <p className="admin-empty">No users found.</p>}
            </div>
          </section>
        </div>
      )}
      </main>
    </div>
  )
}
