import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserMenu({ onSettingsClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="user-menu-wrapper">
      <button className="user-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="user-avatar">
          {user.photoUrl ? (
            <img src={`http://localhost:9000${user.photoUrl}`} alt={user.firstName} />
          ) : (
            <>{user.firstName?.[0]}{user.lastName?.[0]}</>
          )}
        </div>
        <div className="user-menu-text">
          <span className="user-menu-name">{user.firstName}</span>
          <span className="user-menu-role">{user.role}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-item user-info">
            <div className="user-avatar-lg">
              {user.photoUrl ? (
                <img src={`http://localhost:9000${user.photoUrl}`} alt={user.firstName} />
              ) : (
                <>{user.firstName?.[0]}{user.lastName?.[0]}</>
              )}
            </div>
            <div>
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-role-badge">{user.role}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <div className="user-menu-divider" />
          <Link className="user-menu-item" to="/payments" onClick={() => setIsOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Payment history
          </Link>
          <button className="user-menu-item" onClick={() => { onSettingsClick?.(); setIsOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <path d="M12 1v6m0 6v6"></path>
              <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"></path>
              <path d="M1 12h6m6 0h6"></path>
              <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
            </svg>
            Settings
          </button>
          <div className="user-menu-divider" />
          <button className="user-menu-item logout" onClick={() => { logout(); setIsOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path>
              <polyline points="17 16 21 12 17 8"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      )}

      <style>{`
        .user-menu-wrapper {
          position: relative;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          padding: 6px 12px;
          border-radius: var(--r-sm);
          color: var(--text-2);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .user-menu-trigger:hover {
          background: var(--bg-alt);
          color: var(--text);
        }

        .user-menu-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-start;
        }

        .user-menu-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-menu-role {
          font-size: 0.75rem;
          color: var(--teal);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--teal);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          overflow: hidden;
        }

        .user-avatar:has(img) {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-menu-trigger svg {
          transition: transform 0.2s;
        }

        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-sm);
          box-shadow: var(--shadow-md);
          margin-top: 8px;
          min-width: 260px;
          z-index: 100;
          overflow: hidden;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text);
          background: none;
          border: none;
          font-family: inherit;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.2s;
          font-size: 0.9rem;
          text-decoration: none;
          box-sizing: border-box;
        }

        .user-menu-item:hover {
          background: var(--bg-alt);
        }

        .user-info {
          cursor: default;
          pointer-events: none;
        }

        .user-info:hover {
          background: var(--surface);
        }

        .user-avatar-lg {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--teal);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          flex-shrink: 0;
          overflow: hidden;
        }

        .user-avatar-lg:has(img) {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
        }

        .user-avatar-lg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-name {
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }

        .user-role-badge {
          font-size: 0.75rem;
          color: white;
          background: var(--teal);
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          display: inline-block;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 0.8rem;
          color: var(--text-3);
        }

        .user-menu-divider {
          height: 1px;
          background: var(--border);
          margin: 0;
        }

        .logout {
          color: #991b1b;
          padding: 10px 16px !important;
        }

        .logout:hover {
          background: rgba(220, 38, 38, 0.08);
        }

        .logout svg {
          color: #991b1b;
        }
      `}</style>
    </div>
  )
}

