import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import { HomePage } from './pages/HomePage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import DestinationsPage from './pages/DestinationsPage.jsx'
import Layout from './pages/Layout.jsx'
import HotelPage from './pages/HotelPage.jsx'
import PaymentPage from './PaymentPage.jsx'
import PaymentSuccess from './PaymentSuccess.jsx'
import PaymentCancel from './PaymentCancel.jsx'
import RequireAuth from './RequireAuth.jsx'
import './App.css'

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg)',
        }}
      >
        <p style={{ color: 'var(--text-2)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/hotels"
            element={
              isAuthenticated ? <HotelPage /> : <Navigate to="/login" replace state={{ redirectTo: '/hotels' }} />
            }
          />
          <Route
            path="/destinations"
            element={
              isAuthenticated ? (
                <DestinationsPage />
              ) : (
                <Navigate to="/login" replace state={{ redirectTo: '/destinations' }} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route
            path="/payment"
            element={
              <RequireAuth>
                <PaymentPage />
              </RequireAuth>
            }
          />
          <Route
            path="/payment/success"
            element={
              <RequireAuth>
                <PaymentSuccess />
              </RequireAuth>
            }
          />
          <Route
            path="/payment/cancel"
            element={
              <RequireAuth>
                <PaymentCancel />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
