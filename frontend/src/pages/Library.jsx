import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Plus, Play, Trash2 } from 'lucide-react'
import api from '../api/axios'
import { usePlayer } from '../context/PlayerContext'
import toast from 'react-hot-toast'

const normalize = (song) => ({
  ...song,
  audioUrl: song.audio?.url || song.audioUrl || '',
  thumbnail: song.thumbnail?.url || song.thumbnail || '',
})

export default function Library() {
  const navigate  = useNavigate()
  const { playList, currentSong, isPlaying, togglePlay } = usePlayer()

  const [tab, setTab]               = useState('playlists') // 'playlists' | 'liked'
  const [playlists, setPlaylists]   = useState([])
  const [likedSongs, setLikedSongs] = useState([])
  const [loading, setLoading]       = useState(true)

  // Create playlist modal state
  const [showModal, setShowModal]   = useState(false)
  const [newName, setNewName]       = useState('')
  const [creating, setCreating]     = useState(false)

  const [hoveredRow, setHoveredRow] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [plRes, likedRes] = await Promise.all([
        api.get('/playlists'),
        api.get('/likes'),
      ])
      const rawPlaylists = plRes.data.data?.playlists || plRes.data.data || []
setPlaylists(Array.isArray(rawPlaylists) ? rawPlaylists : [])
      const rawLiked = likedRes.data.data?.songs || likedRes.data.data || []
      setLikedSongs(rawLiked.map(normalize))
    } catch (err) {
      console.error('Library fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Create playlist ──────────────────────────────
  const handleCreatePlaylist = async () => {
    if (!newName.trim()) { toast.error('Enter a playlist name'); return }
    setCreating(true)
    try {
      const res = await api.post('/playlists', { name: newName.trim() })
      const created = res.data.data?.playlist || res.data.data
      setPlaylists(prev => [created, ...prev])
      toast.success('Playlist created!')
      setNewName('')
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  // ── Delete playlist ──────────────────────────────
  const handleDeletePlaylist = async (e, id) => {
    e.stopPropagation() // prevent navigation
    try {
      await api.delete(`/playlists/${id}`)
      setPlaylists(prev => prev.filter(p => p._id !== id))
      toast.success('Playlist deleted')
    } catch (err) {
      toast.error('Failed to delete playlist')
    }
  }

  // ── Unlike song ──────────────────────────────────
  const handleUnlike = async (e, songId) => {
    e.stopPropagation()
    try {
      await api.post(`/likes/${songId}`)
      setLikedSongs(prev => prev.filter(s => s._id !== songId))
      toast.success('Removed from liked songs')
    } catch (err) {
      toast.error('Failed to unlike')
    }
  }

  const handleSongClick = (song) => {
    const isCurrent = currentSong?._id === song._id
    if (isCurrent) {
      togglePlay()
    } else {
      const index = likedSongs.findIndex(s => s._id === song._id)
      playList(likedSongs, index)
    }
  }

  if (loading) return (
    <div style={{ padding: '3rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
      LOADING...
    </div>
  )

  return (
    <div style={{ padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Library</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0.5rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem', letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          <Plus size={14} /> NEW PLAYLIST
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '2rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem',
      }}>
        {['playlists', 'liked'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              paddingBottom: '0.75rem',
              fontSize: '0.75rem', letterSpacing: '0.1em',
              color: tab === t ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: tab === t ? '1px solid var(--text)' : '1px solid transparent',
              transition: 'all 0.15s',
              textTransform: 'uppercase',
            }}
          >
            {t === 'liked' ? `❤ Liked Songs (${likedSongs.length})` : `Playlists (${playlists.length})`}
          </button>
        ))}
      </div>

      {/* ── Playlists tab ── */}
      {tab === 'playlists' && (
        <div>
          {playlists.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-dim)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎵</p>
              <p style={{ fontSize: '0.85rem' }}>No playlists yet</p>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  marginTop: '1rem', padding: '0.5rem 1.5rem',
                  background: 'var(--text)', color: 'var(--bg)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em',
                }}
              >
                CREATE PLAYLIST
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {playlists.map(pl => (
                <div
                  key={pl._id}
                  onClick={() => navigate(`/playlist/${pl._id}`)}
                  onMouseEnter={() => setHoveredRow(pl._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    background: hoveredRow === pl._id ? 'var(--surface)' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  {/* Playlist icon */}
                  <div style={{
                    width: '48px', height: '48px', flexShrink: 0,
                    borderRadius: 'var(--radius)',
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}>
                    🎵
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{pl.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {pl.songs?.length || 0} songs
                    </p>
                  </div>

                  {/* Delete button */}
                  {hoveredRow === pl._id && (
                    <button
                      onClick={(e) => handleDeletePlaylist(e, pl._id)}
                      style={{ color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Liked Songs tab ── */}
      {tab === 'liked' && (
        <div>
          {likedSongs.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-dim)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>💔</p>
              <p style={{ fontSize: '0.85rem' }}>No liked songs yet</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-dim)' }}>
                Click ❤ on any song to like it
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>TITLE</th>
                  <th style={thStyle}>ARTIST</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>UNLIKE</th>
                </tr>
              </thead>
              <tbody>
                {likedSongs.map((song, i) => {
                  const isCurrent = currentSong?._id === song._id
                  return (
                    <tr
                      key={song._id}
                      onClick={() => handleSongClick(song)}
                      onMouseEnter={() => setHoveredRow(song._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: hoveredRow === song._id ? 'var(--surface)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ ...tdStyle, width: '40px', color: 'var(--text-muted)' }}>
                        {isCurrent && isPlaying ? '▶' : hoveredRow === song._id ? '▶' : i + 1}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', flexShrink: 0,
                            borderRadius: '4px', overflow: 'hidden',
                            background: 'var(--surface-2)',
                          }}>
                            {song.thumbnail ? (
                              <img src={song.thumbnail} alt={song.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{
                                width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-dim)',
                              }}>♪</div>
                            )}
                          </div>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: isCurrent ? 600 : 400,
                            color: isCurrent ? 'var(--text)' : 'inherit',
                          }}>
                            {song.title}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {song.artist}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <button
                          onClick={(e) => handleUnlike(e, song._id)}
                          style={{ color: '#e53e3e', padding: '4px' }}
                        >
                          <Heart size={14} fill='#e53e3e' />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Create Playlist Modal ── */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem', width: '360px',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              New Playlist
            </h2>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
              placeholder='Playlist name...'
              autoFocus
              style={{
                width: '100%', padding: '0.65rem 0',
                background: 'none', border: 'none',
                borderBottom: '1px solid var(--border)',
                outline: 'none', color: 'var(--text)',
                fontSize: '0.9rem', fontFamily: 'var(--font)',
                marginBottom: '1.5rem',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 1rem' }}
              >
                CANCEL
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={creating}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: creating ? 'var(--surface-2)' : 'var(--text)',
                  color: creating ? 'var(--text-muted)' : 'var(--bg)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em',
                }}
              >
                {creating ? 'CREATING...' : 'CREATE'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

const thStyle = {
  padding: '0.75rem 1rem', textAlign: 'left',
  fontSize: '0.65rem', letterSpacing: '0.15em',
  color: 'var(--text-muted)', fontWeight: 400,
}

const tdStyle = { padding: '0.75rem 1rem' }