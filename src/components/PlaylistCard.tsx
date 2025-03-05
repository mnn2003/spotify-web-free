import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Playlist } from '../types';
import { usePlayerStore } from '../store/playerStore';

interface PlaylistCardProps {
  playlist: Playlist;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const { setCurrentTrack, addToQueue } = usePlayerStore();
  
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (playlist.tracks.length > 0) {
      // Play the first track and add the rest to the queue
      setCurrentTrack(playlist.tracks[0]);
      
      // Clear queue and add all tracks
      usePlayerStore.getState().clearQueue();
      playlist.tracks.forEach(track => addToQueue(track));
    }
  };
  
  return (
    <Link 
      to={`/playlist/${playlist.id}`}
      className="bg-gray-800 rounded-md p-4 hover:bg-gray-700 transition-colors group"
    >
      <div className="relative mb-4">
        {playlist.thumbnail ? (
          <img 
            src={playlist.thumbnail} 
            alt={playlist.name}
            className="w-full aspect-square object-cover rounded-md"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-700 rounded-md flex items-center justify-center">
            <span className="text-gray-400 text-4xl">🎵</span>
          </div>
        )}
        <button
          className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105 transform transition-transform"
          onClick={handlePlay}
          disabled={playlist.tracks.length === 0}
        >
          <Play size={20} fill="black" />
        </button>
      </div>
      <h3 className="text-white font-medium truncate">{playlist.name}</h3>
      <p className="text-gray-400 text-sm truncate">
        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
      </p>
    </Link>
  );
};

export default PlaylistCard;