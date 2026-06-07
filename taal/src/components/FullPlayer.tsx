import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ListMusic,
  Heart, Share2, Timer, Gauge, ChevronDown,
  Volume2, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/context/PlayerContext';

function fmt(s: number) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [15, 30, 60, 90];

export default function FullPlayer({ onClose }: { onClose: () => void }) {
  const {
    currentTrack, isPlaying, pause, resume, next, prev,
    currentTime, duration, seek,
    volume, setVolume, isMuted, toggleMute,
    isShuffled, toggleShuffle,
    repeatMode, cycleRepeat,
    isFavorite, toggleFavorite,
    playbackSpeed, setSpeed,
    sleepTimer, setSleepTimer,
    eqBands, setEQBand,
    queue,
  } = usePlayer();

  const [showSpeedMenu,  setShowSpeedMenu]  = useState(false);
  const [showSleepMenu,  setShowSleepMenu]  = useState(false);
  const [showQueue,      setShowQueue]      = useState(false);
  const [showEQ,         setShowEQ]         = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const progress  = duration > 0 ? currentTime / duration : 0;

  if (!currentTrack) return null;

  const artwork = currentTrack.artwork ?? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop';

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(${artwork})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(2,8,23,0.6), rgba(2,8,23,0.95))' }} />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] opacity-30" style={{ background: 'var(--primary)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: 'var(--accent)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-14 pb-2">
        <button onClick={onClose} className="p-3 rounded-full text-white/40 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ChevronDown size={22} />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Now Resonating</p>
          <h4
            className="text-[9px] font-normal uppercase tracking-widest text-primary"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            C9 Resonator v4.0
          </h4>
        </div>
        <button
          onClick={() => setShowQueue(v => !v)}
          className={cn('p-3 rounded-full transition-colors', showQueue ? 'text-primary' : 'text-white/40')}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ListMusic size={22} />
        </button>
      </header>

      {/* Queue panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 flex-1 overflow-y-auto px-6 pb-4"
            style={{ scrollbarWidth: 'none' }}
          >
            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-3">Up Next</p>
            <div className="flex flex-col gap-2">
              {queue.map((track, i) => (
                <div key={`${track.id}-${i}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-2xl transition-colors',
                    currentTrack.id === track.id
                      ? 'border border-primary/30'
                      : 'hover:bg-white/5',
                  )}
                  style={currentTrack.id === track.id
                    ? { background: 'rgba(124,58,237,0.15)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }
                  }
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-bold truncate', currentTrack.id === track.id ? 'text-primary' : 'text-white')}>{track.title}</p>
                    <p className="text-[10px] text-white/40 truncate">{track.artist}</p>
                  </div>
                  {currentTrack.id === track.id && <Sparkles size={13} className="text-primary animate-pulse flex-shrink-0" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main player */}
      {!showQueue && (
        <div className="relative z-10 flex flex-col flex-1 px-6 pb-8 gap-6 overflow-hidden">
          {/* Artwork */}
          <div className="flex-1 flex items-center justify-center py-2">
            <motion.div
              layoutId="player-art"
              className="w-full max-w-[280px] aspect-square rounded-[40px] overflow-hidden shadow-2xl"
              animate={{ scale: isPlaying ? 1 : 0.92 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <img
                src={artwork}
                alt="Album Cover"
                className={cn('w-full h-full object-cover transition-transform duration-700', isPlaying ? 'scale-105' : 'scale-100')}
              />
            </motion.div>
          </div>

          {/* Track info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black tracking-tight text-white truncate">{currentTrack.title}</h2>
              <p className="text-sm text-white/50 mt-0.5 truncate">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
              <button onClick={toggleFavorite} className={cn('p-2 transition-colors', isFavorite ? 'text-primary' : 'text-white/30 hover:text-white')}>
                <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2 text-white/30 hover:text-white transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-2">
            <div
              className="relative h-1 rounded-full cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * duration);
              }}
            >
              <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: 'var(--primary)' }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg"
                style={{ left: `calc(${progress * 100}% - 6px)` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/30">{fmt(currentTime)}</span>
              <span className="text-[10px] font-mono text-white/30">{fmt(duration)}</span>
            </div>
          </div>

          {/* Main controls */}
          <div className="flex items-center justify-center gap-6">
            <button onClick={toggleShuffle} className={cn('p-2 transition-colors', isShuffled ? 'text-primary' : 'text-white/30 hover:text-white')}>
              <Shuffle size={20} />
            </button>
            <button onClick={prev} className="p-2 text-white/70 hover:text-white transition-colors">
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button
              onClick={isPlaying ? pause : resume}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
            >
              {isPlaying
                ? <Pause fill="black" size={28} />
                : <Play  fill="black" size={28} className="translate-x-0.5" />
              }
            </button>
            <button onClick={next} className="p-2 text-white/70 hover:text-white transition-colors">
              <SkipForward size={28} fill="currentColor" />
            </button>
            <button onClick={cycleRepeat} className={cn('p-2 transition-colors', repeatMode !== 'none' ? 'text-primary' : 'text-white/30 hover:text-white')}>
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-white/30 hover:text-white transition-colors">
              <Volume2 size={16} />
            </button>
            <div
              className="flex-1 h-1 rounded-full cursor-pointer relative"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume((e.clientX - rect.left) / rect.width);
              }}
            >
              <div className="h-full rounded-full" style={{ width: `${isMuted ? 0 : volume * 100}%`, background: 'var(--primary)' }} />
            </div>
          </div>

          {/* Extra tools */}
          <div className="flex items-center justify-around">
            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => { setShowSpeedMenu(v => !v); setShowSleepMenu(false); setShowEQ(false); }}
                className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-colors', showSpeedMenu ? 'text-primary' : 'text-white/30 hover:text-white')}
              >
                <Gauge size={18} />
                <span className="text-[8px] font-black uppercase">{playbackSpeed}x</span>
              </button>
              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-2xl p-2 flex flex-col gap-1 z-10 min-w-[80px]"
                    style={{ background: 'rgba(10,14,30,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {SPEEDS.map(s => (
                      <button key={s} onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                        className={cn('px-3 py-1.5 rounded-xl text-xs font-black transition-colors', playbackSpeed === s ? 'bg-primary text-white' : 'text-white/50 hover:bg-white/10')}>
                        {s}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sleep */}
            <div className="relative">
              <button
                onClick={() => { setShowSleepMenu(v => !v); setShowSpeedMenu(false); setShowEQ(false); }}
                className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-colors', sleepTimer ? 'text-primary' : 'text-white/30 hover:text-white')}
              >
                <Timer size={18} />
                <span className="text-[8px] font-black uppercase">{sleepTimer ? `${sleepTimer}m` : 'Sleep'}</span>
              </button>
              <AnimatePresence>
                {showSleepMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-2xl p-2 flex flex-col gap-1 z-10 min-w-[80px]"
                    style={{ background: 'rgba(10,14,30,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <button onClick={() => { setSleepTimer(null); setShowSleepMenu(false); }}
                      className="px-3 py-1.5 rounded-xl text-xs font-black text-white/50 hover:bg-white/10 transition-colors">
                      Off
                    </button>
                    {SLEEP_OPTIONS.map(m => (
                      <button key={m} onClick={() => { setSleepTimer(m); setShowSleepMenu(false); }}
                        className={cn('px-3 py-1.5 rounded-xl text-xs font-black transition-colors', sleepTimer === m ? 'bg-primary text-white' : 'text-white/50 hover:bg-white/10')}>
                        {m}m
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* EQ */}
            <button
              onClick={() => { setShowEQ(v => !v); setShowSpeedMenu(false); setShowSleepMenu(false); }}
              className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-colors', showEQ ? 'text-primary' : 'text-white/30 hover:text-white')}
            >
              <SlidersHorizontal size={18} />
              <span className="text-[8px] font-black uppercase">EQ</span>
            </button>
          </div>

          {/* EQ panel */}
          <AnimatePresence>
            {showEQ && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl p-4 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-3">Equalizer</p>
                <div className="flex items-end justify-around gap-2 h-16">
                  {['32', '64', '125', '250', '500', '1K', '4K', '16K'].map((label, i) => (
                    <div key={label} className="flex flex-col items-center gap-1 flex-1">
                      <input
                        type="range" min="-12" max="12" value={eqBands[i] ?? 0}
                        onChange={e => setEQBand(i, Number(e.target.value))}
                        className="w-full cursor-pointer accent-primary"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 48 }}
                      />
                      <span className="text-[7px] text-white/20 font-mono">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
