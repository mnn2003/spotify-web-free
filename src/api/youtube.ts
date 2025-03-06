import axios from 'axios';
import { SearchResult, Track } from '../types';

const API_KEY = 'AIzaSyBilwLKYAnGJJRo4Sq6NKxWY3H0kExW75A';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Cache for API responses
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getFromCache = (key: string) => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setToCache = (key: string, data: any) => {
  cache[key] = { data, timestamp: Date.now() };
};

export const searchVideos = async (query: string, maxResults = 20): Promise<SearchResult[]> => {
  const cacheKey = `search:${query}:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        key: API_KEY
      }
    });

    const results = response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      videoId: item.id.videoId
    }));

    setToCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

export const getVideoDetails = async (videoId: string): Promise<Track> => {
  const cacheKey = `video:${videoId}`;
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: API_KEY
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const { snippet, contentDetails } = video;

    // Parse duration from ISO 8601 format
    const duration = parseDuration(contentDetails.duration);

    const track: Track = {
      id: videoId,
      title: snippet.title,
      artist: snippet.channelTitle,
      thumbnail: snippet.thumbnails.high.url,
      duration,
      videoId
    };

    setToCache(cacheKey, track);
    return track;
  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
};

export const getPopularMusicVideos = async (maxResults = 20): Promise<SearchResult[]> => {
  const cacheKey = `popular:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        videoCategoryId: '10', // Music category
        maxResults,
        regionCode: 'IN',
        key: API_KEY
      }
    });

    const results = response.data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      videoId: item.id
    }));

    setToCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error getting popular music videos:', error);
    throw error;
  }
};

export const getVideosByCategory = async (categoryId: string, maxResults = 20): Promise<SearchResult[]> => {
  const cacheKey = `category:${categoryId}:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    // For demo purposes, we'll use search with category-related keywords
    const categoryKeywords: Record<string, string> = {
      'pop': 'pop music',
      'rock': 'rock music',
      'hiphop': 'hip hop music',
      'electronic': 'electronic music',
      'jazz': 'jazz music',
      'classical': 'classical music',
      'indie': 'indie music',
      'chill': 'chill music',
      'workout': 'workout music',
      'focus': 'focus music'
    };

    const query = categoryKeywords[categoryId] || categoryId;
    return await searchVideos(query, maxResults);
  } catch (error) {
    console.error('Error getting videos by category:', error);
    throw error;
  }
};

// Helper function to parse ISO 8601 duration to seconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match && match[1]) ? parseInt(match[1].slice(0, -1)) : 0;
  const minutes = (match && match[2]) ? parseInt(match[2].slice(0, -1)) : 0;
  const seconds = (match && match[3]) ? parseInt(match[3].slice(0, -1)) : 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};
