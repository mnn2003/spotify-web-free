import React from 'react';
import { PlusCircle } from 'lucide-react';
import { usePlaylistStore } from '../store/playlistStore';
import PlaylistCard from '../components/PlaylistCard';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const LibraryPage: React.FC = () => {
  const { playlists, createPlaylist } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const handleCreatePlaylist = () => {
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to create playlists. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    
    const name = prompt('Enter playlist name:');
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Your Library</h1>
        <button
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors"
          onClick={handleCreatePlaylist}
        >
          <PlusCircle size={20} />
          <span>Create Playlist</span>
        </button>
      </div>
      
      {!isAuthenticated ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <p className="text-xl mb-4 text-white">Log in to view your library</p>
          <p className="text-gray-400 mb-6">Create playlists and save your favorite songs</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-500 text-black font-medium py-2 px-6 rounded-full hover:bg-green-400 transition-colors"
          >
            Log in
          </button>
        </div>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">Your library is empty</p>
          <p>Create a playlist to get started</p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;