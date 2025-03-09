import axios from 'axios';
import { SearchResult, Track } from '../types';

const API_KEY = 'AIzaSyDA1n8683_NaCPq8ngS0JjaE_cDueijYqU';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Cache using localStorage
const getFromCache = (key: string) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
};

const setToCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

export const searchVideos = async (query: string, maxResults = 20): Promise<SearchResult[]> => {
  const cacheKey = `search:${query}:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) return cachedData;

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
    return [];
  }
};

export const getVideoDetails = async (videoId: string): Promise<Track> => {
  const cacheKey = `video:${videoId}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: API_KEY
      }
    });

    if (!response.data.items?.length) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const { snippet, contentDetails } = video;
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
    return null;
  }
};

export const getPopularMusicVideos = async (maxResults = 20): Promise<SearchResult[]> => {
  const cacheKey = `popular:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: '10',
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
      videoId: item.id,
      duration: parseDuration(item.contentDetails.duration)
    }));

    setToCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error getting popular music videos:', error);
    return [];
  }
};

export const getVideosByCategory = async (categoryId: string, maxResults = 20): Promise<SearchResult[]> => {
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
};

// Helper function to parse ISO 8601 duration to seconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  return (
    (match?.[1] ? parseInt(match[1].slice(0, -1)) * 3600 : 0) +
    (match?.[2] ? parseInt(match[2].slice(0, -1)) * 60 : 0) +
    (match?.[3] ? parseInt(match[3].slice(0, -1)) : 0)
  );
};
