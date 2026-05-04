import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './Settings.css'

export default function Settings({ onClose }) {
  const { user, token, updateProfile, changePassword, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    photoUrl: '',
    bio: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        photoUrl: user.photoUrl || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage('✗ File size must be less than 5MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setMessage('✗ Only image files are allowed')
      return
    }

    setUploadingImage(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8080/api/upload/profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Upload failed')
      }

      const data = await response.json()
      setProfileForm(prev => ({ ...prev, photoUrl: data.url }))
      setMessage('✓ Image uploaded successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`✗ ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await updateProfile(user.id, profileForm)
      setMessage('✓ Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`✗ ${err.message}`)
    }
    setLoading(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('✗ Passwords do not match')
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage('✗ Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword)
      setMessage('✓ Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`✗ ${err.message}`)
    }
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h1>Settings</h1>
          <button className="settings-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Security
          </button>
        </div>

        {message && <div className={`settings-message ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</div>}

        <div className="settings-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <h2>Profile Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Profile Picture</label>
                <div className="photo-upload-container">
                  {profileForm.photoUrl && (
                    <div className="photo-preview">
                      <img src={`http://localhost:8080${profileForm.photoUrl}`} alt="Profile" />
                      <button
                        type="button"
                        className="photo-remove"
                        onClick={() => setProfileForm(prev => ({ ...prev, photoUrl: '' }))}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <label htmlFor="photoUpload" className="photo-upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Click to upload image</span>
                  </label>
                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage || loading}
                    style={{ display: 'none' }}
                  />
                  {uploadingImage && <div className="upload-spinner">Uploading...</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  disabled={loading}
                  rows="4"
                />
              </div>

              <div className="form-info">
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Role:</strong> <span className="role-badge">{user.role}</span></div>
                <div><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <h2>Change Password</h2>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  placeholder="Min. 8 characters"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
