"use client"

import type React from "react"
import { Play, Heart, MoreHorizontal, Clock } from "lucide-react"
import type { Track } from "../types"
import { usePlayerStore } from "../store/playerStore"
import { usePlaylistStore } from "../store/playlistStore"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"

interface TrackListProps {
  tracks: Track[]
  showHeader?: boolean
  showArtist?: boolean
  showAlbum?: boolean
  showDuration?: boolean
  onTrackClick?: (track: Track) => void
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  showHeader = true,
  showArtist = true,
  showAlbum = false,
  showDuration = true,
  onTrackClick,
}) => {
  const { setCurrentTrack, currentTrack, isPlaying, togglePlay, addToQueue } = usePlayerStore()
  const { toggleLike, likedSongs } = usePlaylistStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleTrackClick = (track: Track) => {
    if (onTrackClick) {
      onTrackClick(track)
    } else {
      if (currentTrack?.id === track.id) {
        togglePlay()
      } else {
        setCurrentTrack(track)
        // Add the clicked track and all subsequent tracks to the queue
        const trackIndex = tracks.findIndex((t) => t.id === track.id)
        const remainingTracks = tracks.slice(trackIndex)

        // Clear queue and add all tracks
        usePlayerStore.getState().clearQueue()
        remainingTracks.forEach((t) => addToQueue(t))
      }
    }
  }

  const handleLikeClick = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      if (window.confirm("You need to be logged in to like songs. Would you like to log in now?")) {
        navigate("/login")
      }
      return
    }

    toggleLike(track)
  }

  const isTrackPlaying = (track: Track) => {
    return currentTrack?.id === track.id && isPlaying
  }

  const isTrackLiked = (track: Track) => {
    return likedSongs.some((t) => t.id === track.id)
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-4 px-2 sm:px-4 py-2 border-b border-gray-800 text-gray-400 text-xs sm:text-sm">
          <div className="col-span-1 text-center">#</div>
          <div className={`col-span-5 ${!showArtist && !showAlbum ? "sm:col-span-9" : ""}`}>TITLE</div>
          {showArtist && <div className="col-span-3">ARTIST</div>}
          {showAlbum && <div className="col-span-2">ALBUM</div>}
          {showDuration && (
            <div className="col-span-1 flex justify-end">
              <Clock size={16} />
            </div>
          )}
          <div className="col-span-1"></div>
        </div>
      )}

      <div className="divide-y divide-gray-800">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-12 gap-2 sm:gap-4 px-2 sm:px-4 py-3 hover:bg-gray-800 transition-colors group cursor-pointer"
            onClick={() => handleTrackClick(track)}
          >
            {/* Track number/play button */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="group-hover:hidden text-xs sm:text-base text-gray-400">{index + 1}</div>
              <button
                className="hidden group-hover:block text-white"
                aria-label={isTrackPlaying(track) ? "Pause" : "Play"}
              >
                {isTrackPlaying(track) ? (
                  <div className="w-4 h-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-3 bg-green-500 mx-px animate-sound-wave"></div>
                      <div className="w-1 h-2 bg-green-500 mx-px animate-sound-wave animation-delay-200"></div>
                      <div className="w-1 h-4 bg-green-500 mx-px animate-sound-wave animation-delay-400"></div>
                    </div>
                  </div>
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>
            </div>

            {/* Title and thumbnail */}
            <div className={`col-span-${showArtist ? "7" : "9"} sm:col-span-5 flex items-center min-w-0`}>
              <img
                src={track.thumbnail || "/placeholder.svg"}
                alt={track.title}
                className="w-8 h-8 sm:w-10 sm:h-10 object-cover mr-2 sm:mr-3 rounded"
              />
              <div className="truncate flex-1 min-w-0">
                <div
                  className={`truncate font-medium text-sm sm:text-base ${isTrackPlaying(track) ? "text-green-500" : "text-white"}`}
                >
                  {track.title}
                </div>
                {/* Show artist on mobile even when showArtist is true */}
                <div className="sm:hidden text-xs text-gray-400 truncate">{track.artist}</div>
              </div>
            </div>

            {/* Artist - hidden on mobile */}
            {showArtist && (
              <div className="hidden sm:flex col-span-3 items-center text-gray-400 truncate">{track.artist}</div>
            )}

            {/* Album - hidden on mobile */}
            {showAlbum && (
              <div className="hidden sm:flex col-span-2 items-center text-gray-400 truncate">
                {/* Album would go here */}
              </div>
            )}

            {/* Duration */}
            {showDuration && (
              <div className="col-span-2 sm:col-span-1 flex items-center justify-end text-xs sm:text-sm text-gray-400">
                {formatDuration(track.duration)}
              </div>
            )}

            {/* Actions */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  className={`sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-opacity ${
                    isTrackLiked(track) ? "text-green-500" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={(e) => handleLikeClick(track, e)}
                  aria-label={isTrackLiked(track) ? "Unlike" : "Like"}
                >
                  <Heart size={14} className="sm:w-4 sm:h-4" fill={isTrackLiked(track) ? "currentColor" : "none"} />
                </button>
                <button
                  className="hidden sm:block opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-white"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackList
