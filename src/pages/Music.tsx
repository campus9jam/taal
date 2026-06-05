import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shuffle, Plus, ListMusic, MoreVertical, Download } from 'lucide-react';
import { usePlayer, MOCK_TRACKS } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';

function fmt(s?: number) {
  if (!s) return '';
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

const GENRES = ['All', 'Electronic', 'Pop', 'Ambient', 'Synthwave', 'Hip Hop', 'Jazz'];

export default function Music() {
  const { play, currentTrack, isPlaying, addToQueue } = usePlayer();
  const [genre, setGenre] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const filtered = genre === 'All' ? MOCK_TRACKS : MOCK_TRACKS.filter(t => t.genre === genre);

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 glass-dark rounded-full px-5 py-2.5 text-xs font-bold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-black">Universal Music</h1>
        <button
          onClick={() => {
            const rand = filtered[Math.floor(Math.random() * filtered.length)];
            play(rand, filtered);
            showToast('Shuffle started');
          }}
          className="flex items-center gap-2 primary-bg rounded-full px-4 py-2 text-sm font-bold text-white"
        >
          <Shuffle size={14} /> Shuffle
        </button>
      </div>

      {/* Genre filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {GENRES.map(g => (
          <button key={g} onClick={() => setGenre(g)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${genre === g ? 'primary-bg text-white' : 'glass text-white/60'}`}
          >{g}</button>
        ))}
      </div>

      {/* Track count */}
      <p className="text-xs text-white/30">{filtered.length} tracks</p>

      {/* Track list */}
      <div className="flex flex-col gap-2">
        {filtered.map((track, i) => {
          const active = currentTrack?.id === track.id;
          return (
            <motion.div
              key={track.id}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors relative ${active ? 'glass border border-primary/30' : 'hover:bg-white/5'}`}
            >
              {/* Track number / artwork */}
              <div
                className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                onClick={() => play(track, filtered)}
              >
                <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                {active && isPlaying ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                    {[1, 2, 3].map(j => <div key={j} className="w-0.5 bg-white rounded-full waveform-bar" style={{ animationDelay: `${j * 0.1}s` }} />)}
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-black">{i + 1}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0" onClick={() => play(track, filtered)}>
                <p className={`text-sm font-semibold truncate ${active ? 'primary-text' : ''}`}>{track.title}</p>
                <p className="text-xs text-white/40 truncate">{track.artist}{track.album ? ` • ${track.album}` : ''}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">{fmt(track.duration)}</span>
                <button
                  onClick={() => setFavorites(f => {
                    const n = new Set(f);
                    n.has(track.id) ? n.delete(track.id) : n.add(track.id);
                    showToast(n.has(track.id) ? 'Added to favorites' : 'Removed from favorites');
                    return n;
                  })}
                  className={favorites.has(track.id) ? 'text-red-400' : 'text-white/20 hover:text-white/60'}
                >
                  <Heart size={16} fill={favorites.has(track.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => setMenuOpen(menuOpen === track.id ? null : track.id)}
                  className="text-white/20 hover:text-white/60"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Context menu */}
              <AnimatePresence>
                {menuOpen === track.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-3 top-14 z-20 glass-dark rounded-xl p-1 min-w-[160px] shadow-2xl"
                  >
                    {[
                      { icon: ListMusic, label: 'Add to Queue', action: () => { addToQueue(track); showToast('Added to queue'); } },
                      { icon: Plus, label: 'Add to Playlist', action: () => showToast('Added to playlist') },
                      { icon: Download, label: 'Download', action: () => showToast('Downloading...') },
                      { icon: Heart, label: 'Add to Favorites', action: () => { setFavorites(f => { const n = new Set(f); n.add(track.id); return n; }); showToast('Added to favorites'); } },
                    ].map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => { opt.action(); setMenuOpen(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-white/80 transition-colors"
                      >
                        <opt.icon size={14} className="primary-text" />
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
