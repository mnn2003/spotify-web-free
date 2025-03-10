import React, { useEffect, useState } from 'react';
import { getPopularMusicVideos, searchVideos, getVideoDetails } from '../api/youtube';
import { SearchResult, Track } from '../types';
import TrackCard from '../components/TrackCard';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [localTrending, setLocalTrending] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const trendingSongs = [
    "Kaun Tujhe", "Ishq", "Die With A Smile", "Sahiba", "Tu Hain Toh Main Hoon",
    "MANIAC - Bonus Track", "Apna Bana Le", "Sajni", "Millionaire", "Tujhe Kitna Chahne Lage",
    "Aaj Ki Raat", "Wavy", "Fell For You", "Tum Se", "Satranga", "Victory Anthem",
    "Chuttamalle", "Bewajah", "Ye Tune Kya Kiya", "Humdard", "Tainu Khabar Nahi",
    "Sang Rahiyo", "Husn", "Ajab Si", "Uyi Amma", "Agar Tum Saath Ho", "Bulleya",
    "Tera Fitoor", "Jaane Tu", "Kesariya", "Sunn Raha Hai", "Guzarish", "Naina",
    "Bujji Thalli", "O Saathi", "Mere Sohneya", "Ishq Mein", "Russian Bandana",
    "Paththavaikkum", "Maiyya", "Payal", "Jaana Samjho Na", "blue", "Aayi Nai",
    "Tujhe Kitna Chahne Lage", "Sajni"
  ];

  useEffect(() => {
    const fetchPopularTracks = async () => {
      setIsLoading(true);
      try {
        const results = await getPopularMusicVideos(10);
        const trackPromises = results.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setPopularTracks(tracks);
      } catch (error) {
        console.error('Error fetching popular tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTrendingSongs = async () => {
      try {
        const trackPromises = trendingSongs.map(async (title) => {
          try {
            const searchResults = await searchVideos(title, 1);
            if (searchResults.length === 0) throw new Error(`No video found for ${title}`);

            const videoId = searchResults[0].videoId;
            const details = await getVideoDetails(videoId);

            return {
              id: details.videoId,
              title: details.title,
              artist: details.artist,
              thumbnail: details.thumbnail,
              duration: details.duration
            };
          } catch (error) {
            console.error(`Error fetching video for ${title}:`, error);
            return null;
          }
        });
        
        const tracks = (await Promise.all(trackPromises)).filter(track => track !== null);
        setLocalTrending(tracks);
      } catch (error) {
        console.error('Error fetching trending songs:', error);
      }
    };

    fetchPopularTracks();
    fetchTrendingSongs();
  }, []);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Good {getTimeOfDay()}, {user?.name || 'Guest'}
        </h1>
        <p className="text-gray-400">Discover new music and enjoy your favorites</p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Local Trending</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {localTrending.map((track, index) => (
            <TrackCard key={index} track={track} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Popular Right Now</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularTracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
