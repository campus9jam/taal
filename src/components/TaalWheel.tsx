import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Radio, Mic2, BookOpen, Wifi, Video, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const SEGMENTS = [
  { id: 'music', label: 'Music', icon: Music, color: '#7C3AED', route: '/music', angle: -90 },
  { id: 'radio', label: 'Radio', icon: Radio, color: '#06B6D4', route: '/radio', angle: -30 },
  { id: 'podcast', label: 'Podcast', icon: Mic2, color: '#a855f7', route: '/podcast', angle: 30 },
  { id: 'story', label: 'Stories', icon: BookOpen, color: '#f97316', route: '/stories', angle: 90 },
  { id: 'mesh', label: 'Mesh', icon: Wifi, color: '#22c55e', route: '/mesh', angle: 150 },
  { id: 'concert', label: 'Concert', icon: Video, color: '#ec4899', route: '/concerts', angle: -150 },
];

export default function TaalWheel({ size = 320 }: { size?: number }) {
  const navigate = useNavigate();
  const { isPlaying, currentTrack, resume, pause, next, prev } = usePlayer();
  const [centerExpanded, setCenterExpanded] = useState(false);
  const r = size / 2;
  const segR = r * 0.75;
  const centerR = r * 0.25;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient rings */}
      <div className="absolute inset-0 rounded-full border border-white/5 spin-slow" />
      <div className="absolute rounded-full border border-white/10 spin-reverse" style={{ inset: size * 0.06 }} />
      <div className="absolute rounded-full border-2 border-primary/20" style={{ inset: size * 0.12 }} />

      {/* Segment buttons */}
      {SEGMENTS.map((seg) => {
        const rad = (seg.angle * Math.PI) / 180;
        const dist = segR * 0.62;
        const x = r + dist * Math.cos(rad) - 40;
        const y = r + dist * Math.sin(rad) - 40;
        return (
          <motion.button
            key={seg.id}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(seg.route)}
            className="absolute w-20 h-20 rounded-2xl glass flex flex-col items-center justify-center gap-1 cursor-pointer"
            style={{ left: x, top: y, borderColor: seg.color + '40' }}
          >
            <seg.icon size={22} style={{ color: seg.color }} />
            <span className="text-[9px] font-black tracking-widest" style={{ color: seg.color }}>{seg.label.toUpperCase()}</span>
          </motion.button>
        );
      })}

      {/* Center disk */}
      <motion.div
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
        className="absolute rounded-full cursor-pointer"
        style={{ width: centerR * 2, height: centerR * 2, left: r - centerR, top: r - centerR }}
      >
        <div
          className="w-full h-full rounded-full pulse-glow flex items-center justify-center text-xs font-black tracking-widest"
          style={{ background: 'radial-gradient(circle, var(--primary), #1a0040)' }}
          onClick={() => setCenterExpanded(v => !v)}
        >
          <span className="text-white/90" style={{ fontSize: 11 }}>C9</span>
        </div>
      </motion.div>

      {/* Control popout */}
      <AnimatePresence>
        {centerExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute flex items-center gap-3 z-20 glass-dark rounded-full px-5 py-3"
            style={{ bottom: r - 22 }}
          >
            <motion.button whileTap={{ scale: 0.85 }} onClick={prev} className="text-white/60 hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={isPlaying ? pause : resume}
              className="w-10 h-10 rounded-full flex items-center justify-center primary-bg text-white"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={next} className="text-white/60 hover:text-white transition-colors">
              <SkipForward size={20} fill="currentColor" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current track label */}
      {currentTrack && (
        <div className="absolute" style={{ bottom: -40, left: 0, right: 0 }}>
          <p className="text-center text-xs text-white/50 truncate">{currentTrack.title} — {currentTrack.artist}</p>
        </div>
      )}
    </div>
  );
}
