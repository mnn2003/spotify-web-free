import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PlaylistPage from './pages/PlaylistPage';
import LibraryPage from './pages/LibraryPage';
import LikedSongsPage from './pages/LikedSongsPage';
import RecentlyPlayedPage from './pages/RecentlyPlayedPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <HashRouter> {/* Changed from BrowserRouter to HashRouter */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
          <Route path="liked-songs" element={<LikedSongsPage />} />
          <Route path="recently-played" element={<RecentlyPlayedPage />} />
          <Route path="category/:id" element={<CategoryPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
