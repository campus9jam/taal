import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Radio, Mic2, BookOpen, Video, ChevronRight } from 'lucide-react';
import { usePlayer, MOCK_TRACKS, MOCK_RADIO, MOCK_PODCASTS, MOCK_STORIES, type Track } from '../context/PlayerContext';

const FOR_YOU: Track[] = [
  { ...MOCK_TRACKS[2], title: 'AI Pick: Breathe Extended', id: 'ai1' },
  { ...MOCK_PODCASTS[0], title: 'Recommended: Quantum Deep S2', id: 'ai2' },
  { ...MOCK_TRACKS[3], title: 'Because you liked M83', id: 'ai3' },
];

const TRENDING_NOW = [
  { label: '#SynthwaveDreams', count: '14.2K', color: '#7C3AED' },
  { label: '#AmbientFocus', count: '9.8K', color: '#06B6D4' },
  { label: '#MeshSharing', count: '7.1K', color: '#22c55e' },
  { label: '#PodcastArchivist', count: '5.4K', color: '#a855f7' },
  { label: '#LateNightVibes', count: '4.9K', color: '#f97316' },
];

const MOODS = [
  { label: 'Focus', icon: '🎯', tracks: MOCK_TRACKS.slice(0,2) },
  { label: 'Chill', icon: '🌙', tracks: MOCK_TRACKS.slice(1,3) },
  { label: 'Energy', icon: '⚡', tracks: MOCK_TRACKS.slice(2,4) },
  { label: 'Story Time', icon: '📖', tracks: MOCK_STORIES },
];

export default function DiscoveryEngine() {
  const { play } = usePlayer();
  const [activeMood, setActiveMood] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* For You */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="primary-text" />
          <span className="text-xs font-black tracking-widest text-white/50 uppercase">For You</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {FOR_YOU.map(track => (
            <motion.button
              key={track.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => play(track, FOR_YOU)}
              className="flex-shrink-0 w-40 glass rounded-2xl overflow-hidden text-left"
            >
              <div className="relative h-28">
                <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="text-[8px] font-black tracking-widest primary-text bg-black/50 rounded-full px-2 py-0.5 uppercase">{track.type}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold leading-tight">{track.title}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{track.artist}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Mood */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Heart size={14} className="primary-text" />
          <span className="text-xs font-black tracking-widest text-white/50 uppercase">Play by Mood</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MOODS.map(m => (
            <motion.button
              key={m.label}
              whileTap={{ scale: 0.92 }}
              onClick={() => { setActiveMood(m.label); play(m.tracks[0], m.tracks as Track[]); }}
              className={`rounded-2xl p-3 flex flex-col items-center gap-1 transition-all ${activeMood === m.label ? 'primary-bg' : 'glass'}`}
            >
              <span className="text-xl">{m.icon}</span>
              <span className={`text-[9px] font-black uppercase tracking-wider ${activeMood === m.label ? 'text-white' : 'text-white/50'}`}>{m.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="primary-text" />
          <span className="text-xs font-black tracking-widest text-white/50 uppercase">Trending on Taal</span>
        </div>
        <div className="flex flex-col gap-2">
          {TRENDING_NOW.map((t, i) => (
            <motion.div key={t.label} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              <span className="text-xs font-black text-white/20 w-5">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: t.color }}>{t.label}</p>
              </div>
              <span className="text-xs text-white/30">{t.count} plays</span>
              <ChevronRight size={14} className="text-white/20" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
