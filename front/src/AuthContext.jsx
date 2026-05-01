import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:8080';

  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const t = token ?? localStorage.getItem('authToken');
    if (!t) return
    await fetchUserProfile(t)
  }, [token, fetchUserProfile]);

  // Wait for /api/users/me when restoring a session so role matches the server before rendering routes
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const savedToken = localStorage.getItem('authToken')
      if (savedToken) {
        setToken(savedToken)
        await fetchUserProfile(savedToken)
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [fetchUserProfile])

  const register = async (firstName, lastName, email, password, phone = '') => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, phone }),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || 'Registration failed');
      }

      const data = await res.json();
      setToken(data.token);
      setUser({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        photoUrl: data.photoUrl,
        bio: data.bio,
        role: data.role,
        createdAt: data.createdAt
      });
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || 'Login failed');
      }

      const data = await res.json();
      setToken(data.token);
      setUser({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        photoUrl: data.photoUrl,
        bio: data.bio,
        role: data.role,
        createdAt: data.createdAt
      });
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    setError(null);
  };

  const updateProfile = async (userId, updates) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Update failed');
      
      const data = await res.json();
      setUser(prev => ({ ...prev, ...data }));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const changePassword = async (userId, currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) throw new Error('Password change failed');
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
