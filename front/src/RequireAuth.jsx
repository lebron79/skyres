import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

/** Sends guests to /login with return path in location.state.redirectTo */
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const loc = useLocation()

  if (!isAuthenticated) {
    const redirectTo = `${loc.pathname}${loc.search || ''}`
    return <Navigate to="/login" replace state={{ redirectTo }} />
  }
  return children
}
