import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Music, Radio, Mic2, BookOpen, TrendingUp, X } from 'lucide-react';
import { usePlayer, MOCK_TRACKS, MOCK_RADIO, MOCK_PODCASTS, MOCK_STORIES } from '../context/PlayerContext';

const ALL = [...MOCK_TRACKS, ...MOCK_RADIO, ...MOCK_PODCASTS, ...MOCK_STORIES];

const TRENDING = ['Synthwave', 'Ambient Focus', 'M83', 'Deep House', 'Story Podcast', 'Live Jazz'];

const TYPE_ICONS: any = { music: Music, radio: Radio, podcast: Mic2, story: BookOpen };
const TYPE_COLORS: any = { music: '#7C3AED', radio: '#06B6D4', podcast: '#a855f7', story: '#f97316' };

export default function Search() {
  const [query, setQuery] = useState('');
  const { play } = usePlayer();

  const results = query.length > 1
    ? ALL.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.artist.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      <div className="pt-2">
        <h1 className="text-2xl font-black">Search</h1>
      </div>

      {/* Search bar */}
      <div className="relative">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tracks, artists, stations, stories..."
          className="w-full glass rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white outline-none placeholder-white/30"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results */}
      {query.length > 1 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/30 font-bold uppercase tracking-widest">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map(track => {
            const Icon = TYPE_ICONS[track.type] || Music;
            const color = TYPE_COLORS[track.type] || '#7C3AED';
            return (
              <motion.div
                key={track.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => play(track as any, results as any)}
                className="flex items-center gap-4 p-3 rounded-2xl glass cursor-pointer"
              >
                {track.artwork
                  ? <img src={track.artwork} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '30' }}><Icon size={18} style={{ color }} /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{track.title}</p>
                  <p className="text-xs text-white/40 truncate">{track.artist}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{track.type}</span>
              </motion.div>
            );
          })}
          {results.length === 0 && (
            <p className="text-white/30 text-sm text-center py-8">No results for "{query}"</p>
          )}
        </div>
      ) : (
        <>
          {/* Trending */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="primary-text" />
              <span className="text-xs font-black tracking-widest text-white/40 uppercase">Trending</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(t => (
                <button key={t} onClick={() => setQuery(t)}
                  className="glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white font-medium"
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Browse by type */}
          <div>
            <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Browse By Type</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(TYPE_ICONS).map(([type, Icon]: any) => (
                <motion.div key={type} whileTap={{ scale: 0.95 }}
                  className="glass rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                >
                  <Icon size={20} style={{ color: TYPE_COLORS[type] }} />
                  <span className="text-sm font-bold capitalize">{type}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
