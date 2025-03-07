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
        const trackIndex = tracks.findIndex(t => t.id === track.id);
        const remainingTracks = tracks.slice(trackIndex);
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

  const isTrackPlaying = (track: Track) => currentTrack?.id === track.id && isPlaying;
  const isTrackLiked = (track: Track) => likedSongs.some(t => t.id === track.id);

  return (
    <div className="w-full">
      {showHeader && (
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-700 text-gray-400 text-sm">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-5">Title</div>
          {showArtist && <div className="hidden md:block col-span-3">Artist</div>}
          {showAlbum && <div className="hidden md:block col-span-2">Album</div>}
          {showDuration && (
            <div className="col-span-1 flex justify-end">
              <Clock size={16} />
            </div>
          )}
        </div>
      )}

      <div className="divide-y divide-gray-700">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-12 md:grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-800 transition-all cursor-pointer rounded-lg"
            onClick={() => handleTrackClick(track)}
          >
            <div className="col-span-1 flex items-center justify-center">
              <button className="text-white">
                {isTrackPlaying(track) ? '⏸️' : <Play size={16} fill="currentColor" />}
              </button>
            </div>

            <div className="col-span-7 md:col-span-5 flex items-center">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-12 h-12 object-cover rounded-md mr-3"
              />
              <div className="truncate">
                <div className={`truncate font-medium ${isTrackPlaying(track) ? 'text-green-400' : 'text-white'}`}>{track.title}</div>
                {showArtist && <div className="text-xs text-gray-400 md:hidden">{track.artist}</div>}
              </div>
            </div>

            {showArtist && <div className="hidden md:flex col-span-3 items-center text-gray-400 truncate">{track.artist}</div>}
            {showAlbum && <div className="hidden md:flex col-span-2 items-center text-gray-400 truncate">{track.album || '-'}</div>}
            {showDuration && <div className="col-span-2 md:col-span-1 flex items-center justify-end text-gray-400">{formatDuration(track.duration)}</div>}

            <div className="col-span-2 md:col-span-1 flex items-center justify-end space-x-3">
              <button
                className={`transition-colors ${isTrackLiked(track) ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                onClick={(e) => handleLikeClick(track, e)}
              >
                <Heart size={16} fill={isTrackLiked(track) ? 'currentColor' : 'none'} />
              </button>
              <button className="text-gray-400 hover:text-white">
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
