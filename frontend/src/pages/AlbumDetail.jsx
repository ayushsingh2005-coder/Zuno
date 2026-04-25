import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Pause, Clock, ArrowLeft } from 'lucide-react'
import api from '../api/axios'
import { usePlayer } from '../context/PlayerContext'

const normalize = (song) => ({
  ...song,
  audioUrl: typeof song.audio === 'string' ? song.audio : (song.audio?.url || song.audioUrl || ''),
  thumbnail: typeof song.thumbnail === 'string' ? song.thumbnail : (song.thumbnail?.url || ''),
})

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function AlbumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentSong, isPlaying, playList, togglePlay } = usePlayer()

  const [album,   setAlbum]   = useState(null)
  const [songs,   setSongs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredRow, setHoveredRow] = useState(null)

  useEffect(() => {
    api.get(`/albums/${id}`)
      .then(res => {
        const data = res.data.data
        setAlbum(data.album || data)
        const rawSongs = Array.isArray(data.songs) ? data.songs : (Array.isArray(data.album?.songs) ? data.album.songs : [])
        setSongs(rawSongs.map(normalize))
      })
      .catch(err => console.error('Album fetch error:', err))
      .finally(() => setLoading(false))
  }, [id])

  const handlePlayAll = () => {
    if (!songs.length) return
    playList(songs, 0)
  }

  const handleSongClick = (song) => {
    const isCurrent = currentSong?._id === song._id
    if (isCurrent) {
      togglePlay()
    } else {
      const index = songs.findIndex(s => s._id === song._id)
      playList(songs, index)
    }
  }

  const isAlbumPlaying = songs.some(s => s._id === currentSong?._id) && isPlaying

  if (loading) return (
    <div style={{ padding: '3rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
      LOADING...
    </div>
  )

  if (!album) return (
    <div style={{ padding: '3rem 2rem', color: 'var(--text-muted)' }}>
      Album not found.
    </div>
  )

  return (
    <div style={{ padding: '2rem' }}>

      {/* Back button */}
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

      {/* Album header */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', alignItems: 'flex-end' }}>

        {/* Cover */}
        <div style={{
          width: '200px', height: '200px', flexShrink: 0,
          borderRadius: 'var(--radius)',
          background: 'var(--surface-2)',
          overflow: 'hidden',
        }}>
          {album.coverImage?.url || (typeof album.coverImage === 'string' ? album.coverImage : null) ? (
            <img
              src={album.coverImage?.url || (typeof album.coverImage === 'string' ? album.coverImage : '')}
              alt={album.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', color: 'var(--text-dim)',
            }}>♪</div>
          )}
        </div>

        {/* Info */}
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ALBUM
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {album.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {album.artist} · {songs.length} songs
          </p>

          {/* Play all button */}
          <button
            onClick={handlePlayAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0.6rem 1.5rem',
              background: 'var(--text)', color: 'var(--bg)',
              borderRadius: '99px',
              fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em',
            }}
          >
            {isAlbumPlaying ? <Pause size={16} fill='var(--bg)' /> : <Play size={16} fill='var(--bg)' />}
            {isAlbumPlaying ? 'PAUSE' : 'PLAY ALL'}
          </button>
        </div>
      </div>

      {/* Songs table */}
      {songs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No songs in this album.</p>
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
            </tr>
          </thead>
          <tbody>
            {songs.map((song, i) => {
              const isCurrentSong = currentSong?._id === song._id
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
                  {/* Index / playing indicator */}
                  <td style={{ ...tdStyle, width: '40px', color: isCurrentSong ? 'var(--text)' : 'var(--text-muted)' }}>
                    {isCurrentSong && isPlaying
                      ? '▶'
                      : hoveredRow === song._id ? '▶' : i + 1
                    }
                  </td>

                  {/* Thumbnail + Title */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', flexShrink: 0,
                        borderRadius: '4px', overflow: 'hidden',
                        background: 'var(--surface-2)',
                      }}>
                        {song.thumbnail ? (
                          <img src={song.thumbnail} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>♪</div>
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.85rem',
                        color: isCurrentSong ? 'var(--text)' : 'inherit',
                        fontWeight: isCurrentSong ? 600 : 400,
                      }}>
                        {song.title}
                      </span>
                    </div>
                  </td>

                  {/* Artist */}
                  <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {song.artist}
                  </td>

                  {/* Duration */}
                  <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {fmt(song.duration)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

const thStyle = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  color: 'var(--text-muted)',
  fontWeight: 400,
}

const tdStyle = {
  padding: '0.75rem 1rem',
}