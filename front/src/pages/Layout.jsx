import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import UserMenu from '../components/UserMenu.jsx'
import Settings from './Settings.jsx'

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const navbarRef = useRef(null)
  const [navbarHeight, setNavbarHeight] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location])

  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight)
      }
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return (
    <>
      <nav ref={navbarRef} className="navbar">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">✈</div>
          SkyRes
        </Link>
        <ul className="nav-links">
          <li><Link to="/hotels">Hôtels</Link></li>
          <li><Link to="/destinations">Destinations</Link></li>
          <li><Link to="/#guides">Guides</Link></li>
          <li><Link to="/#activities">Activities</Link></li>
          <li><Link to="/#how">How it works</Link></li>
          <li><Link to="/#reviews">Stories</Link></li>
          <li><Link to="/#team">Team</Link></li>
          {user?.role === 'ADMIN' && (
            <li><Link to="/admin">Admin</Link></li>
          )}
        </ul>
        <div className="nav-right">
          {user ? (
            <UserMenu onSettingsClick={() => setShowSettings(true)} />
          ) : (
            <>
              <Link to="/login" className="nav-signin">Sign in</Link>
              <Link to="/login" className="nav-cta nav-cta-outline">Join</Link>
            </>
          )}
          <Link to="/#destinations" className="nav-cta">Explore</Link>
        </div>
      </nav>

      <div style={{ height: navbarHeight }} />

      <Outlet />

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  )
}
