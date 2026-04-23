import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Disc3 } from 'lucide-react'
import api from '../api/axios'
import { usePlayer } from '../context/PlayerContext'

// ─────────────────────────────────────────────────────────────────────────────
// Explore.jsx
//
// Two-part page:
//   1. Genre browser  — chips across the top, clicking one filters the song grid
//   2. Albums section — horizontal scroll row at the bottom
//
// Data strategy:
//   We fetch ALL songs once (GET /songs), then filter client-side by genre.
//   This avoids a new API call on every genre chip click — snappy UX.
//   Albums are fetched separately (GET /albums).
//
// Genre list is derived from the songs themselves (song.genre field),
//   so it always stays in sync with whatever your backend has — no hardcoding.
// ─────────────────────────────────────────────────────────────────────────────

// Normalize song shape (same helper as Home.jsx)
const normalize = (song) => ({
  ...song,
  audioUrl:  song.audio?.url   || song.audioUrl  || '',
  thumbnail: song.thumbnail?.url || song.thumbnail || '',
})

// Derive unique genres from songs array, sorted A-Z
const getGenres = (songs) => {
  const set = new Set(songs.map(s => s.genre).filter(Boolean))
  return ['All', ...Array.from(set).sort()]
}

export default function Explore() {
  const { playList } = usePlayer()
  const navigate     = useNavigate()

  const [songs,          setSongs]          = useState([])
  const [albums,         setAlbums]         = useState([])
  const [genres,         setGenres]         = useState(['All'])
  const [activeGenre,    setActiveGenre]    = useState('All')
  const [loading,        setLoading]        = useState(true)
  const [hoveredSong,    setHoveredSong]    = useState(null)
  const [hoveredAlbum,   setHoveredAlbum]   = useState(null)

  // ── Fetch all data once ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [songsRes, albumsRes] = await Promise.all([
          api.get('/songs'),
          api.get('/albums'),
        ])

        const rawSongs  = songsRes.data.data?.songs  || songsRes.data.data  || []
        const rawAlbums = albumsRes.data.data?.albums || albumsRes.data.data || []

        const normalized = rawSongs.map(normalize)
        setSongs(normalized)
        setGenres(getGenres(normalized))
        setAlbums(rawAlbums)
      } catch (err) {
        console.error('Explore fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Filter songs by active genre ───────────────────────────────────────────
  // 'All' → show everything, otherwise filter by song.genre
  const visibleSongs = activeGenre === 'All'
    ? songs
    : songs.filter(s => s.genre === activeGenre)

  // ── Play song (pass full visible list as queue) ───────────────────────────
  const handleSongClick = (song) => {
    const idx = visibleSongs.findIndex(s => s._id === song._id)
    playList(visibleSongs, idx)
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        padding: '3rem 2rem',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
      }}>
        LOADING...
      </div>
    )
  }

  return (
    <div style={{ padding: '2.5rem 2rem' }}>

      {/* ── Page title ── */}
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        marginBottom: '1.75rem',
      }}>
        Explore
      </h2>

      {/* ════════════════════════════════════════════════════════════════════
          GENRE CHIPS
          Horizontal scrollable row. Active chip inverts colors.
          No library needed — just inline style switching.
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        marginBottom: '2rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {genres.map(genre => {
          const isActive = genre === activeGenre
          return (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              style={{
                flexShrink: 0,
                padding: '6px 16px',
                borderRadius: '99px',
                border: `1px solid ${isActive ? 'var(--text)' : 'var(--border)'}`,
                background: isActive ? 'var(--text)' : 'transparent',
                color: isActive ? 'var(--bg)' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {genre.toUpperCase()}
            </button>
          )
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SONGS GRID
          Responsive grid — auto-fill columns at 160px min width.
          No fixed columns so it adapts to any screen width naturally.
      ════════════════════════════════════════════════════════════════════ */}
      {visibleSongs.length === 0 ? (
        <div style={{
          padding: '3rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
        }}>
          NO SONGS IN THIS GENRE
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem',
        }}>
          {visibleSongs.map(song => (
            <SongCard
              key={song._id}
              song={song}
              hovered={hoveredSong === song._id}
              onMouseEnter={() => setHoveredSong(song._id)}
              onMouseLeave={() => setHoveredSong(null)}
              onClick={() => handleSongClick(song)}
            />
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ALBUMS ROW
          Same horizontal scroll pattern as Home.jsx for consistency.
      ════════════════════════════════════════════════════════════════════ */}
      {albums.length > 0 && (
        <section>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
          }}>
            Albums
          </h2>

          <div style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {albums.map(album => (
              <AlbumCard
                key={album._id}
                album={album}
                hovered={hoveredAlbum === album._id}
                onMouseEnter={() => setHoveredAlbum(album._id)}
                onMouseLeave={() => setHoveredAlbum(null)}
                onClick={() => navigate(`/album/${album._id}`)}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

// ─── SongCard ─────────────────────────────────────────────────────────────────
// Grid card — slightly different from Home's Card (shows genre tag)

function SongCard({ song, hovered, onMouseEnter, onMouseLeave, onClick }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--surface-2)',
        position: 'relative',
      }}>
        {song.thumbnail ? (
          <img
            src={song.thumbnail}
            alt={song.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-dim)',
          }}>
            <Disc3 size={32} />
          </div>
        )}

        {/* Play overlay on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={16} color='var(--bg)' fill='var(--bg)' />
            </div>
          </div>
        )}
      </div>

      {/* Info below thumbnail */}
      <div style={{ marginTop: '10px' }}>
        <p style={{
          fontSize: '0.82rem',
          fontWeight: 500,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {song.title}
        </p>
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginTop: '2px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {song.artist || song.artistName || ''}
        </p>

        {/* Genre tag — only shown in Explore, not Home */}
        {song.genre && (
          <span style={{
            display: 'inline-block',
            marginTop: '6px',
            padding: '2px 8px',
            background: 'var(--surface-2)',
            borderRadius: '99px',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            color: 'var(--text-dim)',
          }}>
            {song.genre.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── AlbumCard ────────────────────────────────────────────────────────────────
// Horizontal scroll card — same shape as Home's Card

function AlbumCard({ album, hovered, onMouseEnter, onMouseLeave, onClick }) {
  const cover =
    album.coverImage?.url ||
    album.coverImage    ||
    album.thumbnail     ||
    null

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ flexShrink: 0, width: '180px', cursor: 'pointer' }}
    >
      <div style={{
        width: '180px', height: '180px',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--surface-2)',
        position: 'relative',
      }}>
        {cover ? (
          <img
            src={cover}
            alt={album.title || album.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-dim)',
          }}>
            <Disc3 size={36} />
          </div>
        )}

        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={16} color='var(--bg)' fill='var(--bg)' />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <p style={{
          fontSize: '0.82rem',
          fontWeight: 500,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {album.title || album.name}
        </p>
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginTop: '2px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {album.artist || album.artistName || ''}
        </p>
      </div>
    </div>
  )
}