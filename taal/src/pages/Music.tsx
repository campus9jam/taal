import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Share2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer, MOCK_TRACKS } from '@/context/PlayerContext';
import type { Track } from '@/context/PlayerContext';

function fmt(s?: number) {
  if (!s) return '';
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

const MOOD_CARDS = [
  { label: 'Cyberpunk', color: 'bg-cyan-500',   genre: 'Electronic' },
  { label: 'Zen Ambient', color: 'bg-blue-500', genre: 'Ambient'    },
  { label: 'Deep House', color: 'bg-primary',   genre: 'Electronic' },
  { label: 'Glitch Pop', color: 'bg-purple-500', genre: 'Pop'       },
];

const TrackItem = ({ track, onPlay }: { track: Track; onPlay: () => void }) => {
  const { currentTrack, isPlaying } = usePlayer();
  const active = currentTrack?.id === track.id;

  return (
    <div
      onClick={onPlay}
      className={cn(
        'flex items-center gap-4 p-3 rounded-2xl transition-all group cursor-pointer',
        active ? 'bg-white/8 border border-primary/20' : 'hover:bg-white/5',
      )}
      style={!active ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' } : undefined}
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden relative group-hover:scale-95 transition-transform flex-shrink-0">
        <img src={track.artwork} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play size={16} fill="white" className="text-white translate-x-0.5" />
        </div>
        {active && isPlaying && (
          <div className="absolute inset-0 bg-black/50 flex items-end justify-center pb-1.5 gap-0.5">
            {[1,2,3].map(j => (
              <div key={j} className="w-0.5 bg-primary rounded-full waveform-bar" style={{ animationDelay: `${j*0.1}s` }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm font-bold truncate tracking-tight', active && 'text-primary')}>{track.title}</h4>
        <p className="text-xs text-white/30 truncate mt-0.5">{track.artist}{track.album ? ` • ${track.album}` : ''}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[10px] font-mono text-white/20">{fmt(track.duration)}</span>
        <button
          onClick={e => e.stopPropagation()}
          className="p-2 text-white/10 hover:text-primary transition-colors"
        >
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default function MusicPage() {
  const { play } = usePlayer();
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const filtered = activeGenre
    ? MOCK_TRACKS.filter(t => t.genre === activeGenre || activeGenre === 'Electronic')
    : MOCK_TRACKS;

  return (
    <div className="flex flex-col gap-8 pb-32 px-5 pt-5">
      <header className="flex flex-col gap-1">
        <h2
          className="text-[32px] font-normal tracking-tighter uppercase text-primary"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          Universal Music
        </h2>
        <p className="text-white/40 text-xs tracking-widest font-black uppercase">C9 Audio Distribution</p>
      </header>

      {/* Featured Artist Hero */}
      <section className="relative h-64 rounded-[40px] overflow-hidden group cursor-pointer"
        onClick={() => play(MOCK_TRACKS[0], MOCK_TRACKS)}>
        <img
          src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=400&fit=crop"
          alt="Artist"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-black text-[8px] font-black uppercase tracking-widest rounded-full"
                style={{ background: 'var(--primary)' }}>
                Artist of the Orbit
              </span>
            </div>
            <h3 className="text-3xl font-black italic tracking-tight text-white">M83</h3>
            <p className="text-xs text-white/60 font-medium">1.2M Resonators • 4 Nodes Nearby</p>
          </div>
          <button className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play fill="black" size={24} />
          </button>
        </div>
      </section>

      {/* Top Resonance */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Top Resonance</h3>
          <TrendingUp size={14} className="text-primary/40" />
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map(track => (
            <TrackItem key={track.id} track={track} onPlay={() => play(track, filtered)} />
          ))}
        </div>
      </section>

      {/* Spectral Moods */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase px-1">Spectral Moods</h3>
        <div className="grid grid-cols-2 gap-4">
          {MOOD_CARDS.map(({ label, color, genre }) => (
            <motion.div
              key={label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
              className={cn('aspect-[2/1] rounded-3xl relative overflow-hidden group cursor-pointer',
                activeGenre === genre ? 'ring-2 ring-primary/60' : '')}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className={cn('absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity', color)} />
              <div className="absolute inset-0 flex items-center justify-center">
                <h4 className="font-black italic text-lg tracking-tight uppercase text-white">{label}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
