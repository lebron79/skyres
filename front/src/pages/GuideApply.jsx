import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './GuideApply.css'

const emptyForm = {
  languages: '',
  hourlyRate: '',
  region: '',
  pitch: '',
}

export default function GuideApply() {
  const { user, token, isAuthenticated, refreshUser } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadMine = useCallback(async () => {
    if (!token) {
      setLatest(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/guide-applications/me', { method: 'GET' }, token)
      setLatest(data)
    } catch {
      setLatest(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadMine()
  }, [loadMine])

  const onChange = (field) => (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, [field]: v }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const hourlyRate = Number(form.hourlyRate)
      if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
        throw new Error('Please enter a valid hourly rate.')
      }
      await apiFetch(
        '/api/guide-applications',
        {
          method: 'POST',
          body: JSON.stringify({
            languages: form.languages.trim(),
            hourlyRate,
            region: form.region.trim(),
            pitch: form.pitch.trim() || undefined,
          }),
        },
        token
      )
      setSuccess('Application submitted. An admin will review it shortly.')
      setForm(emptyForm)
      await loadMine()
    } catch (err) {
      setError(err.message || 'Submit failed')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="apply-root">
        <div className="apply-card">
          <p className="apply-eyebrow">Guide program</p>
          <h1 className="apply-title">Sign in to apply</h1>
          <p className="apply-lead">Create an account or log in to submit a guide application.</p>
          <Link to="/login" className="apply-btn apply-btn-primary" state={{ redirectTo: '/apply-guide' }}>
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  if (user?.role === 'ADMIN') {
    return (
      <div className="apply-root">
        <div className="apply-card">
          <h1 className="apply-title">Not available</h1>
          <p className="apply-lead">Administrator accounts cannot apply as guides.</p>
          <Link to="/">Back home</Link>
        </div>
      </div>
    )
  }

  if (user?.role === 'GUIDE') {
    return (
      <div className="apply-root">
        <div className="apply-card">
          <p className="apply-eyebrow">Guide program</p>
          <h1 className="apply-title">You are a guide</h1>
          <p className="apply-lead">Your account already has the guide role. Thank you for hosting experiences on SkyRes.</p>
          <Link to="/">Back home</Link>
        </div>
      </div>
    )
  }

  const showForm = !latest || latest.status === 'REJECTED'

  const blockedByPending = latest?.status === 'PENDING'
  const approved = latest?.status === 'APPROVED'

  return (
    <div className="apply-root">
      <div className="apply-card">
        <p className="apply-eyebrow">Guide program</p>
        <h1 className="apply-title">Become a SkyRes guide</h1>
        <p className="apply-lead">
          Tell us about your languages and region. After you submit, an administrator will approve or decline your
          request. When approved, your account becomes a guide and your public profile is created.
        </p>

        {loading && <p className="apply-lead">Loading…</p>}

        {error && <div className="apply-alert apply-alert-err">{error}</div>}
        {success && <div className="apply-alert apply-alert-ok">{success}</div>}

        {approved && (
          <div className="apply-status apply-status-approved">
            <strong>Approved.</strong> Your application was accepted. <strong>Sign out and sign back in</strong> so
            your session picks up the guide role, then you will appear on the home page for travelers.
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="apply-btn apply-btn-primary" onClick={() => refreshUser()}>
                Refresh session
              </button>
            </div>
          </div>
        )}

        {blockedByPending && (
          <div className="apply-status apply-status-pending">
            <strong>Pending review.</strong> An admin is reviewing your application. You will see the result here when
            it is processed.
          </div>
        )}

        {latest?.status === 'REJECTED' && (
          <div className="apply-status apply-status-rejected">
            <strong>Previous application was not approved.</strong>
            {latest.rejectionReason ? ` Reason: ${latest.rejectionReason}` : ''} You may submit a new application below.
          </div>
        )}

        {!loading && showForm && !blockedByPending && !approved && (
          <form className="apply-form" onSubmit={submit}>
            <label htmlFor="ga-lang">Languages *</label>
            <input
              id="ga-lang"
              required
              value={form.languages}
              onChange={onChange('languages')}
              placeholder="e.g. English, French, Arabic"
            />
            <label htmlFor="ga-rate">Hourly rate (USD) *</label>
            <input
              id="ga-rate"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.hourlyRate}
              onChange={onChange('hourlyRate')}
              placeholder="45"
            />
            <label htmlFor="ga-region">Primary region *</label>
            <input
              id="ga-region"
              required
              value={form.region}
              onChange={onChange('region')}
              placeholder="e.g. Tunis, Sousse"
            />
            <label htmlFor="ga-pitch">Short pitch (optional)</label>
            <textarea id="ga-pitch" value={form.pitch} onChange={onChange('pitch')} placeholder="Experience, certifications, style of tours…" />
            <div className="apply-actions">
              <button type="submit" className="apply-btn apply-btn-primary" disabled={saving}>
                {saving ? 'Submitting…' : 'Submit application'}
              </button>
              <Link to="/" className="apply-btn" style={{ alignSelf: 'center', textDecoration: 'none', color: 'inherit' }}>
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
