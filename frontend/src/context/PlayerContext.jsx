import { createContext, useContext, useState, useRef, useEffect } from 'react'
import { Howl } from 'howler'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {

  const [currentSong, setCurrentSong] = useState(null)  
  const [isPlaying, setIsPlaying]     = useState(false)
  const [duration, setDuration]       = useState(0)      
  const [seek, setSeek]               = useState(0)      
  const [volume, setVolume]           = useState(0.7)
  const [queue, setQueue]             = useState([])     
  const [queueIndex, setQueueIndex]   = useState(0)      

  const howlRef  = useRef(null)   
  const seekTimer = useRef(null)  

  // ── Cleanup on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      howlRef.current?.unload()
      clearInterval(seekTimer.current)
    }
  }, [])

  // ── Core: load and play a Howl instance ─────────────
  // Called internally whenever song changes
  const _loadAndPlay = (song) => {
    // Stop and destroy previous audio
    if (howlRef.current) {
      howlRef.current.unload()
      clearInterval(seekTimer.current)
    }

    const sound = new Howl({
      src: [song.audioUrl],          // Cloudinary URL from your backend
      html5: true,                   // enables streaming (don't download full file)
      volume: volume,
      onplay: () => {
        setIsPlaying(true)
        setDuration(sound.duration())
        // Update seek position every second
        seekTimer.current = setInterval(() => {
          setSeek(sound.seek())
        }, 1000)
      },
      onpause: () => {
        setIsPlaying(false)
        clearInterval(seekTimer.current)
      },
      onstop: () => {
        setIsPlaying(false)
        setSeek(0)
        clearInterval(seekTimer.current)
      },
      onend: () => {
        clearInterval(seekTimer.current)
        playNext()                   // auto-play next song in queue
      },
      onloaderror: (id, err) => {
        console.error('Howl load error:', err)
        setIsPlaying(false)
      }
    })

    howlRef.current = sound
    sound.play()
    setCurrentSong(song)
    setSeek(0)
  }

  // ── Play a single song (replaces queue) ─────────────
  const playSong = (song) => {
    setQueue([song])
    setQueueIndex(0)
    _loadAndPlay(song)
  }

  // ── Play a list of songs (album / playlist) ──────────
  // startIndex = which song to start from
  const playList = (songs, startIndex = 0) => {
    if (!songs.length) return
    setQueue(songs)
    setQueueIndex(startIndex)
    _loadAndPlay(songs[startIndex])
  }

  // ── Toggle play / pause ──────────────────────────────
  const togglePlay = () => {
    if (!howlRef.current) return
    if (howlRef.current.playing()) {
      howlRef.current.pause()
    } else {
      howlRef.current.play()
      setIsPlaying(true)
    }
  }

  // ── Next song ────────────────────────────────────────
  const playNext = () => {
    if (!queue.length) return
    const nextIndex = (queueIndex + 1) % queue.length
    setQueueIndex(nextIndex)
    _loadAndPlay(queue[nextIndex])
  }

  // ── Previous song ────────────────────────────────────
  const playPrev = () => {
    if (!queue.length) return
    const prevIndex = (queueIndex - 1 + queue.length) % queue.length
    setQueueIndex(prevIndex)
    _loadAndPlay(queue[prevIndex])
  }

  // ── Seek to position ─────────────────────────────────
  // Called when user drags the progress bar
  const seekTo = (seconds) => {
    if (!howlRef.current) return
    howlRef.current.seek(seconds)
    setSeek(seconds)
  }

  // ── Volume ───────────────────────────────────────────
  const changeVolume = (val) => {
    setVolume(val)
    if (howlRef.current) howlRef.current.volume(val)
  }

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      duration,
      seek,
      volume,
      queue,
      queueIndex,
      playSong,
      playList,
      togglePlay,
      playNext,
      playPrev,
      seekTo,
      changeVolume,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}