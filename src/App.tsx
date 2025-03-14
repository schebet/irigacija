import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Zones } from './components/Zones';
import { History } from './components/History';
import { Settings } from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navigation />
          <main className="py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;