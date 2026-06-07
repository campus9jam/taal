import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Radio, Mic2, BookOpen, Share2, Ticket, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';

const CATEGORIES = [
  { id: 'music',    label: 'Music',    icon: Music,    color: '#38bdf8', path: '/music'    },  /* top       */
  { id: 'concert',  label: 'Concert',  icon: Ticket,   color: '#3b82f6', path: '/concerts' },  /* top-right */
  { id: 'podcast',  label: 'Podcast',  icon: Mic2,     color: '#a855f7', path: '/podcast'  },  /* bot-right */
  { id: 'stories',  label: 'Stories',  icon: BookOpen, color: '#f97316', path: '/stories'  },  /* bottom    */
  { id: 'radio',    label: 'Radio',    icon: Radio,    color: '#ec4899', path: '/radio'    },  /* bot-left  */
  { id: 'mesh',     label: 'Mesh',     icon: Share2,   color: '#22c55e', path: '/mesh'     },  /* top-left  */
];

/* Positions matching the screenshot (6 items evenly around a circle) */
const ANGLES = [-90, -30, 30, 90, 150, -150]; // degrees, starting from top

export const TaalWheel = () => {
  const navigate = useNavigate();
  const { isPlaying, pause, resume, next, prev } = usePlayer();
  const [showControls, setShowControls] = useState(false);

  // Wheel diameter in px (fits comfortably in 375px wide phone)
  const WHEEL = 300;
  const CENTER = WHEEL / 2;
  const ICON_ORBIT = 112; // distance from center to icon center
  const ICON_SIZE  = 64;  // icon button w/h

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: WHEEL, height: WHEEL }}
    >
      {/* Outer atmosphere rings */}
      <div className="absolute inset-0 rounded-full border border-white/5 scale-[1.08] pointer-events-none" />
      <div className="absolute inset-0 rounded-full border border-white/[0.03] scale-[1.18] pointer-events-none" />

      {/* Spinning disc (background) */}
      <motion.div
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ repeat: isPlaying ? Infinity : 0, duration: 10, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {/* Vinyl groove rings */}
        {[0.72, 0.52, 0.35].map((scale, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-white/[0.04] m-auto"
            style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
          />
        ))}
      </motion.div>

      {/* Category icon buttons */}
      {CATEGORIES.map((cat, i) => {
        const rad = (ANGLES[i] * Math.PI) / 180;
        const x   = CENTER + ICON_ORBIT * Math.cos(rad) - ICON_SIZE / 2;
        const y   = CENTER + ICON_ORBIT * Math.sin(rad) - ICON_SIZE / 2;

        return (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(cat.path)}
            className="absolute flex items-center justify-center rounded-2xl"
            style={{
              left: x,
              top: y,
              width: ICON_SIZE,
              height: ICON_SIZE,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <cat.icon size={26} color={cat.color} strokeWidth={1.8} />
          </motion.button>
        );
      })}

      {/* Center C9 disc */}
      <div
        className="absolute flex items-center justify-center rounded-full cursor-pointer z-20"
        style={{
          width: 110,
          height: 110,
          left: CENTER - 55,
          top: CENTER - 55,
          background: 'radial-gradient(circle at 40% 40%, #1a1020, #0a0a0c)',
          border: '2px solid rgba(186,146,155,0.25)',
          boxShadow: '0 0 40px rgba(186,146,155,0.15), inset 0 0 30px rgba(0,0,0,0.5)',
        }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={() => setShowControls(v => !v)}
      >
        <AnimatePresence mode="wait">
          {showControls ? (
            <motion.div
              key="controls"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{   opacity: 0, scale: 0.7 }}
              className="flex items-center gap-2"
            >
              <button onClick={e => { e.stopPropagation(); prev(); }} className="text-white/50 hover:text-white transition-colors">
                <SkipBack size={18} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause fill="black" size={18} /> : <Play fill="black" size={18} className="translate-x-px" />}
              </button>
              <button onClick={e => { e.stopPropagation(); next(); }} className="text-white/50 hover:text-white transition-colors">
                <SkipForward size={18} />
              </button>
            </motion.div>
          ) : (
            <motion.span
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              className="text-2xl font-black italic tracking-tighter select-none"
              style={{
                color: '#fff',
                textShadow: '0 0 20px rgba(186,146,155,0.6)',
                fontStyle: 'italic',
              }}
            >
              C9
            </motion.span>
          )}
        </AnimatePresence>

        {/* Cyan orbital ring (matches screenshot) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '1.5px solid rgba(0,220,220,0.35)',
            boxShadow: '0 0 12px rgba(0,220,220,0.15)',
          }}
        />

        {/* Pulse ring when playing */}
        {isPlaying && (
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute inset-0 rounded-full border border-primary pointer-events-none"
          />
        )}
      </div>
    </div>
  );
};

export default TaalWheel;
