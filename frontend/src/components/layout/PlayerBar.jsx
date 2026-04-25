import { usePlayer } from '../../context/PlayerContext'
import { SkipBack, Play, Pause, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react'

// Helper: seconds → "3:45"
const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function PlayerBar() {
  const {
    currentSong, isPlaying,
    duration, seek,
    volume,
    togglePlay, playNext, playPrev,
    seekTo, changeVolume, toggleShuffle, toggleLoop,
    isShuffle, isLoop,
  } = usePlayer()

  return (
    <footer className="player-bar" style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 'var(--player-h)',
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      gap: '2rem',
      zIndex: 100,
    }}>

      {/* Song info */}
      <div style={{ minWidth: '180px' }}>
        {currentSong ? (
          <>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }} className='truncate'>
              {currentSong.title}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className='truncate'>
              {currentSong.artist}
            </p>
          </>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No song playing</p>
        )}
      </div>

      {/* Controls + Progress — center */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={toggleShuffle} style={{ color: isShuffle ? 'var(--text)' : 'var(--text-muted)' }}>
            <Shuffle size={14} />
          </button>

          <button onClick={playPrev} style={{ color: 'var(--text)' }}>
            <SkipBack size={16} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: 'var(--text)',
              color: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button onClick={playNext} style={{ color: 'var(--text)' }}>
            <SkipForward size={16} />
          </button>

          <button onClick={toggleLoop} style={{ color: isLoop ? 'var(--text)' : 'var(--text-muted)' }}>
            <Repeat size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '400px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>
            {fmt(seek)}
          </span>

          <input
            type='range'
            min={0}
            max={duration || 1}
            value={seek}
            onChange={e => seekTo(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--text)', height: '3px', cursor: 'pointer' }}
          />

          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', minWidth: '30px' }}>
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="player-bar-volume" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
        <Volume2 size={14} color='var(--text-muted)' />
        <input
          type='range'
          min={0} max={1} step={0.01}
          value={volume}
          onChange={e => changeVolume(Number(e.target.value))}
          style={{ width: '80px', accentColor: 'var(--text)', height: '3px', cursor: 'pointer' }}
        />
      </div>

    </footer>
  )
}