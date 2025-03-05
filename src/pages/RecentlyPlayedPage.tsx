import React from 'react';
import { Play, Pause, Clock } from 'lucide-react';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import TrackList from '../components/TrackList';

const RecentlyPlayedPage: React.FC = () => {
  const { recentlyPlayed } = usePlaylistStore();
  const { currentTrack, isPlaying, togglePlay, setCurrentTrack, addToQueue } = usePlayerStore();
  
  const handlePlayAll = () => {
    if (recentlyPlayed.length === 0) return;
    
    // Play the first track
    setCurrentTrack(recentlyPlayed[0]);
    
    // Add all tracks to queue
    usePlayerStore.getState().clearQueue();
    recentlyPlayed.forEach(track => addToQueue(track));
  };
  
  const isRecentlyPlayedPlaying = () => {
    return isPlaying && currentTrack && recentlyPlayed.some(track => track.id === currentTrack.id);
  };
  
  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <div className="w-60 h-60 bg-gradient-to-br from-blue-700 to-green-900 flex items-center justify-center shadow-lg">
            <Clock size={80} className="text-white" />
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="text-sm text-gray-400 uppercase font-bold">Playlist</div>
          <h1 className="text-5xl font-bold text-white mt-2 mb-4">Recently Played</h1>
          <div className="flex items-center text-gray-400 text-sm">
            <span className="font-medium">{recentlyPlayed.length} songs</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <button
          className={`rounded-full p-3 ${
            recentlyPlayed.length > 0 
              ? 'bg-green-500 text-black hover:scale-105' 
              : 'bg-green-500/50 text-gray-800 cursor-not-allowed'
          } transition-transform`}
          onClick={handlePlayAll}
          disabled={recentlyPlayed.length === 0}
        >
          {isRecentlyPlayedPlaying() ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
        </button>
      </div>
      
      {recentlyPlayed.length > 0 ? (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={recentlyPlayed} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">You haven't played any songs yet</p>
          <p>Play some music to see your history </p>
        </div>
      )}
    </div>
  );
};

export default RecentlyPlayedPage;