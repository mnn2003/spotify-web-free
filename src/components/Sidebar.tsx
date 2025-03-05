import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Library, 
  Heart, 
  Clock, 
  PlusCircle, 
  Music2,
  LogIn,
  LogOut
} from 'lucide-react';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playlists, createPlaylist } = usePlaylistStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

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
    <div className="w-64 h-full bg-black text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Music2 size={32} className="text-green-500" />
          <span className="text-xl font-bold">Musicify</span>
        </div>
        
        <nav className="space-y-6">
          <div className="space-y-2">
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/search" 
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/search') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Search size={20} />
              <span>Search</span>
            </Link>
            
            <Link 
              to="/library" 
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/library') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Library size={20} />
              <span>Your Library</span>
            </Link>
          </div>
          
          <div className="space-y-2">
            <Link 
              to="/liked-songs" 
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/liked-songs') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Heart size={20} />
              <span>Liked Songs</span>
            </Link>
            
            <Link 
              to="/recently-played" 
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/recently-played') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Clock size={20} />
              <span>Recently Played</span>
            </Link>
            
            <button 
              className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-md transition-colors hover:bg-gray-800"
              onClick={handleCreatePlaylist}
            >
              <PlusCircle size={20} />
              <span>Create Playlist</span>
            </button>
          </div>
        </nav>
      </div>
      
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-sm text-gray-400 font-medium">
          YOUR PLAYLISTS
        </div>
        <div className="space-y-1">
          {isAuthenticated ? (
            playlists.map(playlist => (
              <Link 
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                  isActive(`/playlist/${playlist.id}`) ? 'bg-gray-800' : 'hover:bg-gray-800'
                }`}
              >
                {playlist.name}
              </Link>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Log in to view your playlists
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button 
              onClick={() => logout()}
              className="text-gray-400 hover:text-white"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors w-full justify-center"
          >
            <LogIn size={18} />
            <span>Log in</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;