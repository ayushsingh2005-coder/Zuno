import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import api from '../api/axios'
import { usePlayer } from '../context/PlayerContext'

// Normalize song object to consistent shape
const normalize = (song) => ({
  ...song,
  audioUrl: song.audio?.url || song.audioUrl || '',
  thumbnail: song.thumbnail?.url || song.thumbnail || '',
})

function Card({ item, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ flexShrink: 0, width: '180px', cursor: 'pointer' }}
    >
      <div style={{
        width: '180px', height: '180px',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--surface-2)',
        position: 'relative',
      }}>
        {item.thumbnail || item.coverImage?.url || item.coverImage ? (
          <img
            src={item.thumbnail || item.coverImage?.url || item.coverImage}
            alt={item.title || item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: 'var(--text-dim)',
          }}>♪</div>
        )}

        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={18} color='var(--bg)' fill='var(--bg)' />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px' }}>
        <p style={{
          fontSize: '0.82rem', fontWeight: 500,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {item.title || item.name}
        </p>
        <p style={{
          fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {item.artist || item.artistName || ''}
        </p>
      </div>
    </div>
  )
}

function Row({ title, items, onCardClick }) {
  if (!items.length) return null
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{
        fontSize: '2rem', fontWeight: 400,
        letterSpacing: '-0.02em', marginBottom: '1.5rem',
      }}>
        {title}
      </h2>
      <div style={{
        display: 'flex', gap: '1.25rem',
        overflowX: 'auto', paddingBottom: '1rem',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {items.map(item => (
          <Card key={item._id} item={item} onClick={() => onCardClick(item)} />
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const { playList } = usePlayer()
  const navigate = useNavigate()

  const [songs,   setSongs]   = useState([])
  const [albums,  setAlbums]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [songsRes, albumsRes] = await Promise.all([
          api.get('/songs'),
          api.get('/albums'),
        ])

        // normalize handles audio.url → audioUrl and thumbnail.url → thumbnail
        const rawSongs  = songsRes.data.data?.songs  || songsRes.data.data  || []
        const rawAlbums = albumsRes.data.data?.albums || albumsRes.data.data || []

        setSongs(rawSongs.map(normalize))
        setAlbums(rawAlbums)
      } catch (err) {
        console.error('Home fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleSongClick = (song) => {
    const index = songs.findIndex(s => s._id === song._id)
    playList(songs, index)
  }

  const handleAlbumClick = (album) => {
    navigate(`/album/${album._id}`)
  }

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
      <Row title='Curated'  items={songs}  onCardClick={handleSongClick} />
      <Row title='Albums'   items={albums} onCardClick={handleAlbumClick} />
    </div>
  )
}