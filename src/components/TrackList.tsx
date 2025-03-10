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
        const trackIndex = tracks.findIndex((t) => t.id === track.id)
        const remainingTracks = tracks.slice(trackIndex)
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

  const isTrackPlaying = (track: Track) => currentTrack?.id === track.id && isPlaying
  const isTrackLiked = (track: Track) => likedSongs.some((t) => t.id === track.id)

  return (
    <div className="w-full">
      {showHeader && (
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6">TITLE</div>
          {showArtist && <div className="col-span-3">ARTIST</div>}
          {showDuration && <div className="col-span-2 flex justify-end"><Clock size={16} /></div>}
        </div>
      )}

      <div className="divide-y divide-gray-800">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => handleTrackClick(track)}
          >
            <div className="col-span-1 flex items-center justify-center">
              <div className="text-xs text-gray-400">{index + 1}</div>
            </div>

            <div className="col-span-9 sm:col-span-10 flex items-center min-w-0">
              <img
                src={track.thumbnail || "/placeholder.svg"}
                alt={track.title}
                className="w-12 h-12 sm:w-10 sm:h-10 object-cover mr-3 rounded"
              />
              <div className="truncate flex-1 min-w-0">
                <div className={`truncate text-sm font-medium ${isTrackPlaying(track) ? "text-green-500" : "text-white"}`}>
                  {track.title}
                </div>
                {showArtist && <div className="text-xs text-gray-400 truncate">{track.artist}</div>}
              </div>
            </div>

            {showDuration && (
              <div className="col-span-2 flex items-center justify-end text-xs text-gray-400">
                {formatDuration(track.duration)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackList
