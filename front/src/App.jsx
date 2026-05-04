import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext.jsx";
import Login from './pages/Login';
import { HomePage } from './pages/HomePage';
import AdminPanel from './pages/AdminPanel';
import DestinationsPage from './pages/DestinationsPage';
import Layout from './pages/Layout';
import HotelPage from './pages/HotelPage';
import './App.css';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-2)' }}>Loading...</p>
    </div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route
            path="/"
            element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
          />
          <Route path="/hotels" element={isAuthenticated ? <HotelPage  /> : <Navigate to="/login" replace />} />
          <Route
            path="/destinations"
            element={isAuthenticated ? <DestinationsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" replace />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}