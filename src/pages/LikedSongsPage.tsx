import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import TrackList from '../components/TrackList';

const LikedSongsPage: React.FC = () => {
  const { likedSongs } = usePlaylistStore();
  const { currentTrack, isPlaying, togglePlay, setCurrentTrack, addToQueue } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const handlePlayAll = () => {
    if (likedSongs.length === 0) return;
    
    // Play the first track
    setCurrentTrack(likedSongs[0]);
    
    // Add all tracks to queue
    usePlayerStore.getState().clearQueue();
    likedSongs.forEach(track => addToQueue(track));
  };
  
  const isLikedSongsPlaying = () => {
    return isPlaying && currentTrack && likedSongs.some(track => track.id === currentTrack.id);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-shrink-0">
            <div className="w-60 h-60 bg-gradient-to-br from-purple-700 to-blue-900 flex items-center justify-center shadow-lg">
              <Heart size={80} className="text-white" fill="white" />
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <div className="text-sm text-gray-400 uppercase font-bold">Playlist</div>
            <h1 className="text-5xl font-bold text-white mt-2 mb-4">Liked Songs</h1>
          </div>
        </div>
        
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <p className="text-xl mb-4 text-white">Log in to see your liked songs</p>
          <p className="text-gray-400 mb-6">Save tracks you love to your liked songs</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-500 text-black font-medium py-2 px-6 rounded-full hover:bg-green-400 transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <div className="w-60 h-60 bg-gradient-to-br from-purple-700 to-blue-900 flex items-center justify-center shadow-lg">
            <Heart size={80} className="text-white" fill="white" />
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="text-sm text-gray-400 uppercase font-bold">Playlist</div>
          <h1 className="text-5xl font-bold text-white mt-2 mb-4">Liked Songs</h1>
          <div className="flex items-center text-gray-400 text-sm">
            <span className="font-medium">{likedSongs.length} songs</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <button
          className={`rounded-full p-3 ${
            likedSongs.length > 0 
              ? 'bg-green-500 text-black hover:scale-105' 
              : 'bg-green-500/50 text-gray-800 cursor-not-allowed'
          } transition-transform`}
          onClick={handlePlayAll}
          disabled={likedSongs.length === 0}
        >
          {isLikedSongsPlaying() ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
        </button>
      </div>
      
      {likedSongs.length > 0 ? (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={likedSongs} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">You haven't liked any songs yet</p>
          <p>Click the heart icon on songs you love</p>
        </div>
      )}
    </div>
  );
};

export default LikedSongsPage;