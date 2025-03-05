import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchVideos } from '../api/youtube';
import { SearchResult } from '../types';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle search input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchVideos(query, 5);
        setResults(data);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setShowResults(true)}
            className="block w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Search for songs, artists..."
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {showResults && query.trim().length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-md shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <a
                    href={`/search?q=${encodeURIComponent(result.title)}`}
                    className="block px-4 py-2 hover:bg-gray-700 flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      setQuery(result.title);
                      navigate(`/search?q=${encodeURIComponent(result.title)}`);
                      setShowResults(false);
                    }}
                  >
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-10 h-10 object-cover mr-3"
                    />
                    <div>
                      <div className="text-white text-sm truncate">{result.title}</div>
                      <div className="text-gray-400 text-xs">{result.channelTitle}</div>
                    </div>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="block px-4 py-2 text-green-500 hover:bg-gray-700 text-center"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setShowResults(false);
                  }}
                >
                  See all results for "{query}"
                </a>
              </li>
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;