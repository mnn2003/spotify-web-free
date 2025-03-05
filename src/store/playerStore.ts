import { create } from 'zustand';
import { PlayerState, Track } from '../types';

interface PlayerStore extends PlayerState {
  setCurrentTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,

  setCurrentTrack: (track) => {
    set({ currentTrack: track, isPlaying: true, progress: 0 });
  },

  addToQueue: (track) => {
    const { queue } = get();
    set({ queue: [...queue, track] });
  },

  removeFromQueue: (trackId) => {
    const { queue } = get();
    set({ queue: queue.filter(track => track.id !== trackId) });
  },

  clearQueue: () => {
    set({ queue: [] });
  },

  playNext: () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack 
      ? queue.findIndex(track => track.id === currentTrack.id)
      : -1;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      set({ 
        currentTrack: queue[nextIndex], 
        isPlaying: true,
        progress: 0
      });
    }
  },

  playPrevious: () => {
    const { queue, currentTrack } = get();
    if (queue.length === 0 || !currentTrack) return;

    const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
    if (currentIndex > 0) {
      set({ 
        currentTrack: queue[currentIndex - 1], 
        isPlaying: true,
        progress: 0
      });
    }
  },

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setVolume: (volume) => {
    set({ volume });
  },

  setProgress: (progress) => {
    set({ progress });
  },

  setDuration: (duration) => {
    set({ duration });
  }
}));