import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio as RadioIcon, Play, Pause, Heart, Signal, Wifi } from 'lucide-react';
import { usePlayer, MOCK_RADIO } from '../context/PlayerContext';

const CATEGORIES = ['All', 'Ambient', 'Electronic', 'Jazz', 'Hip Hop', 'Pop', 'News'];

export default function Radio() {
  const { play, currentTrack, isPlaying, pause, resume } = usePlayer();
  const [cat, setCat] = useState('All');
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const filtered = cat === 'All' ? MOCK_RADIO : MOCK_RADIO.filter(s => s.genre === cat);

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      <div className="pt-2">
        <h1 className="text-2xl font-black">Live Resonate</h1>
        <p className="text-sm text-white/40 mt-1">Real-time radio streams</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${cat === c ? 'primary-bg text-white' : 'glass text-white/60'}`}
          >{c}</button>
        ))}
      </div>

      {/* Station grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(station => {
          const active = currentTrack?.id === station.id;
          return (
            <motion.div
              key={station.id}
              whileTap={{ scale: 0.95 }}
              className={`glass rounded-2xl overflow-hidden cursor-pointer ${active ? 'ring-2 ring-primary/60' : ''}`}
            >
              <div className="relative h-28">
                <img src={station.artwork} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Live badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/90 rounded-full px-2 py-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full bg-white ${active && isPlaying ? 'animate-pulse' : ''}`} />
                  <span className="text-[9px] font-black text-white">LIVE</span>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); setFavs(f => { const n = new Set(f); n.has(station.id) ? n.delete(station.id) : n.add(station.id); return n; }); }}
                  className={`absolute top-2 right-2 ${favs.has(station.id) ? 'text-red-400' : 'text-white/60'}`}
                >
                  <Heart size={14} fill={favs.has(station.id) ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={() => {
                    if (active) { isPlaying ? pause() : resume(); }
                    else play(station as any, MOCK_RADIO as any);
                  }}
                  className="absolute bottom-2 right-2 w-9 h-9 rounded-full primary-bg flex items-center justify-center"
                >
                  {active && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>
              </div>

              <div className="p-3">
                <p className="text-sm font-bold truncate">{station.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Signal size={10} className="text-green-400" />
                  <span className="text-[10px] text-white/40">{station.genre} • {active && isPlaying ? 'Streaming' : 'Ready'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* RadioTimelineWheel */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">Radio Timeline</p>
        <div className="flex items-center gap-2 overflow-x-auto">
          {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((time, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 3 ? 'primary-bg' : 'glass'}`}>
                <RadioIcon size={12} className={i === 3 ? 'text-white' : 'text-white/30'} />
              </div>
              <span className="text-[9px] text-white/30">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
