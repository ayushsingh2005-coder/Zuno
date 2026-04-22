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
import PlaylistDetail from './pages/PlaylistDetail'
import AlbumDetail    from './pages/AlbumDetail'
import Profile        from './pages/Profile'
import Login          from './pages/Login'
import Register       from './pages/Register'

// Auth pages use a different layout (no sidebar/player)
function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      {children}
    </div>
  )
}

// Main app layout (with sidebar, navbar, player)
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{
        paddingTop: 'var(--navbar-h)',
        paddingBottom: 'var(--player-h)',
        paddingLeft: 'var(--sidebar-w)',
        minHeight: '100vh',
      }}>
        <Sidebar />
        <main>{children}</main>
      </div>
      <PlayerBar />
    </>
  )
}

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
          },
        }}
      />

      <Routes>

        {/* ── Auth pages (no sidebar/player) ── */}
        <Route path='/login' element={
          <AuthLayout><Login /></AuthLayout>
        } />
        <Route path='/register' element={
          <AuthLayout><Register /></AuthLayout>
        } />

        {/* ── Protected pages (need login) ── */}
        <Route path='/' element={
          <ProtectedRoute>
            <AppLayout><Home /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path='/explore' element={
          <ProtectedRoute>
            <AppLayout><Explore /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path='/search' element={
          <ProtectedRoute>
            <AppLayout><Search /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path='/library' element={
          <ProtectedRoute>
            <AppLayout><Library /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path='/playlist/:id' element={
          <ProtectedRoute>
            <AppLayout><PlaylistDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path='/album/:id' element={
          <ProtectedRoute>
            <AppLayout><AlbumDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        } />

        {/* ── Catch all → redirect home ── */}
        <Route path='*' element={<Navigate to='/' replace />} />

      </Routes>

    </BrowserRouter>
  )
}