import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Radio, Search, Download, User,
  Play, Pause, SkipBack, SkipForward,
  CloudOff, Check,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/context/PlayerContext';
import FullPlayer from '@/components/FullPlayer';

/* ── Custom library icon with accent dot ── */
const LibraryIcon = (props: React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) => (
  <div className="relative">
    <Download {...(props as any)} />
    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
  </div>
);

/* ── Bottom navbar ────────────────────────────────────────────────── */
export const TaalFooterNavbar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Music,       path: '/music',   label: 'Music'   },
    { icon: Radio,       path: '/radio',   label: 'Radio'   },
    { icon: Search,      path: '/search',  label: 'Search'  },
    { icon: LibraryIcon, path: '/library', label: 'Library' },
    { icon: User,        path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 h-24 flex items-center justify-around glass-morphism rounded-t-[40px]">
      {navItems.map(({ icon: Icon, path, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={cn(
              'flex flex-col items-center gap-1 transition-all duration-300',
              isActive ? 'text-primary scale-110' : 'text-white/40 hover:text-white',
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

/* ── Mini player ──────────────────────────────────────────────────── */
export const MiniPlayer = () => {
  const { currentTrack, isPlaying, pause, resume, next, prev } = usePlayer();
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSynced,     setIsSynced]     = useState(false);
  const [expanded,     setExpanded]     = useState(false);

  useEffect(() => {
    if (!currentTrack) return;
    setSyncProgress(0);
    setIsSynced(false);
    const iv = setInterval(() => {
      setSyncProgress(p => {
        if (p >= 100) { clearInterval(iv); setTimeout(() => setIsSynced(true), 500); return 100; }
        return p + Math.floor(Math.random() * 20) + 10;
      });
    }, 500);
    return () => clearInterval(iv);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(true)}
        className="fixed bottom-24 left-4 right-4 z-40 glass-morphism p-3 rounded-3xl flex items-center gap-3 border border-white/5 active:bg-white/5 transition-colors overflow-hidden relative cursor-pointer"
      >
        {/* Sync progress bar */}
        {!isSynced && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full z-0">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${syncProgress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        )}

        {/* Artwork */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden shrink-0 z-10">
          <img
            src={currentTrack.artwork ?? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 z-10">
          <h4 className="text-sm font-bold truncate">{currentTrack.title}</h4>
          <p
            className="text-[10px] font-normal uppercase text-white/40 tracking-tighter truncate"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {currentTrack.artist}
          </p>
        </div>

        {/* Sync icon */}
        <div className="flex items-center justify-center w-6 z-10">
          {isSynced
            ? <Check size={12} className="text-primary" />
            : <CloudOff size={12} className="text-white/40 animate-pulse" />
          }
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 px-2 shrink-0 z-10">
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="p-2 text-white/40 hover:text-white"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg"
          >
            {isPlaying
              ? <Pause fill="black" size={20} />
              : <Play  fill="black" size={20} className="ml-0.5" />
            }
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="p-2 text-white/40 hover:text-white"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && <FullPlayer onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </>
  );
};
