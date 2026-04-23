import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Pause, ArrowLeft, Plus, Trash2, Clock } from 'lucide-react'
import api from '../api/axios'
import { usePlayer } from '../context/PlayerContext'
import toast from 'react-hot-toast'

const normalize = (song) => ({
  ...song,
  audioUrl: song.audio?.url || song.audioUrl || '',
  thumbnail: song.thumbnail?.url || song.thumbnail || '',
})

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentSong, isPlaying, playList, togglePlay } = usePlayer()

  const [playlist,   setPlaylist]   = useState(null)
  const [songs,      setSongs]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [hoveredRow, setHoveredRow] = useState(null)

  // Add song modal
  const [showAdd,    setShowAdd]    = useState(false)
  const [allSongs,   setAllSongs]   = useState([])
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    fetchPlaylist()
  }, [id])

  const fetchPlaylist = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/playlists/${id}`)
      const data = res.data.data
      const pl = data?.playlist || data
      setPlaylist(pl)
      const raw = pl.songs || []
      setSongs(raw.map(normalize))
    } catch (err) {
      console.error('Playlist fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Play all ─────────────────────────────────────
  const handlePlayAll = () => {
    if (!songs.length) return
    playList(songs, 0)
  }

  // ── Song click ───────────────────────────────────
  const handleSongClick = (song) => {
    const isCurrent = currentSong?._id === song._id
    if (isCurrent) {
      togglePlay()
    } else {
      const index = songs.findIndex(s => s._id === song._id)
      playList(songs, index)
    }
  }

  // ── Remove song from playlist ────────────────────
  const handleRemoveSong = async (e, songId) => {
    e.stopPropagation()
    try {
      await api.delete(`/playlists/${id}/songs`, { data: { songId } })
      setSongs(prev => prev.filter(s => s._id !== songId))
      toast.success('Song removed')
    } catch (err) {
      toast.error('Failed to remove song')
    }
  }

  // ── Open add song modal ──────────────────────────
  const handleOpenAdd = async () => {
    setShowAdd(true)
    setAddLoading(true)
    try {
      const res = await api.get('/songs')
      const raw = res.data.data?.songs || []
      // Filter out songs already in playlist
      const existing = new Set(songs.map(s => s._id))
      setAllSongs(raw.map(normalize).filter(s => !existing.has(s._id)))
    } catch (err) {
      toast.error('Failed to load songs')
    } finally {
      setAddLoading(false)
    }
  }

  // ── Add song to playlist ─────────────────────────
  const handleAddSong = async (song) => {
    try {
      await api.post(`/playlists/${id}/songs`, { songId: song._id })
      setSongs(prev => [...prev, song])
      setAllSongs(prev => prev.filter(s => s._id !== song._id))
      toast.success(`"${song.title}" added!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add song')
    }
  }

  const isPlaylistPlaying = songs.some(s => s._id === currentSong?._id) && isPlaying

  if (loading) return (
    <div style={{ padding: '3rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
      LOADING...
    </div>
  )

  if (!playlist) return (
    <div style={{ padding: '3rem 2rem', color: 'var(--text-muted)' }}>
      Playlist not found.
    </div>
  )

  return (
    <div style={{ padding: '2rem' }}>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: 'var(--text-muted)', fontSize: '0.8rem',
          marginBottom: '2rem', letterSpacing: '0.05em',
        }}
      >
        <ArrowLeft size={14} /> BACK
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', alignItems: 'flex-end' }}>
        {/* Cover */}
        <div style={{
          width: '200px', height: '200px', flexShrink: 0,
          borderRadius: 'var(--radius)',
          background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '4rem',
        }}>
          🎵
        </div>

        {/* Info */}
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            PLAYLIST
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {playlist.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {songs.length} songs
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handlePlayAll}
              disabled={!songs.length}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.6rem 1.5rem',
                background: songs.length ? 'var(--text)' : 'var(--surface-2)',
                color: songs.length ? 'var(--bg)' : 'var(--text-dim)',
                borderRadius: '99px',
                fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em',
              }}
            >
              {isPlaylistPlaying
                ? <Pause size={16} fill='var(--bg)' />
                : <Play size={16} fill={songs.length ? 'var(--bg)' : 'var(--text-dim)'} />
              }
              {isPlaylistPlaying ? 'PAUSE' : 'PLAY ALL'}
            </button>

            <button
              onClick={handleOpenAdd}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.6rem 1.2rem',
                border: '1px solid var(--border)',
                borderRadius: '99px',
                fontSize: '0.8rem', letterSpacing: '0.1em',
                color: 'var(--text-muted)',
              }}
            >
              <Plus size={14} /> ADD SONGS
            </button>
          </div>
        </div>
      </div>

      {/* Songs table */}
      {songs.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-dim)' }}>
          <p style={{ fontSize: '0.85rem' }}>No songs yet</p>
          <button
            onClick={handleOpenAdd}
            style={{
              marginTop: '1rem', padding: '0.5rem 1.5rem',
              background: 'var(--text)', color: 'var(--bg)',
              borderRadius: 'var(--radius)',
              fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em',
            }}
          >
            ADD SONGS
          </button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>TITLE</th>
              <th style={thStyle}>ARTIST</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>
                <Clock size={14} color='var(--text-muted)' />
              </th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, i) => {
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
                  <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {fmt(song.duration)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {hoveredRow === song._id && (
                      <button
                        onClick={(e) => handleRemoveSong(e, song._id)}
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* ── Add Songs Modal ── */}
      {showAdd && (
        <div
          onClick={() => setShowAdd(false)}
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
              padding: '2rem', width: '480px',
              maxHeight: '70vh', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Add Songs</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>×</button>
            </div>

            {addLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '2rem' }}>
                LOADING...
              </p>
            ) : allSongs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                All songs already added!
              </p>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {allSongs.map(song => (
                  <div
                    key={song._id}
                    onClick={() => handleAddSong(song)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{song.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{song.artist}</p>
                    </div>
                    <Plus size={14} color='var(--text-muted)' />
                  </div>
                ))}
              </div>
            )}
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