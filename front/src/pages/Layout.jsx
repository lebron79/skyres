import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import UserMenu from '../components/UserMenu.jsx'
import Settings from './Settings.jsx'
import TripCartSidebar from '../components/TripCartSidebar.jsx'
import SkyAssistant from '../components/SkyAssistant.jsx'

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
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Accueil
            </NavLink>
          </li>
          <li>
            <NavLink to="/hotels" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Hôtels
            </NavLink>
          </li>
          <li>
            <NavLink to="/destinations" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Destinations
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/reservations" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Reservations
              </NavLink>
            </li>
          )}
          {user?.role === 'TOURIST' && (
            <li>
              <NavLink to="/apply-guide" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Become a guide
              </NavLink>
            </li>
          )}
          <li>
            <Link
              to="/#guides"
              className={location.pathname === '/' && location.hash === '#guides' ? 'active' : undefined}
            >
              Guides
            </Link>
          </li>
          <li>
            <Link
              to="/#activities"
              className={location.pathname === '/' && location.hash === '#activities' ? 'active' : undefined}
            >
              Activities
            </Link>
          </li>
          <li>
            <Link
              to="/#how"
              className={location.pathname === '/' && location.hash === '#how' ? 'active' : undefined}
            >
              How it works
            </Link>
          </li>
          <li>
            <Link
              to="/#reviews"
              className={location.pathname === '/' && location.hash === '#reviews' ? 'active' : undefined}
            >
              Stories
            </Link>
          </li>
          <li>
            <Link
              to="/#team"
              className={location.pathname === '/' && location.hash === '#team' ? 'active' : undefined}
            >
              Team
            </Link>
          </li>
          {user?.role === 'ADMIN' && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Admin
              </NavLink>
            </li>
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

      <div className="layout-shell">
        <div className="layout-shell-main">
          <Outlet />
        </div>
        <TripCartSidebar />
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <SkyAssistant />
    </>
  )
}
