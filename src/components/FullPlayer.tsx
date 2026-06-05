import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, Heart, MoreHorizontal, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Gauge, Moon, ListMusic, Sliders, Share2,
  RotateCcw, FastForward
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function fmt(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const EQ_LABELS = ['32', '64', '125', '250', '500', '1K', '4K', '16K'];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function FullPlayer({ onClose }: { onClose: () => void }) {
  const {
    currentTrack, isPlaying, resume, pause, next, prev,
    currentTime, duration, seek,
    volume, setVolume, isMuted, toggleMute,
    isShuffled, toggleShuffle,
    repeatMode, cycleRepeat,
    isFavorite, toggleFavorite,
    playbackSpeed, setSpeed,
    abLoop, setABLoop,
    eqBands, setEQBand,
    sleepTimer, setSleepTimer,
    queue,
  } = usePlayer();

  const [tab, setTab] = useState<'player' | 'eq' | 'queue'>('player');
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [showSleep, setShowSleep] = useState(false);

  const progress = duration > 0 ? currentTime / duration : 0;

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      {/* Blurred artwork background */}
      {currentTrack.artwork && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${currentTrack.artwork})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
          }}
        />
      )}

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 pt-14 pb-4">
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <ChevronDown size={28} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">
            {currentTrack.type === 'radio' ? 'Live Radio' : currentTrack.type === 'podcast' ? 'Podcast' : currentTrack.type === 'story' ? 'Story' : 'Now Playing'}
          </p>
        </div>
        <button className="text-white/60 hover:text-white">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="relative flex justify-center gap-6 px-6 mb-4">
        {(['player', 'eq', 'queue'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors ${tab === t ? 'primary-text border-current' : 'text-white/30 border-transparent'}`}
          >
            {t === 'player' ? 'Player' : t === 'eq' ? 'EQ' : 'Queue'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10">
        {/* PLAYER TAB */}
        {tab === 'player' && (
          <div className="flex flex-col items-center gap-6">
            {/* Artwork */}
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={isPlaying ? { duration: 20, ease: 'linear', repeat: Infinity } : { duration: 0.5 }}
              className="w-64 h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10"
            >
              {currentTrack.artwork
                ? <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full primary-bg flex items-center justify-center text-6xl">♪</div>
              }
            </motion.div>

            {/* Track info */}
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-2xl font-black truncate">{currentTrack.title}</h2>
                <button onClick={toggleFavorite} className={isFavorite ? 'text-red-400' : 'text-white/30'}>
                  <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="text-white/50 mt-1">{currentTrack.artist}</p>
              {currentTrack.album && <p className="text-white/30 text-sm">{currentTrack.album}</p>}
            </div>

            {/* Progress */}
            <div className="w-full">
              <div
                className="w-full h-1 bg-white/10 rounded-full cursor-pointer relative"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seek(((e.clientX - rect.left) / rect.width) * duration);
                }}
              >
                <div className="h-full primary-bg rounded-full relative" style={{ width: `${progress * 100}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg" />
                </div>
                {/* AB markers */}
                {abLoop.start !== null && duration > 0 && (
                  <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${(abLoop.start / duration) * 100}%` }} />
                )}
                {abLoop.end !== null && duration > 0 && (
                  <div className="absolute top-0 h-full w-0.5 bg-orange-400" style={{ left: `${(abLoop.end / duration) * 100}%` }} />
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/40">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center gap-6 w-full justify-center">
              <button onClick={toggleShuffle} className={isShuffled ? 'primary-text' : 'text-white/40 hover:text-white'}>
                <Shuffle size={22} />
              </button>
              <button onClick={prev} className="text-white hover:scale-110 transition-transform">
                <SkipBack size={30} fill="currentColor" />
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={isPlaying ? pause : resume}
                className="w-16 h-16 rounded-full primary-bg flex items-center justify-center text-white shadow-lg"
                style={{ boxShadow: '0 0 30px var(--primary)' }}
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </motion.button>
              <button onClick={next} className="text-white hover:scale-110 transition-transform">
                <SkipForward size={30} fill="currentColor" />
              </button>
              <button onClick={cycleRepeat} className={repeatMode !== 'none' ? 'primary-text' : 'text-white/40 hover:text-white'}>
                {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
              </button>
            </div>

            {/* Secondary controls */}
            <div className="grid grid-cols-4 gap-3 w-full">
              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedPicker(v => !v)}
                  className="w-full glass rounded-xl py-3 flex flex-col items-center gap-1"
                >
                  <Gauge size={18} className="primary-text" />
                  <span className="text-[10px] text-white/50">{playbackSpeed}x</span>
                </button>
                {showSpeedPicker && (
                  <div className="absolute bottom-full mb-2 left-0 glass-dark rounded-xl p-2 z-10 flex flex-col gap-1 min-w-[80px]">
                    {SPEEDS.map(s => (
                      <button key={s} onClick={() => { setSpeed(s); setShowSpeedPicker(false); }}
                        className={`text-xs py-1 px-2 rounded-lg ${playbackSpeed === s ? 'primary-bg text-white' : 'text-white/60 hover:text-white'}`}
                      >{s}x</button>
                    ))}
                  </div>
                )}
              </div>

              {/* A-B Loop */}
              <button
                onClick={() => {
                  if (!abLoop.start) setABLoop('start');
                  else if (!abLoop.end) setABLoop('end');
                  else setABLoop('clear');
                }}
                className="glass rounded-xl py-3 flex flex-col items-center gap-1"
              >
                <RotateCcw size={18} className={abLoop.active ? 'text-yellow-400' : 'primary-text'} />
                <span className="text-[10px] text-white/50">
                  {!abLoop.start ? 'A-B' : !abLoop.end ? 'Set B' : 'Clear'}
                </span>
              </button>

              {/* Sleep */}
              <div className="relative">
                <button
                  onClick={() => setShowSleep(v => !v)}
                  className="w-full glass rounded-xl py-3 flex flex-col items-center gap-1"
                >
                  <Moon size={18} className={sleepTimer ? 'text-blue-400' : 'primary-text'} />
                  <span className="text-[10px] text-white/50">{sleepTimer ? `${sleepTimer}m` : 'Sleep'}</span>
                </button>
                {showSleep && (
                  <div className="absolute bottom-full mb-2 left-0 glass-dark rounded-xl p-2 z-10 flex flex-col gap-1 min-w-[80px]">
                    {[15, 30, 45, 60].map(m => (
                      <button key={m} onClick={() => { setSleepTimer(m); setShowSleep(false); }}
                        className={`text-xs py-1 px-2 rounded-lg ${sleepTimer === m ? 'primary-bg text-white' : 'text-white/60 hover:text-white'}`}
                      >{m} min</button>
                    ))}
                    <button onClick={() => { setSleepTimer(null); setShowSleep(false); }}
                      className="text-xs py-1 px-2 rounded-lg text-red-400">Off</button>
                  </div>
                )}
              </div>

              {/* Share */}
              <button className="glass rounded-xl py-3 flex flex-col items-center gap-1">
                <Share2 size={18} className="primary-text" />
                <span className="text-[10px] text-white/50">Share</span>
              </button>
            </div>

            {/* Volume */}
            <div className="w-full flex items-center gap-3">
              <span className="text-white/40 text-xs">Vol</span>
              <input type="range" min={0} max={1} step={0.01} value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 rounded-full accent-[var(--primary)]"
              />
              <span className="text-white/40 text-xs">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}

        {/* EQ TAB */}
        {tab === 'eq' && (
          <div className="flex flex-col gap-6">
            <h3 className="text-center font-black tracking-widest text-sm text-white/50 uppercase">Equalizer</h3>
            <div className="flex items-end justify-around h-48 gap-1">
              {eqBands.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] text-white/40">{val > 0 ? '+' : ''}{val}dB</span>
                  <div className="relative flex-1 w-full flex items-center justify-center">
                    <input
                      type="range" min={-12} max={12} step={1} value={val}
                      onChange={e => setEQBand(i, parseInt(e.target.value))}
                      className="absolute h-32 accent-[var(--primary)]"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl', width: 8 }}
                    />
                  </div>
                  <span className="text-[10px] text-white/30">{EQ_LABELS[i]}</span>
                </div>
              ))}
            </div>

            {/* EQ Presets */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['Flat', 'Bass Boost', 'Treble Boost', 'Vocal', 'Electronic', 'Acoustic'].map(p => (
                <button key={p}
                  onClick={() => {
                    const presets: Record<string, number[]> = {
                      'Flat': [0,0,0,0,0,0,0,0],
                      'Bass Boost': [8,6,4,2,0,0,0,0],
                      'Treble Boost': [0,0,0,0,2,4,6,8],
                      'Vocal': [-2,-2,0,4,4,4,2,0],
                      'Electronic': [6,4,0,-2,0,4,6,8],
                      'Acoustic': [4,4,2,0,0,2,4,3],
                    };
                    presets[p]?.forEach((v, i) => setEQBand(i, v));
                  }}
                  className="glass rounded-full px-4 py-2 text-xs font-bold text-white/60 hover:text-white hover:border-primary/40 transition-colors"
                >{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* QUEUE TAB */}
        {tab === 'queue' && (
          <div className="flex flex-col gap-3">
            <h3 className="font-black tracking-widest text-sm text-white/50 uppercase">Up Next</h3>
            {queue.length === 0 && <p className="text-white/30 text-sm">Queue is empty</p>}
            {queue.map((track, i) => (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${track.id === currentTrack.id ? 'glass border border-primary/30' : 'hover:bg-white/5'}`}
              >
                <span className="text-xs text-white/30 w-5">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  {track.artwork
                    ? <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full primary-bg" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-white/40 truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-white/30">{fmt(track.duration || 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
