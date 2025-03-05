import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import TrackList from '../components/TrackList';

const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, deletePlaylist } = usePlaylistStore();
  const { currentTrack, isPlaying, togglePlay, setCurrentTrack, addToQueue } = usePlayerStore();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  const playlist = playlists.find(p => p.id === id);
  
  if (!playlist) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-white mb-4">Playlist not found</h1>
        <button 
          className="text-green-500 hover:underline"
          onClick={() => navigate('/library')}
        >
          Go to your library
        </button>
      </div>
    );
  }
  
  const handlePlayAll = () => {
    if (playlist.tracks.length === 0) return;
    
    // Play the first track
    setCurrentTrack(playlist.tracks[0]);
    
    // Add all tracks to queue
    usePlayerStore.getState().clearQueue();
    playlist.tracks.forEach(track => addToQueue(track));
  };
  
  const isPlaylistPlaying = () => {
    return isPlaying && currentTrack && playlist.tracks.some(track => track.id === currentTrack.id);
  };
  
  const handleEdit = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || '');
    setIsEditing(true);
    setShowMenu(false);
  };
  
  const handleSaveEdit = () => {
    if (editName.trim()) {
      // Update playlist name and description
      const updatedPlaylists = playlists.map(p => {
        if (p.id === id) {
          return {
            ...p,
            name: editName.trim(),
            description: editDescription.trim() || undefined
          };
        }
        return p;
      });
      
      usePlaylistStore.setState({ playlists: updatedPlaylists });
      setIsEditing(false);
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlist.id);
      navigate('/library');
    }
    setShowMenu(false);
  };
  
  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          {playlist.thumbnail ? (
            <img 
              src={playlist.thumbnail} 
              alt={playlist.name}
              className="w-60 h-60 object-cover shadow-lg"
            />
          ) : (
            <div className="w-60 h-60 bg-gray-800 flex items-center justify-center shadow-lg">
              <span className="text-gray-400 text-6xl">🎵</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="text-sm text-gray-400 uppercase font-bold">Playlist</div>
          
          {isEditing ? (
            <div className="mt-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-gray-800 text-white text-4xl font-bold w-full mb-2 p-2 rounded"
                placeholder="Playlist name"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-gray-800 text-gray-300 w-full h-20 p-2 rounded"
                placeholder="Add an optional description"
              />
              <div className="mt-4 flex gap-2">
                <button
                  className="bg-green-500 text-black px-4 py-2 rounded-full font-medium"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
                <button
                  className="bg-gray-800 text-white px-4 py-2 rounded-full font-medium"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-white mt-2 mb-4">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-gray-400 mb-4">{playlist.description}</p>
              )}
              <div className="flex items-center text-gray-400 text-sm">
                <span className="font-medium">{playlist.tracks.length} songs</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-8 flex items-center gap-4">
        <button
          className={`rounded-full p-3 ${
            playlist.tracks.length > 0 
              ? 'bg-green-500 text-black hover:scale-105' 
              : 'bg-green-500/50 text-gray-800 cursor-not-allowed'
          } transition-transform`}
          onClick={handlePlayAll}
          disabled={playlist.tracks.length === 0}
        >
          {isPlaylistPlaying() ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
        </button>
        
        <div className="relative">
          <button
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={24} />
          </button>
          
          {showMenu && (
            <div className="absolute z-10 mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden">
              <button
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                onClick={handleEdit}
              >
                <Pencil size={16} />
                <span>Edit details</span>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                <span>Delete playlist</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {playlist.tracks.length > 0 ? (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={playlist.tracks} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">This playlist is empty</p>
          <p>Search for songs to add to this playlist</p>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;