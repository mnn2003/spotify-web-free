import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchVideos, getVideoDetails } from '../api/youtube';
import { SearchResult, Track } from '../types';
import TrackList from '../components/TrackList';
import SearchBar from '../components/SearchBar';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const searchResults = await searchVideos(query);
        const trackPromises = searchResults.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setResults(tracks);
      } catch (error) {
        console.error('Error searching:', error);
        setError('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="mb-6">
          <SearchBar />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          {query ? `Search results for "${query}"` : 'Search for music'}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-md">
          {error}
        </div>
      ) : results.length > 0 ? (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={results} />
        </div>
      ) : query ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">No results found for "{query}"</p>
          <p>Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">Search for your favorite music</p>
          <p>Find songs, artists, and more</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;