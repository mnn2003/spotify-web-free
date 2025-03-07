import React from 'react';
import { Play, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface TrackListProps {
  tracks: Track[];
  showHeader?: boolean;
  showArtist?: boolean;
  showAlbum?: boolean;
  showDuration?: boolean;
  onTrackClick?: (track: Track) => void;
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  showHeader = true,
  showArtist = true,
  showAlbum = false,
  showDuration = true,
  onTrackClick
}) => {
  const { setCurrentTrack, currentTrack, isPlaying, togglePlay, addToQueue } = usePlayerStore();
  const { toggleLike, likedSongs } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTrackClick = (track: Track) => {
    if (onTrackClick) {
      onTrackClick(track);
    } else {
      if (currentTrack?.id === track.id) {
        togglePlay();
      } else {
        setCurrentTrack(track);
        // Add the clicked track and all subsequent tracks to the queue
        const trackIndex = tracks.findIndex(t => t.id === track.id);
        const remainingTracks = tracks.slice(trackIndex);
        
        // Clear queue and add all tracks
        usePlayerStore.getState().clearQueue();
        remainingTracks.forEach(t => addToQueue(t));
      }
    }
  };

  const handleLikeClick = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to like songs. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    
    toggleLike(track);
  };

  const isTrackPlaying = (track: Track) => {
    return currentTrack?.id === track.id && isPlaying;
  };

  const isTrackLiked = (track: Track) => {
    return likedSongs.some(t => t.id === track.id);
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="col-span-1 text-center">##</div>
          <div className="col-span-5">TITLE</div>
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
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-800 transition-colors group cursor-pointer"
            onClick={() => handleTrackClick(track)}
          >
            <div className="col-span-1 flex items-center justify-center">
              <div className="group-hover:hidden">{index + 1}</div>
              <button
                className="hidden group-hover:block text-white"
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

            <div className="col-span-5 flex items-center">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-10 h-10 object-cover mr-3"
              />
              <div className="truncate">
                <div className={`truncate font-medium ${isTrackPlaying(track) ? 'text-green-500' : 'text-white'}`}>
                  {track.title}
                </div>
              </div>
            </div>

            {showArtist && (
              <div className="col-span-3 flex items-center text-gray-400 truncate">
                {track.artist}
              </div>
            )}

            {showAlbum && (
              <div className="col-span-2 flex items-center text-gray-400 truncate">
                {/* Album would go here */}
              </div>
            )}

            {showDuration && (
              <div className="col-span-1 flex items-center justify-end text-gray-400">
                {formatDuration(track.duration)}
              </div>
            )}

            <div className="col-span-1 flex items-center justify-end space-x-2">
              <button
                className={`opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${
                  isTrackLiked(track) ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
                onClick={(e) => handleLikeClick(track, e)}
              >
                <Heart size={16} fill={isTrackLiked(track) ? 'currentColor' : 'none'} />
              </button>
              <button className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-white">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackList;
