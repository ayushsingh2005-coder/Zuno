import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import PlayerBar from './components/layout/PlayerBar'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div style={{
        paddingTop: 'var(--navbar-h)',
        paddingBottom: 'var(--player-h)',
        paddingLeft: 'var(--sidebar-w)',
        minHeight: '100vh',
      }}>
        <Sidebar />

        {/* Pages will render here */}
        <main style={{ padding: '2rem' }}>
          <h2 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            LAYOUT ACTIVE ✓
          </h2>
        </main>
      </div>

      <PlayerBar />
    </BrowserRouter>
  )
}

export default App