import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import api from '../api/axios'
import { usePlayer } from '../context/PlayerContext'

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

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentSong, isPlaying, playList, togglePlay } = usePlayer()

  const [query,     setQuery]     = useState(searchParams.get('q') || '')
  const [results,   setResults]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const [searched,  setSearched]  = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)

  // On mount — if URL has ?q= already, search immediately
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) doSearch(q)
  }, [])

  // Real-time debounced search — fires 400ms after user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    const timer = setTimeout(() => {
      setSearchParams({ q: query })
      doSearch(query)
    }, 400)
    return () => clearTimeout(timer) // cleanup: reset timer on next keystroke
  }, [query])

  const doSearch = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await api.get(`/songs/search?q=${encodeURIComponent(q.trim())}`)
      const raw = res.data.data?.songs || res.data.data || []
      setResults(raw.map(normalize))
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSongClick = (song) => {
    const isCurrent = currentSong?._id === song._id
    if (isCurrent) {
      togglePlay()
    } else {
      const index = results.findIndex(s => s._id === song._id)
      playList(results, index)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>

      {/* Search input — no form/submit needed anymore */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '8px', maxWidth: '500px',
        }}>
          <SearchIcon size={16} color='var(--text-muted)' />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search songs, artists...'
            autoFocus
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: '1rem', fontFamily: 'var(--font)',
            }}
          />
          {/* Clear button */}
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--text-dim)', fontSize: '1.2rem', lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
          SEARCHING...
        </p>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No results for "{query}"
        </p>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <p style={{
            fontSize: '0.65rem', letterSpacing: '0.15em',
            color: 'var(--text-muted)', marginBottom: '1rem',
          }}>
            {results.length} RESULT{results.length !== 1 ? 'S' : ''}
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>TITLE</th>
                <th style={thStyle}>ARTIST</th>
                <th style={thStyle}>GENRE</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>DURATION</th>
              </tr>
            </thead>
            <tbody>
              {results.map((song, i) => {
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
                    <td style={{ ...tdStyle, width: '40px', color: isCurrent ? 'var(--text)' : 'var(--text-muted)' }}>
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
                          color: isCurrent ? 'var(--text)' : 'inherit',
                          fontWeight: isCurrent ? 600 : 400,
                        }}>
                          {song.title}
                        </span>
                      </div>
                    </td>

                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {song.artist}
                    </td>

                    <td style={{ ...tdStyle, fontSize: '0.82rem' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '99px',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)', fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                      }}>
                        {song.genre}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {fmt(song.duration)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div style={{
          marginTop: '4rem', textAlign: 'center',
          color: 'var(--text-dim)', fontSize: '0.85rem',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</p>
          <p>Search for songs or artists</p>
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