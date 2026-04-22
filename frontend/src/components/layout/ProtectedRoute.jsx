import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Still verifying token — don't redirect yet
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
      }}>
        LOADING...
      </div>
    )
  }

  // Not logged in → send to login
  if (!user) return <Navigate to='/login' replace />

  // Logged in → render the actual page
  return children
}