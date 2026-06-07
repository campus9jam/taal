import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Folder, Heart, Radio, Mic2, BookOpen,
  Music as MusicIcon, Search, MoreVertical, Trash2, PlayCircle,
  Bookmark, Plus, FileAudio, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer, MOCK_TRACKS } from '@/context/PlayerContext';
import type { Track } from '@/context/PlayerContext';

const CATEGORIES = [
  { id: 'all',       label: 'All Content', icon: Folder   },
  { id: 'favorites', label: 'Favorites',   icon: Heart    },
  { id: 'music',     label: 'Music',       icon: MusicIcon },
  { id: 'podcast',   label: 'Podcasts',    icon: Mic2     },
  { id: 'stories',   label: 'Stories',     icon: BookOpen  },
];

const AI_MOODS = ['Cyber Drift', 'Deep State', 'Neon Focus', 'Quantum Pulse', 'Ethereal'];

export default function Library() {
  const { play, importLocalFile, currentTrack } = usePlayer();
  const [activeTab,    setActiveTab]    = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [favorites,    setFavorites]    = useState<Set<string>>(new Set());
  const [localFiles,   setLocalFiles]   = useState<Track[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(f => {
      const n = new Set(f);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleImport = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).filter(f => f.type.startsWith('audio/')).forEach(f => {
      importLocalFile(f);
      const track: Track = {
        id: `local-${f.name}-${f.size}`,
        title: f.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local File',
        url: URL.createObjectURL(f),
        type: 'music',
        isLocal: true,
        artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
      };
      setLocalFiles(prev => [track, ...prev]);
    });
  };

  const allTracks = [...localFiles, ...MOCK_TRACKS];

  const displayTracks = allTracks
    .filter(t => activeTab === 'all' || activeTab === 'favorites'
      ? (activeTab === 'favorites' ? favorites.has(t.id) : true)
      : t.type === activeTab
    )
    .filter(t => !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col gap-6 pb-32 px-5 pt-5">
      <header className="flex items-center justify-between">
        <div>
          <h2
            className="text-[32px] font-normal tracking-tighter uppercase text-primary"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            Vault
          </h2>
          <p className="text-white/40 text-xs tracking-widest font-black uppercase">Local Media Repository</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:scale-105"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={20} className="text-white" />
        </button>
        <input ref={fileRef} type="file" accept="audio/*" multiple className="hidden"
          onChange={e => handleImport(e.target.files)} />
      </header>

      {/* AI Moods */}
      <section className="rounded-[28px] p-5 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none" style={{ background: 'rgba(124,58,237,0.1)' }} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-full bg-primary/20 text-primary"><MusicIcon size={12} /></div>
              AI Audio Moods
            </h3>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Based on your listening history</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {AI_MOODS.map(mood => (
            <span key={mood} className="px-3 py-1.5 rounded-full text-primary text-[9px] font-black uppercase tracking-widest"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              #{mood}
            </span>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all text-xs font-black uppercase tracking-widest flex-shrink-0',
              activeTab === cat.id ? 'text-black' : 'text-white/40 hover:text-white',
            )}
            style={activeTab === cat.id
              ? { background: 'var(--primary)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
            }
          >
            <cat.icon size={16} strokeWidth={activeTab === cat.id ? 2.5 : 1.5} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Search size={16} className="text-white/30 flex-shrink-0" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search vault..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/20"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}><X size={14} className="text-white/30" /></button>
        )}
      </div>

      {/* Track list */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
            {activeTab === 'favorites' ? 'Favorites' : 'Downloads'} • {displayTracks.length}
          </h3>
        </div>

        {displayTracks.length === 0 ? (
          <div className="py-16 text-center">
            <FileAudio size={36} className="mx-auto text-white/10 mb-3" />
            <p className="text-xs text-white/20 font-black uppercase tracking-widest">Vault is empty</p>
            <button onClick={() => fileRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-black uppercase text-primary"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              Import Files
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {displayTracks.map((track, i) => {
                const active = currentTrack?.id === track.id;
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => play(track, displayTracks)}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-2xl transition-all group cursor-pointer',
                      active ? 'border border-primary/30' : 'hover:bg-white/5',
                    )}
                    style={active
                      ? { background: 'rgba(124,58,237,0.1)' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }
                    }
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-95 transition-transform">
                      <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-bold truncate tracking-tight', active && 'text-primary')}>{track.title}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{track.artist}</p>
                      {track.isLocal && (
                        <span className="text-[8px] font-black text-primary/60 uppercase tracking-wider">.TAAL LOCAL</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); toggleFavorite(track.id); }}
                        className={cn('p-2 transition-colors', favorites.has(track.id) ? 'text-primary' : 'text-white/20 hover:text-white')}>
                        <Heart size={16} fill={favorites.has(track.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={e => e.stopPropagation()} className="p-2 text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Storage bar */}
      <section className="rounded-[28px] p-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h4 className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mb-3">Storage Dynamics</h4>
        <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full" style={{ width: '45%', background: 'var(--primary)' }} />
          <div className="h-full" style={{ width: '15%', background: 'var(--accent)' }} />
          <div className="h-full bg-purple-500" style={{ width: '10%' }} />
        </div>
        <div className="flex items-center gap-4 mt-3">
          {[['Music', '45%', 'var(--primary)'], ['Radio', '15%', 'var(--accent)'], ['Other', '10%', '#a855f7']].map(([label, pct, color]) => (
            <div key={label as string} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color as string }} />
              <span className="text-[9px] text-white/40 font-bold">{label} {pct}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
