import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';

interface TrackCardProps {
  track: Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const { currentTrack, isPlaying, togglePlay, setCurrentTrack, addToQueue } = usePlayerStore();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  
  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      addToQueue(track);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-md p-4 hover:bg-gray-700 transition-colors group">
      <div className="relative mb-4">
        <img 
          src={track.thumbnail} 
          alt={track.title}
          className="w-full aspect-square object-cover rounded-md"
        />
        <button
          className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105 transform transition-transform"
          onClick={handlePlay}
        >
          {isCurrentTrack && isPlaying ? <Pause size={20} /> : <Play size={20} fill="black" />}
        </button>
      </div>
      <h3 className="text-white font-medium truncate">{track.title}</h3>
      <p className="text-gray-400 text-sm truncate">{track.artist}</p>
    </div>
  );
};

export default TrackCard;