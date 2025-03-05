import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVideosByCategory, getVideoDetails } from '../api/youtube';
import { Track } from '../types';
import TrackList from '../components/TrackList';

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      'pop': 'Pop',
      'rock': 'Rock',
      'hiphop': 'Hip Hop',
      'electronic': 'Electronic',
      'jazz': 'Jazz',
      'classical': 'Classical',
      'indie': 'Indie',
      'chill': 'Chill',
      'workout': 'Workout',
      'focus': 'Focus'
    };
    
    return categories[categoryId || ''] || 'Unknown Category';
  };
  
  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      'pop': '#1DB954',
      'rock': '#E91E63',
      'hiphop': '#FF9800',
      'electronic': '#9C27B0',
      'jazz': '#3F51B5',
      'classical': '#795548',
      'indie': '#607D8B',
      'chill': '#00BCD4',
      'workout': '#F44336',
      'focus': '#4CAF50'
    };
    
    return colors[categoryId || ''] || '#1DB954';
  };
  
  useEffect(() => {
    const fetchCategoryTracks = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const results = await getVideosByCategory(id);
        const trackPromises = results.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setTracks(tracks);
      } catch (error) {
        console.error('Error fetching category tracks:', error);
        setError('An error occurred while loading this category. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategoryTracks();
  }, [id]);
  
  const categoryName = getCategoryName(id || '');
  const categoryColor = getCategoryColor(id || '');
  
  return (
    <div className="p-8">
      <div 
        className="h-40 rounded-lg mb-8 flex items-end p-8"
        style={{ backgroundColor: categoryColor }}
      >
        <h1 className="text-4xl font-bold text-white">{categoryName}</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-md">
          {error}
        </div>
      ) : tracks.length > 0 ? (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={tracks} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">No tracks found in this category</p>
          <p>Try another category or check back later</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;