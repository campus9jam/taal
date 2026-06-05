import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Download, ListMusic, Clock, Music, Mic2, BookOpen,
  Plus, X, Play, Pause, FolderOpen, FileAudio, Trash2, Edit2, Check
} from 'lucide-react';
import { usePlayer, MOCK_TRACKS, MOCK_PODCASTS } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';

const TABS = [
  { id: 'favorites',  label: 'Favorites',  icon: Heart },
  { id: 'local',      label: 'Local',      icon: FolderOpen },
  { id: 'playlists',  label: 'Playlists',  icon: ListMusic },
  { id: 'history',    label: 'History',    icon: Clock },
];

const INIT_PLAYLISTS = [
  { id: 'pl1', name: 'Late Night Vibes', tracks: MOCK_TRACKS.slice(0, 2), artwork: MOCK_TRACKS[0].artwork! },
  { id: 'pl2', name: 'Focus Mode',       tracks: MOCK_TRACKS.slice(1, 3), artwork: MOCK_TRACKS[1].artwork! },
];

function fmt(s?: number) {
  if (!s) return '';
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

const ACCEPTED = '.mp3,.m4a,.ogg,.wav,.flac,.aac';

export default function Library() {
  const [tab,          setTab]          = useState('favorites');
  const [favorites,    setFavorites]    = useState<Set<string>>(new Set(MOCK_TRACKS.map(t => t.id)));
  const [playlists,    setPlaylists]    = useState(INIT_PLAYLISTS);
  const [newPlName,    setNewPlName]    = useState('');
  const [creatingPl,   setCreatingPl]   = useState(false);
  const [editingPl,    setEditingPl]    = useState<string | null>(null);
  const [editName,     setEditName]     = useState('');
  const [localTracks,  setLocalTracks]  = useState<Track[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { play, currentTrack, isPlaying, pause, resume, importLocalFile } = usePlayer();

  const historyItems = [...MOCK_TRACKS, ...MOCK_PODCASTS].slice(0, 8);

  const handleImportFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).filter(f => f.type.startsWith('audio/')).forEach(file => {
      importLocalFile(file);
      const track: Track = {
        id: `local-${file.name}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local File',
        url: URL.createObjectURL(file),
        type: 'music',
        isLocal: true,
      };
      setLocalTracks(ts => {
        if (ts.some(t => t.id === track.id)) return ts;
        return [track, ...ts];
      });
    });
  };

  const createPlaylist = () => {
    if (!newPlName.trim()) return;
    setPlaylists(pl => [...pl, {
      id: `pl${Date.now()}`,
      name: newPlName.trim(),
      tracks: [],
      artwork: MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)].artwork!,
    }]);
    setNewPlName('');
    setCreatingPl(false);
  };

  const deletePlaylist = (id: string) => setPlaylists(pl => pl.filter(p => p.id !== id));
  const saveEditPl = (id: string) => {
    setPlaylists(pl => pl.map(p => p.id === id ? { ...p, name: editName } : p));
    setEditingPl(null);
  };

  const favTracks = MOCK_TRACKS.filter(t => favorites.has(t.id));

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      <div className="pt-2">
        <h1 className="text-2xl font-black">My Library</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${tab === id ? 'primary-bg text-white' : 'glass text-white/60'}`}
          >
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* ── Favorites ── */}
      {tab === 'favorites' && (
        <div className="flex flex-col gap-2">
          {favTracks.length === 0 && (
            <div className="text-center py-10 text-white/30 text-sm">No favorites yet.<br/>Tap ♥ on any track.</div>
          )}
          {favTracks.map(track => {
            const active = currentTrack?.id === track.id;
            return (
              <motion.div key={track.id} whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3 rounded-2xl glass cursor-pointer ${active ? 'ring-2 ring-primary/30' : ''}`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                  onClick={() => play(track, favTracks)}>
                  <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                  {active && isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                      {[1,2,3].map(j => <div key={j} className="w-0.5 bg-white rounded-full waveform-bar" style={{ animationDelay: `${j*0.1}s` }} />)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0" onClick={() => play(track, favTracks)}>
                  <p className={`text-sm font-semibold truncate ${active ? 'primary-text' : ''}`}>{track.title}</p>
                  <p className="text-xs text-white/40 truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">{fmt(track.duration)}</span>
                  <button onClick={() => setFavorites(f => { const n = new Set(f); n.delete(track.id); return n; })}>
                    <Heart size={16} className="text-red-400" fill="currentColor" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Local Files ── */}
      {tab === 'local' && (
        <div className="flex flex-col gap-4">
          {/* Storage info */}
          <div className="glass rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Local Storage</p>
              <p className="text-xs text-white/40 mt-0.5">{localTracks.length} file{localTracks.length !== 1 ? 's' : ''} imported</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="primary-bg rounded-xl px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Plus size={12} /> Import
              </button>
            </div>
          </div>

          <input ref={fileRef} type="file" accept={ACCEPTED} multiple className="hidden"
            onChange={e => handleImportFiles(e.target.files)} />

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="glass rounded-2xl p-5 flex flex-col items-center gap-2 cursor-pointer border-dashed border border-white/10 hover:border-primary/40 transition-all"
          >
            <FolderOpen size={28} className="text-white/30" />
            <p className="text-sm text-white/50 font-medium">Drop files or tap to browse</p>
            <p className="text-xs text-white/30">MP3 · M4A · FLAC · WAV · OGG · AAC</p>
          </div>

          {localTracks.length === 0 && (
            <div className="text-center py-4 text-white/30 text-xs">No local files yet. Import from your device above.</div>
          )}

          {localTracks.map(track => {
            const active = currentTrack?.id === track.id;
            return (
              <motion.div key={track.id} whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3 rounded-2xl glass ${active ? 'ring-2 ring-primary/30' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl primary-bg/20 flex items-center justify-center flex-shrink-0"
                  onClick={() => play(track, localTracks)}>
                  <FileAudio size={18} className="primary-text" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => play(track, localTracks)}>
                  <p className={`text-sm font-semibold truncate ${active ? 'primary-text' : ''}`}>{track.title}</p>
                  <p className="text-xs text-white/40">Local · {track.genre ?? 'Audio'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => active ? (isPlaying ? pause() : resume()) : play(track, localTracks)}
                    className="w-8 h-8 rounded-full primary-bg flex items-center justify-center">
                    {active && isPlaying ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" />}
                  </button>
                  <button onClick={() => setLocalTracks(ts => ts.filter(t => t.id !== track.id))}
                    className="text-white/20 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Playlists ── */}
      {tab === 'playlists' && (
        <div className="flex flex-col gap-3">
          {/* Create */}
          {creatingPl ? (
            <div className="flex gap-2">
              <input value={newPlName} onChange={e => setNewPlName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                placeholder="Playlist name..."
                className="flex-1 glass rounded-xl px-4 py-3 text-sm text-white outline-none" autoFocus
              />
              <button onClick={createPlaylist} className="primary-bg rounded-xl px-4 py-3 text-sm font-bold text-white">
                <Check size={16} />
              </button>
              <button onClick={() => setCreatingPl(false)} className="glass rounded-xl px-3 py-3 text-white/50">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setCreatingPl(true)}
              className="glass rounded-2xl p-4 flex items-center justify-center gap-2 text-sm font-bold primary-text border-dashed"
              style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: 'var(--primary)' }}
            >
              <Plus size={16} /> Create New Playlist
            </button>
          )}

          {playlists.map(pl => (
            <motion.div key={pl.id} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-3 rounded-2xl glass"
            >
              <img src={pl.artwork} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {editingPl === pl.id ? (
                  <div className="flex gap-2">
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditPl(pl.id)}
                      className="flex-1 glass rounded-lg px-2 py-1 text-sm text-white outline-none" autoFocus
                    />
                    <button onClick={() => saveEditPl(pl.id)} className="primary-text"><Check size={14} /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold">{pl.name}</p>
                    <p className="text-xs text-white/40">{pl.tracks.length} tracks</p>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingPl(pl.id); setEditName(pl.name); }}
                  className="text-white/20 hover:text-white/60"><Edit2 size={14} /></button>
                <button onClick={() => deletePlaylist(pl.id)}
                  className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                {pl.tracks.length > 0 && (
                  <button onClick={() => play(pl.tracks[0], pl.tracks)}
                    className="w-8 h-8 rounded-full primary-bg flex items-center justify-center">
                    <Play size={12} fill="white" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── History ── */}
      {tab === 'history' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/40">Recent plays</span>
            <button className="text-xs text-red-400 font-bold">Clear All</button>
          </div>
          {historyItems.map((t, i) => {
            const active = currentTrack?.id === t.id;
            const timeAgo = ['Just now', '5m ago', '1h ago', '3h ago', 'Yesterday', 'Yesterday', '2d ago', '3d ago'][i];
            return (
              <motion.div key={`${t.id}-h${i}`} whileTap={{ scale: 0.98 }}
                onClick={() => play(t, historyItems as Track[])}
                className={`flex items-center gap-3 p-3 rounded-2xl glass cursor-pointer ${active ? 'ring-2 ring-primary/30' : ''}`}
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={t.artwork} alt="" className="w-full h-full object-cover" />
                  {active && isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                      {[1,2,3].map(j => <div key={j} className="w-0.5 bg-white rounded-full waveform-bar" />)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${active ? 'primary-text' : ''}`}>{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {t.type === 'podcast' ? <Mic2 size={9} className="text-white/30" /> : <Music size={9} className="text-white/30" />}
                    <p className="text-xs text-white/40 truncate">{t.artist}</p>
                  </div>
                </div>
                <span className="text-[10px] text-white/30 flex-shrink-0">{timeAgo}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
