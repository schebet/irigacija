import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Map, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg rounded-lg mt-4 p-2">
      <div className="flex flex-wrap justify-around items-center">
        <Link
          to="/"
          className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
            isActive('/') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Droplets className="w-5 h-5" />
          <span>Контролна табла</span>
        </Link>

        <Link
          to="/zones"
          className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
            isActive('/zones') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Зоне</span>
        </Link>

        <Link
          to="/history"
          className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
            isActive('/history') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <HistoryIcon className="w-5 h-5" />
          <span>Историја</span>
        </Link>

        <Link
          to="/settings"
          className={`flex items-center gap-2 p-3 rounded-md transition-colors ${
            isActive('/settings') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span>Подешавања</span>
        </Link>
      </div>
    </nav>
  );
}