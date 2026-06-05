import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import AmbientOrb from './components/AmbientOrb';
import Home from './pages/Home';
import Music from './pages/Music';
import Radio from './pages/Radio';
import Podcast from './pages/Podcast';
import Stories from './pages/Stories';
import Mesh from './pages/Mesh';
import Concerts from './pages/Concerts';
import Search from './pages/Search';
import Library from './pages/Library';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import StylesGallery from './pages/StylesGallery';

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <BrowserRouter>
          <div className="min-h-dvh flex flex-col relative" style={{ background: 'var(--bg)' }}>
            <AmbientOrb />

            <main className="flex-1 overflow-y-auto relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/music" element={<Music />} />
                <Route path="/radio" element={<Radio />} />
                <Route path="/podcast" element={<Podcast />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/mesh" element={<Mesh />} />
                <Route path="/concerts" element={<Concerts />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/styles" element={<StylesGallery />} />
              </Routes>
            </main>

            <MiniPlayer />
            <BottomNav />
          </div>
        </BrowserRouter>
      </PlayerProvider>
    </ThemeProvider>
  );
}
