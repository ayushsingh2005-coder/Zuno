import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function Sidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])

  // Fetch user's playlists for sidebar list
  useEffect(() => {
    if (!user) return
    api.get('/playlists')
      .then(res => {
        const data = res.data.data;
        setPlaylists(Array.isArray(data) ? data : []);
      })
      .catch(() => setPlaylists([]))
  }, [user])

  const navStyle = (isActive) => ({
    display: 'block',
    padding: '6px 0',
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    color: isActive ? 'var(--text)' : 'var(--text-muted)',
    fontWeight: isActive ? 600 : 400,
    transition: 'color 0.15s',
  })

  return (
    <aside style={{
      position: 'fixed',
      top: 'var(--navbar-h)',
      left: 0,
      bottom: 'var(--player-h)',
      width: 'var(--sidebar-w)',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      overflowY: 'auto',
      borderRight: '1px solid var(--border)',
    }}>

      {/* Main nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[
          { to: '/',        label: 'HOME'    },
          { to: '/explore', label: 'EXPLORE' },
          { to: '/search',  label: 'SEARCH'  },
          { to: '/library', label: 'LIBRARY' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => navStyle(isActive)}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Playlists section — only shown when logged in */}
      {user && (
        <div>
          <p style={{
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: 'var(--text-dim)',
            marginBottom: '1rem',
          }}>
            PLAYLISTS
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.isArray(playlists) && playlists.map(pl => (
              <span
                key={pl._id}
                onClick={() => navigate(`/playlist/${pl._id}`)}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                {pl.name}
              </span>
            ))}

            {/* Create new playlist */}
            <span
              onClick={() => navigate('/library')}
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              + New Playlist
            </span>
          </div>
        </div>
      )}

    </aside>
  )
}