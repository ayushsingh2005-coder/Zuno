import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Layout
import Navbar          from './components/layout/Navbar'
import Sidebar         from './components/layout/Sidebar'
import PlayerBar       from './components/layout/PlayerBar'
import ProtectedRoute  from './components/layout/ProtectedRoute'

// Pages
import Home           from './pages/Home'
import Explore        from './pages/Explore'
import Search         from './pages/Search'
import Library        from './pages/Library'
import Profile        from './pages/Profile'
import Login          from './pages/Login'
import Register       from './pages/Register'
import AlbumDetail    from './pages/AlbumDetail'
import PlaylistDetail from './pages/PlaylistDetail'

export default function App() {
  return (
    <BrowserRouter>

      {/* Toast notifications — works everywhere in app */}
      <Toaster
        position='top-right'
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font)',
          },
        }}
      />

      <Navbar />

      <div style={{
        paddingTop:    'var(--navbar-h)',
        paddingBottom: 'var(--player-h)',
        paddingLeft:   'var(--sidebar-w)',
        minHeight:     '100vh',
      }}>
        <Sidebar />

        <main style={{ padding: '2rem' }}>
          <Routes>

            {/* ── Public Routes ── */}
            <Route path='/'        element={<Home />} />
            <Route path='/explore' element={<Explore />} />
            <Route path='/search'  element={<Search />} />
            <Route path='/login'   element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/album/:id' element={<AlbumDetail />} />

            {/* ── Protected Routes ── */}
            <Route path='/library' element={
              <ProtectedRoute><Library /></ProtectedRoute>
            }/>
            <Route path='/profile' element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            }/>
            <Route path='/playlist/:id' element={
              <ProtectedRoute><PlaylistDetail /></ProtectedRoute>
            }/>

            {/* ── Fallback ── */}
            <Route path='*' element={<Navigate to='/' replace />} />

          </Routes>
        </main>
      </div>

      <PlayerBar />

    </BrowserRouter>
  )
}