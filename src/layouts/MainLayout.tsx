import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      
      <Player />
    </div>
  );
};

export default MainLayout;