import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

// 1. Create the context object
const AuthContext = createContext(null)

// 2. Provider — wraps the entire app, holds the state
export function AuthProvider({ children }) {

  const [user, setUser]       = useState(null)   // user object from backend
  const [token, setToken]     = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)   // true while fetching profile

  // ── On app load → verify token + fetch profile ──────
  // Runs once when app starts
  // If token exists in localStorage → fetch user profile from backend
  // If token is invalid → clears everything
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/auth/profile')
      .then(res => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  // ── Login ────────────────────────────────────────────
  // Called from Login page after successful /auth/login
  // Saves token to localStorage + sets user in state
  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken)
    setToken(authToken)
    setUser(userData)
  }

  // ── Logout ───────────────────────────────────────────
  // Calls backend to blacklist token in Redis
  // Then clears everything locally
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) {
      // even if backend fails, clear local state
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  // ── Update user locally ──────────────────────────────
  // Used after profile edit — no need to re-fetch
  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook — any component uses this to access auth
export function useAuth() {
  return useContext(AuthContext)
}