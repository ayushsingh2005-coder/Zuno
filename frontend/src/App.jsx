import { useAuth } from './context/AuthContext'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying token...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', letterSpacing: '0.3em' }}>Z U N O</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        AuthContext active ✓
      </p>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        User: {user ? user.name : 'Not logged in'}
      </p>
    </div>
  )
}

export default App