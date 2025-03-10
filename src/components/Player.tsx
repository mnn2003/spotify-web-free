"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  ListMusic,
  Minimize2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import YouTubePlayer from "youtube-player"
import { usePlayerStore } from "../store/playerStore"
import { usePlaylistStore } from "../store/playlistStore"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    queue,
    togglePlay,
    setVolume,
    setProgress,
    setDuration,
    playNext,
    playPrevious,
  } = usePlayerStore()

  const { toggleLike, likedSongs, addToRecentlyPlayed } = usePlaylistStore()
  const { isAuthenticated } = useAuthStore()

  // Navigation state
  const [navigateTo, setNavigateTo] = useState<string | null>(null)

  const [isExpanded, setIsExpanded] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(volume)
  const [showMiniControls, setShowMiniControls] = useState(false)

  // New state for tracking click positions in fullscreen mode
  const [clickStartPosition, setClickStartPosition] = useState<{ x: number; y: number } | null>(null)
  const [clickThreshold] = useState(5) // Pixels of movement allowed before considering it a drag instead of a click

  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const expandedImageRef = useRef<HTMLImageElement>(null)

  // Initialize YouTube Player
  useEffect(() => {
    if (!playerRef.current) {
      const container = document.createElement("div")
      container.style.position = "absolute"
      container.style.visibility = "hidden"
      container.style.pointerEvents = "none"
      container.style.width = "1px"
      container.style.height = "1px"
      container.id = "youtube-player"
      document.body.appendChild(container)

      playerRef.current = YouTubePlayer("youtube-player", {
        height: "1",
        width: "1",
        playerVars: {
          autoplay: 1, // Autoplay the video
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1, // Allow inline playback on iOS
        },
      })

      playerRef.current.on("stateChange", (event: any) => {
        if (event.data === 0) {
          // Video ended
          playNext()
        }
      })

      playerRef.current.on("ready", () => {
        playerRef.current.setVolume(volume * 100)
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo() // Pause the video but don't destroy the player
        const container = document.getElementById("youtube-player")
        if (container) {
          document.body.removeChild(container)
        }
      }
    }
  }, [])

  // Handle track change
  useEffect(() => {
    if (currentTrack && playerRef.current) {
      playerRef.current.loadVideoById(currentTrack.videoId)
      if (isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
      addToRecentlyPlayed(currentTrack)
      setDuration(currentTrack.duration)
    }
  }, [currentTrack, addToRecentlyPlayed, setDuration])

  // Handle play/pause
  useEffect(() => {
    if (playerRef.current && currentTrack) {
      if (isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    }
  }, [isPlaying, currentTrack])

  // Handle volume change
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume * 100)
    }
  }, [volume])

  // Update progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(async () => {
        if (playerRef.current) {
          const currentTime = await playerRef.current.getCurrentTime()
          setProgress(currentTime)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, setProgress])

  // Handle visibility change to ensure background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (playerRef.current && currentTrack) {
        if (document.hidden) {
          // When the tab is hidden, ensure the video continues playing
          playerRef.current.playVideo()
        } else {
          // When the tab is visible again, ensure the video is in the correct state
          if (isPlaying) {
            playerRef.current.playVideo()
          } else {
            playerRef.current.pauseVideo()
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isPlaying, currentTrack])

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Handle navigation effect
  useEffect(() => {
    if (navigateTo) {
      // In a real app, you would use router.push or navigate here
      console.log(`Navigating to: ${navigateTo}`)
      // Reset navigation state
      setNavigateTo(null)
    }
  }, [navigateTo])

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Handle progress bar click
  const handleProgressBarClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (playerRef.current && currentTrack) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickPosition = (e.clientX - rect.left) / rect.width
      const newTime = clickPosition * duration

      await playerRef.current.seekTo(newTime, true)
      setProgress(newTime)
    }
  }

  // Handle volume toggle
  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume)
    } else {
      setPrevVolume(volume)
      setVolume(0)
    }
    setIsMuted(!isMuted)
  }

  // Handle like button click with auth check
  const handleLikeClick = () => {
    if (!isAuthenticated) {
      if (window.confirm("You need to be logged in to like songs. Would you like to log in now?")) {
        setNavigateTo("/login")
      }
      return
    }

    if (currentTrack) {
      toggleLike(currentTrack)
    }
  }

  // Check if track is liked
  const isLiked = currentTrack ? likedSongs.some((track) => track.id === currentTrack.id) : false

  // Toggle mini controls for mobile
  const toggleMiniControls = () => {
    setShowMiniControls(!showMiniControls)
  }

  // New handlers for fullscreen mode interactions
  const handleFullscreenMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) {
      setClickStartPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const handleFullscreenMouseMove = (e: React.MouseEvent) => {
    if (isExpanded && clickStartPosition) {
      const deltaX = Math.abs(e.clientX - clickStartPosition.x)
      const deltaY = Math.abs(e.clientY - clickStartPosition.y)

      // If moved more than threshold, consider it a drag and not a potential click
      if (deltaX > clickThreshold || deltaY > clickThreshold) {
        setClickStartPosition(null)
      }
    }
  }

  const handleFullscreenMouseUp = (e: React.MouseEvent) => {
    if (isExpanded && clickStartPosition) {
      // This was a click (not a drag) in fullscreen mode
      // Toggle play/pause when clicking on the album art
      if (expandedImageRef.current && expandedImageRef.current.contains(e.target as Node)) {
        togglePlay()
      } else {
        // Clicking elsewhere in the fullscreen view (could add other behaviors)
        // For now, we'll just toggle play/pause for the entire fullscreen area
        togglePlay()
      }
      setClickStartPosition(null)
    }
  }

  // Handle artist click to navigate to artist page
  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentTrack?.artist) {
      setNavigateTo(`/artist/${encodeURIComponent(currentTrack.artist)}`)
    }
  }

  return (
    <div
      ref={playerContainerRef}
      className={`
        fixed transition-all duration-300 ease-in-out z-50
        ${
          isExpanded
            ? "inset-0 bg-gradient-to-b from-gray-900 to-black"
            : "bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800"
        }
      `}
      onMouseDown={handleFullscreenMouseDown}
      onMouseMove={handleFullscreenMouseMove}
      onMouseUp={handleFullscreenMouseUp}
    >
      {/* Mobile Expanded View */}
      {isExpanded && (
        <div className="h-full p-4 flex flex-col">
          <button onClick={() => setIsExpanded(false)} className="self-end p-2" aria-label="Minimize player">
            <Minimize2 size={24} className="text-white" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center">
            {currentTrack && (
              <>
                <img
                  ref={expandedImageRef}
                  src={currentTrack.thumbnail || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="w-64 h-64 object-cover rounded-lg shadow-2xl mb-8 cursor-pointer"
                />
                <h2 className="text-white text-xl font-bold mb-2 text-center px-4">{currentTrack.title}</h2>
                <p
                  className="text-gray-400 mb-8 text-center cursor-pointer hover:text-white transition-colors"
                  onClick={handleArtistClick}
                >
                  {currentTrack.artist}
                </p>
              </>
            )}

            {/* Progress Bar */}
            <div className="w-full max-w-md flex items-center gap-2 mb-8 px-4">
              <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer" onClick={handleProgressBarClick}>
                <div
                  className="h-full bg-green-500 rounded-full relative group"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 mb-6">
              <button className="text-gray-400 hover:text-white" aria-label="Shuffle">
                <Shuffle size={20} />
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playPrevious} aria-label="Previous track">
                <SkipBack size={24} />
              </button>
              <button
                className="bg-white rounded-full p-4 text-black hover:scale-105 transition"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playNext} aria-label="Next track">
                <SkipForward size={24} />
              </button>
              <button className="text-gray-400 hover:text-white" aria-label="Repeat">
                <Repeat size={20} />
              </button>
            </div>

            {/* Volume Control in Expanded View */}
            <div className="flex items-center gap-3 px-4 w-full max-w-md">
              <button
                className="text-gray-400 hover:text-white"
                onClick={toggleMute}
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div
                className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickPosition = (e.clientX - rect.left) / rect.width
                  setVolume(Math.max(0, Math.min(1, clickPosition)))
                  setIsMuted(false)
                }}
              >
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>

            {/* Like Button in Expanded View */}
            <button
              className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full border ${
                isLiked ? "text-green-500 border-green-500" : "text-white border-gray-600"
              }`}
              onClick={handleLikeClick}
              aria-label={isLiked ? "Remove from liked songs" : "Add to liked songs"}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>{isLiked ? "Liked" : "Like"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Regular Player View */}
      <div className={`p-2 sm:p-4 ${isExpanded ? "hidden" : "block"}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Track Info */}
          <div className="flex items-center flex-1 min-w-0 mr-2">
            {currentTrack ? (
              <>
                <div className="relative">
                  <img
                    src={currentTrack.thumbnail || "/placeholder.svg"}
                    alt={currentTrack.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-cover mr-2 sm:mr-3 rounded"
                  />
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="absolute inset-0 md:hidden"
                    aria-label="Expand player"
                  >
                    <span className="sr-only">Expand player</span>
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm sm:text-base truncate">{currentTrack.title}</div>
                  <div
                    className="text-gray-400 text-xs sm:text-sm truncate cursor-pointer hover:text-white transition-colors"
                    onClick={handleArtistClick}
                  >
                    {currentTrack.artist}
                  </div>
                </div>
                <button
                  className={`ml-2 focus:outline-none ${isLiked ? "text-green-500" : "text-gray-400 hover:text-white"}`}
                  onClick={handleLikeClick}
                  aria-label={isLiked ? "Remove from liked songs" : "Add to liked songs"}
                >
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </>
            ) : (
              <div className="text-gray-400 text-sm">No track selected</div>
            )}
          </div>

          {/* Mobile Mini Controls Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={togglePlay}
              className="mr-2 bg-white rounded-full p-1.5 text-black hover:scale-105 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            </button>
            <button
              onClick={toggleMiniControls}
              className="text-white p-1"
              aria-label={showMiniControls ? "Hide controls" : "Show controls"}
            >
              {showMiniControls ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>

          {/* Player Controls - Desktop */}
          <div className="hidden md:flex flex-col items-center w-2/4">
            <div className="flex items-center gap-4 mb-2">
              <button className="text-gray-400 hover:text-white" aria-label="Shuffle">
                <Shuffle size={18} />
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playPrevious} aria-label="Previous track">
                <SkipBack size={24} />
              </button>
              <button
                className="bg-white rounded-full p-2 text-black hover:scale-105 transition"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playNext} aria-label="Next track">
                <SkipForward size={24} />
              </button>
              <button className="text-gray-400 hover:text-white" aria-label="Repeat">
                <Repeat size={18} />
              </button>
            </div>

            <div className="flex items-center w-full gap-2">
              <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer" onClick={handleProgressBarClick}>
                <div
                  className="h-full bg-green-500 rounded-full relative group"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Controls - Desktop */}
          <div className="hidden md:flex items-center justify-end w-1/4 gap-3">
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setShowQueue(!showQueue)}
              aria-label={showQueue ? "Hide queue" : "Show queue"}
            >
              <ListMusic size={20} />
            </button>
            <button
              className="text-gray-400 hover:text-white"
              onClick={toggleMute}
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div
              className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickPosition = (e.clientX - rect.left) / rect.width
                setVolume(Math.max(0, Math.min(1, clickPosition)))
                setIsMuted(false)
              }}
            >
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Mobile Mini Controls */}
        {showMiniControls && (
          <div className="md:hidden mt-2 px-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 w-8 text-right">{formatTime(progress)}</span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full cursor-pointer" onClick={handleProgressBarClick}>
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-gray-400" onClick={playPrevious} aria-label="Previous track">
                  <SkipBack size={20} />
                </button>
                <button className="text-gray-400" onClick={playNext} aria-label="Next track">
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-gray-400" onClick={toggleMute} aria-label={volume === 0 ? "Unmute" : "Mute"}>
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  className="text-gray-400"
                  onClick={() => setShowQueue(!showQueue)}
                  aria-label={showQueue ? "Hide queue" : "Show queue"}
                >
                  <ListMusic size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="absolute bottom-full right-0 w-full sm:w-80 max-h-96 overflow-y-auto bg-gray-900 border border-gray-800 rounded-t-lg shadow-lg">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-bold">Queue</h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setShowQueue(false)}
              aria-label="Close queue"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="p-2">
            {queue.length > 0 ? (
              queue.map((track, index) => (
                <div key={`${track.id}-${index}`} className="flex items-center p-2 hover:bg-gray-800 rounded-md">
                  <img
                    src={track.thumbnail || "/placeholder.svg"}
                    alt={track.title}
                    className="w-10 h-10 object-cover mr-3 rounded"
                  />
                  <div className="truncate flex-1">
                    <div className="text-white text-sm truncate">{track.title}</div>
                    <div className="text-gray-400 text-xs truncate">{track.artist}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">Queue is empty</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Player
