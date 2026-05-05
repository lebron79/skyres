import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import { HomePage } from './pages/HomePage'
import AdminPanel from './pages/AdminPanel'
import Reservations from './pages/Reservations'
import './App.css'

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-2)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin"
          element={!isAuthenticated ? <Navigate to="/" replace /> : <AdminPanel />}
        />
        <Route
          path="/reservations"
          element={!isAuthenticated ? <Navigate to="/" replace /> : <Reservations />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Login />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}