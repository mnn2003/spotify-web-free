import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  ListMusic
} from 'lucide-react';
import YouTubePlayer from 'youtube-player';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Player: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    progress, 
    duration,
    queue,
    togglePlay: storeTogglePlay,
    setVolume, 
    setProgress,
    setDuration,
    playNext,
    playPrevious
  } = usePlayerStore();
  
  const { toggleLike, likedSongs, addToRecentlyPlayed } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [showQueue, setShowQueue] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize YouTube Player
  useEffect(() => {
    // Create a hidden container for the YouTube player
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.width = '1px';
    container.style.height = '1px';
    container.id = 'youtube-player';
    document.body.appendChild(container);

    playerRef.current = YouTubePlayer('youtube-player', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1
      }
    });

    // Set up event listeners
    playerRef.current.on('stateChange', (event: { data: number }) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        playNext();
      } else if (event.data === window.YT.PlayerState.PLAYING) {
        if (!isPlaying) storeTogglePlay();
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        if (isPlaying) storeTogglePlay();
      }
    });

    playerRef.current.on('ready', () => {
      setIsPlayerReady(true);
      playerRef.current.setVolume(volume * 100);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Handle track change
  useEffect(() => {
    if (currentTrack && playerRef.current && isPlayerReady) {
      playerRef.current.loadVideoById({
        videoId: currentTrack.videoId,
        startSeconds: 0,
      }).then(() => {
        if (isPlaying) {
          playerRef.current.playVideo();
        }
        addToRecentlyPlayed(currentTrack);
        setDuration(currentTrack.duration);
      });
    }
  }, [currentTrack, isPlayerReady]);

  // Handle play/pause
  const togglePlay = () => {
    if (!currentTrack || !playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    storeTogglePlay();
  };

  // Handle volume change
  useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume, isPlayerReady]);

  // Update progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isPlayerReady) {
      interval = setInterval(async () => {
        if (playerRef.current) {
          const currentTime = await playerRef.current.getCurrentTime();
          setProgress(currentTime);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPlayerReady, setProgress]);

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle progress bar click
  const handleProgressBarClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (playerRef.current && currentTrack && isPlayerReady) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = clickPosition * duration;
      
      await playerRef.current.seekTo(newTime, true);
      setProgress(newTime);
    }
  };

  // Handle volume toggle
  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  // Handle like button click with auth check
  const handleLikeClick = () => {
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to like songs. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    
    if (currentTrack) {
      toggleLike(currentTrack);
    }
  };

  // Check if track is liked
  const isLiked = currentTrack ? likedSongs.some(track => track.id === currentTrack.id) : false;

  return (
    <div 
      ref={playerContainerRef}
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center w-1/4">
          {currentTrack ? (
            <>
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className="w-14 h-14 object-cover mr-3"
              />
              <div className="truncate">
                <div className="text-white truncate">{currentTrack.title}</div>
                <div className="text-gray-400 text-sm truncate">{currentTrack.artist}</div>
              </div>
              <button 
                className={`ml-4 focus:outline-none ${isLiked ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
                onClick={handleLikeClick}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </>
          ) : (
            <div className="text-gray-400">No track selected</div>
          )}
        </div>
        
        {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center gap-4 mb-2">
            <button className="text-gray-400 hover:text-white focus:outline-none">
              <Shuffle size={18} />
            </button>
            <button 
              className="text-gray-400 hover:text-white focus:outline-none"
              onClick={playPrevious}
              disabled={!currentTrack}
            >
              <SkipBack size={24} />
            </button>
            <button 
              className="bg-white rounded-full p-2 text-black hover:scale-105 transition focus:outline-none"
              onClick={togglePlay}
              disabled={!currentTrack}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button 
              className="text-gray-400 hover:text-white focus:outline-none"
              onClick={playNext}
              disabled={!currentTrack}
            >
              <SkipForward size={24} />
            </button>
            <button className="text-gray-400 hover:text-white focus:outline-none">
              <Repeat size={18} />
            </button>
          </div>
          
          <div className="flex items-center w-full gap-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(progress)}
            </span>
            <div 
              className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer"
              onClick={handleProgressBarClick}
            >
              <div 
                className="h-full bg-green-500 rounded-full relative group"
                style={{ width: `${(progress / duration) * 100 || 0}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" />
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        {/* Volume Controls */}
        <div className="flex items-center justify-end w-1/4 gap-3">
          <button 
            className="text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setShowQueue(!showQueue)}
          >
            <ListMusic size={20} />
          </button>
          <button 
            className="text-gray-400 hover:text-white focus:outline-none"
            onClick={toggleMute}
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${volume * 100}%` }}
              onClick={(e) => {
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (rect) {
                  const clickPosition = (e.clientX - rect.left) / rect.width;
                  setVolume(Math.max(0, Math.min(1, clickPosition)));
                  setIsMuted(false);
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Queue Panel */}
      {showQueue && (
        <div className="absolute bottom-full right-0 w-80 max-h-96 overflow-y-auto bg-gray-900 border border-gray-800 rounded-t-lg shadow-lg">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">Queue</h3>
          </div>
          <div className="p-2">
            {queue.length > 0 ? (
              queue.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`}
                  className="flex items-center p-2 hover:bg-gray-800 rounded-md"
                >
                  <img 
                    src={track.thumbnail} 
                    alt={track.title}
                    className="w-10 h-10 object-cover mr-3"
                  />
                  <div className="truncate flex-1">
                    <div className="text-white text-sm truncate">{track.title}</div>
                    <div className="text-gray-400 text-xs truncate">{track.artist}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">Queue is empty</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;