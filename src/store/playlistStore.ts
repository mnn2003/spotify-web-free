import { create } from 'zustand';
import { Playlist, Track } from '../types';

interface PlaylistState {
  playlists: Playlist[];
  likedSongs: Track[];
  recentlyPlayed: Track[];
  createPlaylist: (name: string, description?: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  toggleLike: (track: Track) => void;
  addToRecentlyPlayed: (track: Track) => void;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [
    {
      id: '1',
      name: 'My Favorites',
      description: 'A collection of my favorite tracks',
      tracks: [],
      createdBy: '1'
    }
  ],
  likedSongs: [],
  recentlyPlayed: [],

  createPlaylist: (name, description) => {
    const { playlists } = get();
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdBy: '1' // Assuming the current user's ID
    };
    set({ playlists: [...playlists, newPlaylist] });
  },

  addToPlaylist: (playlistId, track) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Check if track already exists in playlist
        const trackExists = playlist.tracks.some(t => t.id === track.id);
        if (!trackExists) {
          return {
            ...playlist,
            tracks: [...playlist.tracks, track],
            thumbnail: playlist.tracks.length === 0 ? track.thumbnail : playlist.thumbnail
          };
        }
      }
      return playlist;
    });
    set({ playlists: updatedPlaylists });
  },

  removeFromPlaylist: (playlistId, trackId) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        const updatedTracks = playlist.tracks.filter(track => track.id !== trackId);
        return {
          ...playlist,
          tracks: updatedTracks,
          thumbnail: updatedTracks.length > 0 ? updatedTracks[0].thumbnail : undefined
        };
      }
      return playlist;
    });
    set({ playlists: updatedPlaylists });
  },

  deletePlaylist: (playlistId) => {
    const { playlists } = get();
    set({ playlists: playlists.filter(playlist => playlist.id !== playlistId) });
  },

  toggleLike: (track) => {
    const { likedSongs } = get();
    const isLiked = likedSongs.some(t => t.id === track.id);
    
    if (isLiked) {
      set({ likedSongs: likedSongs.filter(t => t.id !== track.id) });
    } else {
      set({ likedSongs: [...likedSongs, track] });
    }
  },

  addToRecentlyPlayed: (track) => {
    const { recentlyPlayed } = get();
    // Remove the track if it already exists to avoid duplicates
    const filteredRecent = recentlyPlayed.filter(t => t.id !== track.id);
    // Add the track to the beginning of the array
    set({ recentlyPlayed: [track, ...filteredRecent].slice(0, 20) }); // Keep only the 20 most recent
  }
}));