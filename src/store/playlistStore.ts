import { create } from 'zustand';
import { Playlist, Track } from '../types';
import { supabase } from '../lib/supabase';

interface PlaylistState {
  playlists: Playlist[];
  likedSongs: Track[];
  recentlyPlayed: Track[];
  createPlaylist: (name: string, description?: string) => Promise<void>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  toggleLike: (track: Track) => Promise<void>;
  addToRecentlyPlayed: (track: Track) => void;
  fetchUserData: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  likedSongs: [],
  recentlyPlayed: [],

  fetchUserData: async () => {
    try {
      // Fetch liked songs
      const { data: likedSongs } = await supabase
        .from('liked_songs')
        .select('song_data')
        .order('created_at', { ascending: false });

      // Fetch playlists and their songs
      const { data: playlists } = await supabase
        .from('playlists')
        .select(`
          id,
          name,
          description,
          created_at,
          playlist_songs (
            song_data,
            position
          )
        `)
        .order('created_at', { ascending: false });

      set({
        likedSongs: likedSongs?.map(item => item.song_data as Track) || [],
        playlists: playlists?.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          tracks: (playlist.playlist_songs || [])
            .sort((a, b) => a.position - b.position)
            .map(song => song.song_data as Track),
          createdBy: playlist.user_id,
          thumbnail: playlist.playlist_songs?.[0]?.song_data?.thumbnail
        })) || []
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },

  createPlaylist: async (name, description) => {
    try {
      const { data: playlist } = await supabase
        .from('playlists')
        .insert({ name, description })
        .select()
        .single();

      if (playlist) {
        const newPlaylist: Playlist = {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          tracks: [],
          createdBy: playlist.user_id
        };

        set(state => ({
          playlists: [newPlaylist, ...state.playlists]
        }));
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  addToPlaylist: async (playlistId, track) => {
    try {
      const { data: existingTracks } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (existingTracks?.[0]?.position || 0) + 1;

      await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_data: track,
          position: nextPosition
        });

      set(state => ({
        playlists: state.playlists.map(playlist => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              tracks: [...playlist.tracks, track],
              thumbnail: playlist.tracks.length === 0 ? track.thumbnail : playlist.thumbnail
            };
          }
          return playlist;
        })
      }));
    } catch (error) {
      console.error('Error adding to playlist:', error);
      throw error;
    }
  },

  removeFromPlaylist: async (playlistId, trackId) => {
    try {
      await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_data->>id', trackId);

      set(state => ({
        playlists: state.playlists.map(playlist => {
          if (playlist.id === playlistId) {
            const updatedTracks = playlist.tracks.filter(track => track.id !== trackId);
            return {
              ...playlist,
              tracks: updatedTracks,
              thumbnail: updatedTracks.length > 0 ? updatedTracks[0].thumbnail : undefined
            };
          }
          return playlist;
        })
      }));
    } catch (error) {
      console.error('Error removing from playlist:', error);
      throw error;
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      set(state => ({
        playlists: state.playlists.filter(playlist => playlist.id !== playlistId)
      }));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  },

  toggleLike: async (track) => {
    try {
      const { likedSongs } = get();
      const isLiked = likedSongs.some(t => t.id === track.id);

      if (isLiked) {
        await supabase
          .from('liked_songs')
          .delete()
          .eq('song_data->>id', track.id);

        set(state => ({
          likedSongs: state.likedSongs.filter(t => t.id !== track.id)
        }));
      } else {
        await supabase
          .from('liked_songs')
          .insert({ song_data: track });

        set(state => ({
          likedSongs: [track, ...state.likedSongs]
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  addToRecentlyPlayed: (track) => {
    const { recentlyPlayed } = get();
    const filteredRecent = recentlyPlayed.filter(t => t.id !== track.id);
    set({ recentlyPlayed: [track, ...filteredRecent].slice(0, 20) });
  }
}));
