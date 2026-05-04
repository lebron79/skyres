import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

const SLIDESHOW_URLS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80',
]

function safeRedirectPath(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const goAfterAuth = () => {
    const target = safeRedirectPath(location.state?.redirectTo)
    navigate(target ?? '/', { replace: true })
  }

  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDESHOW_URLS.length)
    }, 5200)
    return () => clearInterval(id)
  }, [])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (pwd) => {
    return pwd.length >= 8
  }

  const handleSubmitLogin = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    const errors = {}

    if (!email.trim()) errors.email = 'Email is required'
    else if (!validateEmail(email)) errors.email = 'Invalid email format'

    if (!password.trim()) errors.password = 'Password is required'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      goAfterAuth()
    } catch (err) {
      setError(err.message || 'Login failed')
    }
    setLoading(false)
  }

  const handleSubmitRegister = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    const errors = {}

    // Validation
    if (!firstName.trim()) errors.firstName = 'First name is required'
    else if (firstName.trim().length < 2) errors.firstName = 'First name must be at least 2 characters'

    if (!lastName.trim()) errors.lastName = 'Last name is required'
    else if (lastName.trim().length < 2) errors.lastName = 'Last name must be at least 2 characters'

    if (!email.trim()) errors.email = 'Email is required'
    else if (!validateEmail(email)) errors.email = 'Invalid email format'

    if (!password.trim()) errors.password = 'Password is required'
    else if (!validatePassword(password)) errors.password = 'Password must be at least 8 characters'

    if (!confirmPassword.trim()) errors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'

    if (phone.trim() && phone.trim().length < 5) errors.phone = 'Invalid phone number'

    if (!termsAccepted) errors.terms = 'You must accept the terms and conditions'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await register(firstName.trim(), lastName.trim(), email.trim(), password, phone.trim())
      goAfterAuth()
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-bg-blur-wrap" aria-hidden>
        <div className="login-slideshow">
          {SLIDESHOW_URLS.map((url, i) => (
            <div
              key={url}
              className={`login-slide ${i === slideIndex ? 'login-slide--active' : ''}`}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
          <div className="login-slide-scrim" />
        </div>
      </div>

      <Link to="/" className="login-back-home">← SkyRes home</Link>

      <div className="login-layout">
        <div className="login-center-stack">
          <div className="login-container login-modal-card">
        {/* Logo section */}
        <div className="login-header">
          <div className="login-logo-mark">✈</div>
          <h1>SkyRes</h1>
          <p>{isLogin ? 'Welcome back to your travel companion' : 'Join SkyRes and explore the world'}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {isLogin ? (
          <form onSubmit={handleSubmitLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                Email Address
                <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
                <span className="required">*</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={fieldErrors.password ? 'error' : ''}
              />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="login-footer">
              <p>Don't have an account? <button type="button" onClick={() => { setIsLogin(false); setError(''); setFieldErrors({}); }} className="link">Create one</button></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitRegister} className="login-form">
            {/* Name Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  First Name
                  <span className="required">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  className={fieldErrors.firstName ? 'error' : ''}
                />
                {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">
                  Last Name
                  <span className="required">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  className={fieldErrors.lastName ? 'error' : ''}
                />
                {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email-reg">
                Email Address
                <span className="required">*</span>
              </label>
              <input
                id="email-reg"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={fieldErrors.email ? 'error' : ''}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
                <span className="optional">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className={fieldErrors.phone ? 'error' : ''}
              />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password-reg">
                Password
                <span className="required">*</span>
              </label>
              <input
                id="password-reg"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={fieldErrors.password ? 'error' : ''}
              />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              <span className="field-hint">Use at least 8 characters with uppercase, lowercase, and numbers</span>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
                <span className="required">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className={fieldErrors.confirmPassword ? 'error' : ''}
              />
              {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
            </div>

            {/* Terms & Conditions */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={loading}
                />
                <span>I agree to the <a href="#" className="link" onClick={(e) => e.preventDefault()}>Terms & Conditions</a> and <a href="#" className="link" onClick={(e) => e.preventDefault()}>Privacy Policy</a></span>
                <span className="required">*</span>
              </label>
              {fieldErrors.terms && <span className="field-error">{fieldErrors.terms}</span>}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="login-footer">
              <p>Already have an account? <button type="button" onClick={() => { setIsLogin(true); setError(''); setFieldErrors({}); }} className="link">Sign in</button></p>
            </div>
          </form>
        )}
          </div>

          <div className="login-slide-dots" role="tablist" aria-label="Background photos">
            {SLIDESHOW_URLS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`login-slide-dot ${i === slideIndex ? 'login-slide-dot--active' : ''}`}
                aria-label={`Show background ${i + 1}`}
                aria-selected={i === slideIndex}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
