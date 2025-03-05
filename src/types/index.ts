export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  videoId: string;
}
 
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  thumbnail?: string;
  createdBy: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
}

export interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  videoId: string;
}