import { useEffect, useState } from 'react'
import { Trash2, Upload, Plus, X, Music, Disc3 } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// AdminPanel.jsx
//
// Two tabs:
//   1. Songs  — upload new song (audio + thumbnail), delete existing
//   2. Albums — create new album, add/remove songs from album, delete album
//
// API calls used:
//   GET    /songs              → load all songs
//   POST   /songs              → upload new song (multipart)
//   DELETE /songs/:id          → delete song
//   GET    /albums             → load all albums
//   POST   /albums             → create album
//   POST   /albums/:id/songs   → add song to album
//   DELETE /albums/:id/songs   → remove song from album
//   DELETE /albums/:id         → delete album
// ─────────────────────────────────────────────────────────────────────────────

const TABS = ['SONGS', 'ALBUMS']

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('SONGS')

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '800px' }}>

      <h2 style={{
        fontSize: '2rem',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        marginBottom: '2rem',
      }}>
        Admin Panel
      </h2>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.6rem 1.5rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: activeTab === tab ? 'var(--text)' : 'var(--text-dim)',
              borderBottom: activeTab === tab
                ? '1px solid var(--text)'
                : '1px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'SONGS'  && <SongsTab />}
      {activeTab === 'ALBUMS' && <AlbumsTab />}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SONGS TAB
// ─────────────────────────────────────────────────────────────────────────────

function SongsTab() {
  const [songs,     setSongs]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState(null)   // song._id being deleted

  // Upload form state
  const [form, setForm] = useState({
    title: '', artist: '', genre: '', duration: '',
  })
  const [audioFile,     setAudioFile]     = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [showForm,      setShowForm]      = useState(false)

  // ── Fetch songs ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const res  = await api.get('/songs')
      const data = res.data.data?.songs || res.data.data || []
      setSongs(data)
    } catch {
      toast.error('Failed to load songs')
    } finally {
      setLoading(false)
    }
  }

  // ── Upload song ────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!form.title || !form.artist || !audioFile) {
      return toast.error('Title, artist and audio file are required')
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title',     form.title)
      formData.append('artist',    form.artist)
      formData.append('genre',     form.genre)
      formData.append('duration',  form.duration)
      formData.append('audio',     audioFile)
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile)

      const res = await api.post('/songs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setSongs(prev => [res.data.data, ...prev])
      setForm({ title: '', artist: '', genre: '', duration: '' })
      setAudioFile(null)
      setThumbnailFile(null)
      setShowForm(false)
      toast.success('Song uploaded!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Delete song ────────────────────────────────────────────────────────────
  const handleDelete = async (song) => {
    if (!window.confirm(`Delete "${song.title}"?`)) return
    setDeleting(song._id)
    try {
      await api.delete(`/songs/${song._id}`)
      setSongs(prev => prev.filter(s => s._id !== song._id))
      toast.success('Song deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <Loader />

  return (
    <div>
      {/* ── Upload toggle button ── */}
      <button
        onClick={() => setShowForm(p => !p)}
        style={addBtnStyle}
      >
        {showForm ? <X size={14} /> : <Plus size={14} />}
        {showForm ? 'CANCEL' : 'UPLOAD SONG'}
      </button>

      {/* ── Upload form ── */}
      {showForm && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label='TITLE'>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder='Song title'
                style={inputStyle}
              />
            </FormField>
            <FormField label='ARTIST'>
              <input
                value={form.artist}
                onChange={e => setForm(p => ({ ...p, artist: e.target.value }))}
                placeholder='Artist name'
                style={inputStyle}
              />
            </FormField>
            <FormField label='GENRE'>
              <input
                value={form.genre}
                onChange={e => setForm(p => ({ ...p, genre: e.target.value }))}
                placeholder='e.g. Hip-Hop'
                style={inputStyle}
              />
            </FormField>
            <FormField label='DURATION (seconds)'>
              <input
                type='number'
                value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder='e.g. 214'
                style={inputStyle}
              />
            </FormField>
          </div>

          {/* File inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label='AUDIO FILE *'>
              <FileInput
                accept='audio/*'
                file={audioFile}
                onChange={setAudioFile}
                icon={<Music size={13} />}
              />
            </FormField>
            <FormField label='THUMBNAIL (optional)'>
              <FileInput
                accept='image/*'
                file={thumbnailFile}
                onChange={setThumbnailFile}
                icon={<Upload size={13} />}
              />
            </FormField>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={submitBtnStyle(uploading)}
          >
            {uploading ? 'UPLOADING...' : 'UPLOAD'}
          </button>
        </div>
      )}

      {/* ── Songs list ── */}
      {songs.length === 0 ? (
        <Empty text='NO SONGS YET' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {songs.map(song => {
            const thumb =
              typeof song.thumbnail === 'string' ? song.thumbnail : (song.thumbnail?.url || null)
            return (
              <div
                key={song._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  background: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: '4px',
                  background: 'var(--surface-2)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {thumb
                    ? <img src={thumb} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Music size={14} color='var(--text-dim)' />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.83rem', fontWeight: 500,
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>
                    {song.title}
                  </p>
                  <p style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>
                    {song.artist} {song.genre ? `· ${song.genre}` : ''}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(song)}
                  disabled={deleting === song._id}
                  style={{
                    color: deleting === song._id ? 'var(--text-dim)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                    padding: '6px',
                    borderRadius: 'var(--radius)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ALBUMS TAB
// ─────────────────────────────────────────────────────────────────────────────

function AlbumsTab() {
  const [albums,    setAlbums]    = useState([])
  const [songs,     setSongs]     = useState([])   // all songs for dropdown
  const [loading,   setLoading]   = useState(true)
  const [deleting,  setDeleting]  = useState(null)
  const [creating,  setCreating]  = useState(false)
  const [showForm,  setShowForm]  = useState(false)
  const [expanded,  setExpanded]  = useState(null)  // album._id showing song picker

  // Album create form
  const [form, setForm] = useState({ title: '', artist: '', year: '' })
  const [coverFile, setCoverFile] = useState(null)

  // Song picker state per album
  const [selectedSong, setSelectedSong] = useState({})  // { [albumId]: songId }
  const [addingSong,   setAddingSong]   = useState(null)
  const [removingSong, setRemovingSong] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [albumsRes, songsRes] = await Promise.all([
        api.get('/albums'),
        api.get('/songs'),
      ])
      setAlbums(albumsRes.data.data?.albums || albumsRes.data.data || [])
      setSongs(songsRes.data.data?.songs    || songsRes.data.data  || [])
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // ── Create album ───────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title || !form.artist) {
      return toast.error('Title and artist are required')
    }
    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('title',  form.title)
      formData.append('artist', form.artist)
      formData.append('year',   form.year)
      if (coverFile) formData.append('coverImage', coverFile)

      const res = await api.post('/albums', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAlbums(prev => [res.data.data, ...prev])
      setForm({ title: '', artist: '', year: '' })
      setCoverFile(null)
      setShowForm(false)
      toast.success('Album created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  // ── Delete album ───────────────────────────────────────────────────────────
  const handleDeleteAlbum = async (album) => {
    if (!window.confirm(`Delete album "${album.title}"?`)) return
    setDeleting(album._id)
    try {
      await api.delete(`/albums/${album._id}`)
      setAlbums(prev => prev.filter(a => a._id !== album._id))
      toast.success('Album deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  // ── Add song to album ──────────────────────────────────────────────────────
  const handleAddSong = async (albumId) => {
    const songId = selectedSong[albumId]
    if (!songId) return toast.error('Select a song first')
    setAddingSong(albumId)
    try {
      const res = await api.post(`/albums/${albumId}/songs`, { songId })
      setAlbums(prev =>
        prev.map(a => a._id === albumId ? res.data.data : a)
      )
      setSelectedSong(prev => ({ ...prev, [albumId]: '' }))
      toast.success('Song added to album')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add song')
    } finally {
      setAddingSong(null)
    }
  }

  // ── Remove song from album ─────────────────────────────────────────────────
  const handleRemoveSong = async (albumId, songId) => {
    setRemovingSong(songId)
    try {
      const res = await api.delete(`/albums/${albumId}/songs`, {
        data: { songId },
      })
      setAlbums(prev =>
        prev.map(a => a._id === albumId ? res.data.data : a)
      )
      toast.success('Song removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove song')
    } finally {
      setRemovingSong(null)
    }
  }

  if (loading) return <Loader />

  return (
    <div>
      {/* ── Create toggle ── */}
      <button
        onClick={() => setShowForm(p => !p)}
        style={addBtnStyle}
      >
        {showForm ? <X size={14} /> : <Plus size={14} />}
        {showForm ? 'CANCEL' : 'CREATE ALBUM'}
      </button>

      {/* ── Create form ── */}
      {showForm && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label='ALBUM TITLE'>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder='Album name'
                style={inputStyle}
              />
            </FormField>
            <FormField label='ARTIST'>
              <input
                value={form.artist}
                onChange={e => setForm(p => ({ ...p, artist: e.target.value }))}
                placeholder='Artist name'
                style={inputStyle}
              />
            </FormField>
            <FormField label='YEAR'>
              <input
                type='number'
                value={form.year}
                onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                placeholder='e.g. 2024'
                style={inputStyle}
              />
            </FormField>
            <FormField label='COVER IMAGE (optional)'>
              <FileInput
                accept='image/*'
                file={coverFile}
                onChange={setCoverFile}
                icon={<Upload size={13} />}
              />
            </FormField>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={submitBtnStyle(creating)}
          >
            {creating ? 'CREATING...' : 'CREATE'}
          </button>
        </div>
      )}

      {/* ── Albums list ── */}
      {albums.length === 0 ? (
        <Empty text='NO ALBUMS YET' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {albums.map(album => {
            const cover =
              typeof album.coverImage === 'string' ? album.coverImage : (album.coverImage?.url || null)
            const isExpanded = expanded === album._id
            const albumSongs = album.songs || []

            return (
              <div
                key={album._id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {/* Album row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--surface)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setExpanded(isExpanded ? null : album._id)}
                >
                  {/* Cover */}
                  <div style={{
                    width: '42px', height: '42px',
                    borderRadius: '4px',
                    background: 'var(--surface-2)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cover
                      ? <img src={cover} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Disc3 size={16} color='var(--text-dim)' />
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.83rem', fontWeight: 500,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {album.title}
                    </p>
                    <p style={{
                      fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px',
                    }}>
                      {album.artist} · {albumSongs.length} songs
                    </p>
                  </div>

                  {/* Delete album */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteAlbum(album) }}
                    disabled={deleting === album._id}
                    style={{
                      color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center',
                      padding: '6px',
                      borderRadius: 'var(--radius)',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Expanded: songs in album + add song picker */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '12px 14px',
                    background: 'var(--surface)',
                  }}>

                    {/* Songs in album */}
                    {albumSongs.length === 0 ? (
                      <p style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-dim)',
                        letterSpacing: '0.08em',
                        marginBottom: '12px',
                      }}>
                        NO SONGS IN THIS ALBUM
                      </p>
                    ) : (
                      <div style={{ marginBottom: '12px' }}>
                        {albumSongs.map((song, idx) => {
                          const s = typeof song === 'object' ? song : songs.find(s => s._id === song)
                          if (!s) return null
                          return (
                            <div
                              key={s._id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '6px 0',
                                borderBottom: '1px solid var(--border)',
                              }}
                            >
                              <span style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-dim)',
                                width: '18px',
                                flexShrink: 0,
                              }}>
                                {idx + 1}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: '0.8rem',
                                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                }}>
                                  {s.title}
                                </p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {s.artist}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveSong(album._id, s._id)}
                                disabled={removingSong === s._id}
                                style={{
                                  color: 'var(--text-dim)',
                                  display: 'flex', alignItems: 'center',
                                  padding: '4px',
                                  transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Add song picker */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={selectedSong[album._id] || ''}
                        onChange={e => setSelectedSong(prev => ({
                          ...prev, [album._id]: e.target.value,
                        }))}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font)',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value='' style={{ background: 'var(--surface)' }}>
                          Select a song to add...
                        </option>
                        {songs
                          .filter(s => !albumSongs.some(as =>
                            (typeof as === 'object' ? as._id : as) === s._id
                          ))
                          .map(s => (
                            <option
                              key={s._id}
                              value={s._id}
                              style={{ background: 'var(--surface)' }}
                            >
                              {s.title} — {s.artist}
                            </option>
                          ))
                        }
                      </select>
                      <button
                        onClick={() => handleAddSong(album._id)}
                        disabled={addingSong === album._id}
                        style={{
                          padding: '5px 14px',
                          background: 'var(--text)',
                          color: 'var(--bg)',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          cursor: addingSong === album._id ? 'not-allowed' : 'pointer',
                          opacity: addingSong === album._id ? 0.5 : 1,
                          flexShrink: 0,
                        }}
                      >
                        {addingSong === album._id ? '...' : 'ADD'}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared small components
// ─────────────────────────────────────────────────────────────────────────────

function FormField({ label, children }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.62rem',
        letterSpacing: '0.15em',
        color: 'var(--text-dim)',
        marginBottom: '4px',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function FileInput({ accept, file, onChange, icon }) {
  const inputRef = useState(null)
  const ref = { current: null }

  return (
    <div
      onClick={() => ref.current?.click()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        color: file ? 'var(--text)' : 'var(--text-dim)',
        fontSize: '0.78rem',
        overflow: 'hidden',
      }}
    >
      {icon}
      <span style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        flex: 1,
      }}>
        {file ? file.name : 'Choose file...'}
      </span>
      <input
        ref={ref}
        type='file'
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => onChange(e.target.files?.[0] || null)}
      />
    </div>
  )
}

function Loader() {
  return (
    <div style={{
      padding: '2rem 0',
      color: 'var(--text-muted)',
      fontSize: '0.8rem',
      letterSpacing: '0.1em',
    }}>
      LOADING...
    </div>
  )
}

function Empty({ text }) {
  return (
    <div style={{
      padding: '2rem 0',
      color: 'var(--text-dim)',
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
    }}>
      {text}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid var(--border)',
  outline: 'none',
  color: 'var(--text)',
  fontSize: '0.83rem',
  fontFamily: 'var(--font)',
}

const addBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '1.25rem',
  padding: '7px 16px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-muted)',
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.12em',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

const submitBtnStyle = (disabled) => ({
  padding: '0.65rem 1.5rem',
  background: disabled ? 'var(--surface-2)' : 'var(--text)',
  color: disabled ? 'var(--text-muted)' : 'var(--bg)',
  borderRadius: 'var(--radius)',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.15em',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: 'none',
  transition: 'all 0.15s',
  alignSelf: 'flex-start',
})

export default AdminPanel