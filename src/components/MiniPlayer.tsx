import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Heart, ChevronUp, ChevronDown,
  Shuffle, Repeat, Repeat1, Gauge, Moon, ListMusic
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import FullPlayer from './FullPlayer';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, resume, pause, next, prev, isFavorite, toggleFavorite, currentTime, duration } = usePlayer();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Mini Player Bar */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-1"
          >
            <div
              className="glass-dark rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setExpanded(true)}
            >
              {/* Progress bar */}
              <div className="h-0.5 bg-white/10">
                <div className="h-full primary-bg transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>

              <div className="flex items-center gap-3 px-4 py-3">
                {/* Artwork */}
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  {currentTrack.artwork
                    ? <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full primary-bg flex items-center justify-center text-white text-xs font-bold">♪</div>
                  }
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1 gap-0.5 bg-black/40">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-0.5 bg-white rounded-full waveform-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
                  <p className="text-xs text-white/40 truncate">{currentTrack.artist}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  <button onClick={toggleFavorite} className={isFavorite ? 'text-red-400' : 'text-white/40 hover:text-white'}>
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={prev} className="text-white/60 hover:text-white">
                    <SkipBack size={18} fill="currentColor" />
                  </button>
                  <button
                    onClick={isPlaying ? pause : resume}
                    className="w-9 h-9 rounded-full primary-bg flex items-center justify-center text-white"
                  >
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </button>
                  <button onClick={next} className="text-white/60 hover:text-white">
                    <SkipForward size={18} fill="currentColor" />
                  </button>
                </div>

                <ChevronUp size={16} className="text-white/30 ml-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Player */}
      <AnimatePresence>
        {expanded && <FullPlayer onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </>
  );
}
