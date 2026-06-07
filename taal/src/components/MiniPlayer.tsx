import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import FullPlayer from './FullPlayer';

export default function MiniPlayer() {
  const {
    currentTrack, isPlaying, resume, pause, next, prev,
    currentTime, duration,
  } = usePlayer();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed left-0 right-0 z-40 px-3"
            style={{ bottom: 60 }}   /* sits directly above 60px BottomNav */
          >
            <div
              className="relative overflow-hidden cursor-pointer"
              style={{
                background: 'rgba(10,14,30,0.96)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={() => setExpanded(true)}
            >
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
                <motion.div
                  className="h-full"
                  style={{ background: 'var(--primary)', width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3">
                {/* Artwork */}
                <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                  {currentTrack.artwork ? (
                    <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full primary-bg flex items-center justify-center text-white text-lg font-bold">♪</div>
                  )}
                  {/* Waveform overlay when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1.5 gap-0.5 bg-black/40">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-0.5 bg-white rounded-full waveform-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0" onClick={e => { e.stopPropagation(); setExpanded(true); }}>
                  <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
                  <p className="text-xs text-white/40 truncate">{currentTrack.artist}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={prev}
                    className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <SkipBack size={18} />
                  </button>

                  <button
                    onClick={isPlaying ? pause : resume}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white primary-bg"
                  >
                    {isPlaying
                      ? <Pause size={18} fill="currentColor" />
                      : <Play  size={18} fill="currentColor" className="translate-x-0.5" />
                    }
                  </button>

                  <button
                    onClick={next}
                    className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Player Sheet */}
      <AnimatePresence>
        {expanded && <FullPlayer onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </>
  );
}
