import React from 'react';
import { motion } from 'framer-motion';
import { Music, Radio, Mic2, BookOpen, Wifi, Video, ChevronRight, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaalWheel from '../components/TaalWheel';
import DiscoveryEngine from '../components/DiscoveryEngine';
import { usePlayer, MOCK_TRACKS, MOCK_RADIO } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const QUICK_LINKS = [
  { icon: Music, label: 'Music', color: '#7C3AED', route: '/music' },
  { icon: Radio, label: 'Radio', color: '#06B6D4', route: '/radio' },
  { icon: Mic2, label: 'Podcasts', color: '#a855f7', route: '/podcast' },
  { icon: BookOpen, label: 'Stories', color: '#f97316', route: '/stories' },
  { icon: Wifi, label: 'Mesh', color: '#22c55e', route: '/mesh' },
  { icon: Video, label: 'Concerts', color: '#ec4899', route: '/concerts' },
];

export default function Home() {
  const navigate = useNavigate();
  const { play } = usePlayer();
  const { themes, theme } = useTheme();
  const currentTheme = themes.find(t => t.id === theme) ?? themes[0];

  return (
    <motion.div
      variants={container} initial="hidden" animate="show"
      className="flex flex-col gap-8 p-5 pb-safe"
    >
      {/* Taal Wheel Hero */}
      <motion.section variants={item} className="flex flex-col items-center gap-8 pt-4 pb-6">
        <TaalWheel size={300} />
      </motion.section>

      {/* Quick links */}
      <motion.section variants={item}>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ icon: Icon, label, color, route }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(route)}
              className="glass rounded-2xl p-4 flex flex-col items-start gap-2"
            >
              <div className="p-2 rounded-xl" style={{ background: color + '20' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-sm font-bold">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Trending */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black tracking-widest text-white/50 uppercase">Trending Now</span>
          <button onClick={() => navigate('/search')} className="flex items-center gap-1 text-[10px] primary-text font-bold">
            See All <ChevronRight size={10} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {[...MOCK_TRACKS, ...MOCK_RADIO.slice(0, 2)].map(track => (
            <motion.button
              key={track.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => play(track as any, MOCK_TRACKS)}
              className="flex-shrink-0 w-36 glass rounded-2xl overflow-hidden text-left"
            >
              <div className="relative h-24">
                <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 text-[9px] font-black tracking-widest uppercase opacity-60">
                  {track.type}
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold truncate">{track.title}</p>
                <p className="text-[10px] text-white/40 truncate">{track.artist}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Styles Gallery CTA */}
      <motion.section variants={item}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/styles')}
          className="w-full rounded-2xl p-4 flex items-center gap-4 overflow-hidden relative"
          style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})` }}
        >
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Palette size={20} className="text-white" />
          </div>
          <div className="flex-1 text-left relative">
            <p className="text-sm font-black text-white">Styles Gallery</p>
            <p className="text-xs text-white/70">12 themes · customize your look</p>
          </div>
          <ChevronRight size={18} className="text-white/70 relative" />
        </motion.button>
      </motion.section>

      {/* Discovery Engine */}
      <motion.section variants={item}>
        <DiscoveryEngine />
      </motion.section>
    </motion.div>
  );
}
