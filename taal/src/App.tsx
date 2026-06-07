import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from '@/context/PlayerContext';
import { ThemeProvider }  from '@/context/ThemeContext';
import { ConnectivityManager } from '@/components/ConnectivityManager';
import { TaalFooterNavbar, MiniPlayer } from '@/components/Navigation';

/* Pages */
import Home         from '@/pages/Home';
import MusicPage    from '@/pages/Music';
import RadioPage    from '@/pages/Radio';
import PodcastPage  from '@/pages/Podcast';
import StoriesPage  from '@/pages/Stories';
import MeshPage     from '@/pages/Mesh';
import ConcertPage  from '@/pages/Concerts';
import SearchPage   from '@/pages/Search';
import LibraryPage  from '@/pages/Library';
import UploadPage   from '@/pages/Upload';
import ProfilePage  from '@/pages/Profile';
import StylesPage   from '@/pages/StylesGallery';

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <Router>
          <ConnectivityManager />

          {/* ── App shell ─────────────────────────────────────────── */}
          <div className="min-h-screen bg-surface pb-48 px-4 max-w-lg mx-auto">
            <main className="pt-8">
              <Routes>
                <Route path="/"         element={<Home />}       />
                <Route path="/music"    element={<MusicPage />}  />
                <Route path="/radio"    element={<RadioPage />}  />
                <Route path="/podcast"  element={<PodcastPage />}/>
                <Route path="/stories"  element={<StoriesPage />}/>
                <Route path="/mesh"     element={<MeshPage />}   />
                <Route path="/concerts" element={<ConcertPage />}/>
                <Route path="/search"   element={<SearchPage />} />
                <Route path="/library"  element={<LibraryPage />}/>
                <Route path="/upload"   element={<UploadPage />} />
                <Route path="/profile"  element={<ProfilePage />}/>
                <Route path="/styles"   element={<StylesPage />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Persistent playback bar */}
            <MiniPlayer />

            {/* Global navigation */}
            <TaalFooterNavbar />
          </div>
        </Router>
      </PlayerProvider>
    </ThemeProvider>
  );
}
