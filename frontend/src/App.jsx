import { useAuth } from './context/AuthContext'
import { usePlayer } from './context/PlayerContext'

function App() {
  const { user, loading } = useAuth()
  const { currentSong, isPlaying } = usePlayer()

  if (loading) return <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', letterSpacing: '0.3em' }}>Z U N O</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        AuthContext ✓ | PlayerContext ✓
      </p>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        User: {user ? user.name : 'Not logged in'}
      </p>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Now playing: {currentSong ? currentSong.title : 'Nothing'}
      </p>
    </div>
  )
}

export default App