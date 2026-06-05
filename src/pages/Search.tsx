import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, Music, Radio, Mic2, BookOpen, Video, Wifi, TrendingUp, Clock, Play, Pause } from 'lucide-react';
import { usePlayer, MOCK_TRACKS, MOCK_RADIO, MOCK_PODCASTS, MOCK_STORIES } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

const ALL_CONTENT: Track[] = [...MOCK_TRACKS, ...MOCK_RADIO, ...MOCK_PODCASTS, ...MOCK_STORIES];

const TRENDING = [
  'Ambient', 'Synthwave', 'Afrobeats', 'Deep House', 'Lo-fi', 'Meditation',
];

const CATEGORIES = [
  { id: 'music',   label: 'Music',    icon: Music,   color: '#7C3AED', route: '/music' },
  { id: 'radio',   label: 'Radio',    icon: Radio,   color: '#06B6D4', route: '/radio' },
  { id: 'podcast', label: 'Podcasts', icon: Mic2,    color: '#a855f7', route: '/podcast' },
  { id: 'story',   label: 'Stories',  icon: BookOpen, color: '#f97316', route: '/stories' },
  { id: 'concert', label: 'Concerts', icon: Video,   color: '#ec4899', route: '/concerts' },
  { id: 'mesh',    label: 'Mesh',     icon: Wifi,    color: '#22c55e', route: '/mesh' },
];

const RECENT_SEARCHES = ['Midnight City', 'M83', 'Ambient', 'Quantum Deep'];

export default function Search() {
  const [query,       setQuery]       = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const { play, currentTrack, isPlaying, pause, resume } = usePlayer();
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_CONTENT.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.genre?.toLowerCase().includes(q) ||
      t.album?.toLowerCase().includes(q)
    ).filter(t => activeFilter === 'all' || t.type === activeFilter);
  }, [query, activeFilter]);

  const handleSearch = (term: string) => {
    setQuery(term);
    setRecentSearches(r => [term, ...r.filter(x => x !== term)].slice(0, 6));
  };

  const clearQuery = () => setQuery('');

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      <div className="pt-2">
        <h1 className="text-2xl font-black">Discover</h1>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
        <SearchIcon size={18} className="text-white/30 flex-shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && query.trim() && handleSearch(query.trim())}
          placeholder="Search music, artists, podcasts..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/30"
          autoFocus={false}
        />
        <AnimatePresence>
          {query && (
            <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
              onClick={clearQuery}>
              <X size={16} className="text-white/40" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filter tabs */}
      {query && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {['all', 'music', 'radio', 'podcast', 'story'].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all ${activeFilter === f ? 'primary-bg text-white' : 'glass text-white/60'}`}
            >{f === 'all' ? 'All' : f}</button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {query && results.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-2">
            <p className="text-xs text-white/30">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            {results.map(track => {
              const active = currentTrack?.id === track.id;
              const TypeIcon = track.type === 'music' ? Music : track.type === 'radio' ? Radio : track.type === 'podcast' ? Mic2 : BookOpen;
              return (
                <motion.div key={track.id} whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl glass cursor-pointer ${active ? 'ring-2 ring-primary/30' : ''}`}
                  onClick={() => { handleSearch(query); play(track, results); }}
                >
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                    {track.artwork
                      ? <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full primary-bg/20 flex items-center justify-center"><TypeIcon size={18} className="primary-text" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? 'primary-text' : ''}`}>{track.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TypeIcon size={9} className="text-white/30" />
                      <p className="text-xs text-white/40 truncate">{track.artist} · {track.genre}</p>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); active ? (isPlaying ? pause() : resume()) : play(track, results); }}
                    className="w-8 h-8 rounded-full primary-bg flex items-center justify-center flex-shrink-0">
                    {active && isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" />}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {query && results.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-10">
            <SearchIcon size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/40">No results for "{query}"</p>
            <p className="text-xs text-white/20 mt-1">Try a different keyword or filter</p>
          </motion.div>
        )}

        {!query && (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-white/30" />
                    <span className="text-xs font-black tracking-widest text-white/30 uppercase">Recent</span>
                  </div>
                  <button onClick={() => setRecentSearches([])} className="text-xs text-white/30 hover:text-white/60">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(s => (
                    <button key={s} onClick={() => setQuery(s)}
                      className="glass rounded-full px-3 py-1.5 text-xs text-white/60 hover:text-white flex items-center gap-1.5">
                      <Clock size={9} className="text-white/30" />{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="primary-text" />
                <span className="text-xs font-black tracking-widest text-white/30 uppercase">Trending</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => (
                  <button key={t} onClick={() => setQuery(t)}
                    className="glass rounded-full px-4 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by category */}
            <div>
              <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">Browse by Category</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <motion.button key={cat.id} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(cat.route)}
                    className="glass rounded-2xl p-4 flex items-center gap-3 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cat.color + '25' }}>
                      <cat.icon size={18} style={{ color: cat.color }} />
                    </div>
                    <span className="text-sm font-bold">{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
