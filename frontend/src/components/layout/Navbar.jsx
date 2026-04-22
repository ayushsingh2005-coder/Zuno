import { Search, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 'var(--navbar-h)',
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      zIndex: 100,
      gap: '2rem',
    }}>

      {/* Logo */}
      <span
        onClick={() => navigate('/')}
        style={{
          fontSize: '1rem',
          letterSpacing: '0.3em',
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: 'calc(var(--sidebar-w) - 2rem)',
        }}
      >
        Z U N O
      </span>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '4px',
        }}>
          <Search size={14} color='var(--text-muted)' />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='SEARCH'
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              width: '100%',
              fontFamily: 'var(--font)',
            }}
          />
        </div>
      </form>

      {/* Right side */}
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        <span style={{
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          color: 'var(--text-muted)',
          cursor: 'pointer',
        }}>
          NOTIFICATIONS
        </span>
        <Bell size={16} color='var(--text-muted)' />

        {/* Avatar */}
        <div
          onClick={() => navigate(user ? '/profile' : '/login')}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--surface-2)',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          {user?.profilePic
            ? <img src={user.profilePic} alt={user.name} style={{ width: '100%', height: '100%' }} />
            : <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: 'var(--text-muted)',
              }}>
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
          }
        </div>
      </div>

    </header>
  )
}