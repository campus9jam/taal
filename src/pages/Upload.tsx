import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon, Music, Mic2, BookOpen, Video,
  CloudUpload, Check, FolderOpen, Bell, BellOff, Play,
  X, FileAudio
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const CONTENT_TYPES = [
  { id: 'music',   label: 'Music',   icon: Music,   color: '#7C3AED' },
  { id: 'podcast', label: 'Podcast', icon: Mic2,    color: '#a855f7' },
  { id: 'story',   label: 'Story',   icon: BookOpen, color: '#f97316' },
  { id: 'concert', label: 'Concert', icon: Video,   color: '#ec4899' },
];

const GENRES = ['Electronic', 'Pop', 'Rock', 'Jazz', 'Hip Hop', 'Ambient', 'Classical', 'R&B', 'World'];
const ACCEPTED_AUDIO = '.mp3,.m4a,.ogg,.wav,.flac,.aac';

export default function Upload() {
  const { importLocalFile, requestNotifications, notificationsEnabled, currentTrack } = usePlayer();

  const [step,    setStep]    = useState<'home' | 'type' | 'details' | 'success'>('home');
  const [type,    setType]    = useState('music');
  const [form,    setForm]    = useState({ title: '', artist: '', genre: 'Electronic', premium: false, price: '' });
  const [localQ,  setLocalQ]  = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Local import handling ──
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('audio/'));
    if (!valid.length) return;
    valid.forEach(f => importLocalFile(f));
    setLocalQ(q => [...valid, ...q]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      <div className="pt-2">
        <h1 className="text-2xl font-black">Upload</h1>
        <p className="text-sm text-white/40 mt-1">Import local files or publish to Taal</p>
      </div>

      {/* ── Notifications banner ── */}
      <motion.div
        className={`rounded-2xl p-4 flex items-center gap-3 ${notificationsEnabled ? 'bg-green-500/10 border border-green-500/20' : 'glass'}`}
      >
        {notificationsEnabled
          ? <Bell size={18} className="text-green-400 flex-shrink-0" />
          : <BellOff size={18} className="text-white/30 flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{notificationsEnabled ? 'Notifications on' : 'Enable notifications'}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {notificationsEnabled
              ? 'You\'ll see now-playing alerts on your lock screen'
              : 'Get now-playing alerts even when the app is in the background'}
          </p>
        </div>
        {!notificationsEnabled && (
          <button
            onClick={requestNotifications}
            className="flex-shrink-0 primary-bg rounded-xl px-3 py-2 text-xs font-black text-white"
          >
            Allow
          </button>
        )}
      </motion.div>

      {/* ── Local File Import ── */}
      <div>
        <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">Import from Device</p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all border-2 border-dashed ${
            dragging
              ? 'border-primary/80 bg-primary/10'
              : 'border-white/10 hover:border-primary/40 glass'
          }`}
        >
          <FolderOpen size={32} className={dragging ? 'primary-text' : 'text-white/30'} />
          <div className="text-center">
            <p className="text-sm font-bold">Drop audio files here</p>
            <p className="text-xs text-white/40 mt-1">or tap to browse — MP3, M4A, FLAC, WAV, OGG</p>
          </div>
          {dragging && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs primary-text font-bold">
              Release to import!
            </motion.p>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_AUDIO}
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {/* Imported queue */}
        <AnimatePresence>
          {localQ.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 mt-3">
              {localQ.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 glass rounded-xl">
                  <div className="w-8 h-8 rounded-lg primary-bg/20 flex items-center justify-center">
                    <FileAudio size={14} className="primary-text" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{file.name.replace(/\.[^/.]+$/, '')}</p>
                    <p className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  {currentTrack?.id === `local-${file.name}` ? (
                    <div className="flex gap-0.5 items-end h-4">
                      {[1,2,3].map(j => <div key={j} className="w-0.5 rounded-full primary-bg waveform-bar" style={{ animationDelay: `${j*0.1}s` }} />)}
                    </div>
                  ) : (
                    <Play size={14} className="text-white/30" />
                  )}
                  <button onClick={() => setLocalQ(q => q.filter((_, qi) => qi !== i))} className="text-white/20 hover:text-white/60">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30 font-bold">OR PUBLISH</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* ── Publish to Taal ── */}
      <AnimatePresence mode="wait">
        {step === 'home' && (
          <motion.button
            key="home"
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep('type')}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="primary-bg rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-black text-white"
          >
            <CloudUpload size={18} /> Upload & Publish Content
          </motion.button>
        )}

        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <p className="text-sm text-white/50 font-medium">What are you uploading?</p>
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_TYPES.map(ct => (
                <motion.button
                  key={ct.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setType(ct.id); setStep('details'); }}
                  className="glass rounded-2xl p-5 flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: ct.color + '25' }}>
                    <ct.icon size={24} style={{ color: ct.color }} />
                  </div>
                  <span className="text-sm font-bold">{ct.label}</span>
                </motion.button>
              ))}
            </div>
            <button onClick={() => setStep('home')} className="text-xs text-white/40 text-center">← Back</button>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            {/* Upload zone */}
            <div
              className="glass rounded-2xl p-8 flex flex-col items-center gap-3 border-dashed"
              style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: 'var(--primary)' }}
            >
              <CloudUpload size={36} className="primary-text opacity-60" />
              <p className="text-sm font-bold">Tap to upload file</p>
              <p className="text-xs text-white/40">MP3, AAC, FLAC, WAV · Max 100 MB</p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Title *"
                className="glass rounded-xl px-4 py-3 text-sm text-white outline-none placeholder-white/30"
              />
              <input
                value={form.artist}
                onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                placeholder="Artist / Creator *"
                className="glass rounded-xl px-4 py-3 text-sm text-white outline-none placeholder-white/30"
              />
              <select
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                className="glass rounded-xl px-4 py-3 text-sm text-white outline-none bg-transparent"
              >
                {GENRES.map(g => <option key={g} value={g} className="bg-gray-900">{g}</option>)}
              </select>

              {/* Monetization toggle */}
              <div className="glass rounded-xl p-4 flex flex-col gap-3">
                <p className="text-xs font-black tracking-widest text-white/40 uppercase">Monetization</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Premium Content</span>
                  <button
                    onClick={() => setForm(f => ({ ...f, premium: !f.premium }))}
                    className={`w-10 h-5 rounded-full transition-colors ${form.premium ? 'primary-bg' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${form.premium ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                {form.premium && (
                  <input
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Price (e.g. $2.99)"
                    className="glass rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder-white/30"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('type')} className="glass rounded-xl px-5 py-3 text-sm font-bold text-white/60">Back</button>
              <button onClick={() => setStep('success')} className="flex-1 primary-bg rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2">
                <UploadIcon size={16} /> Publish
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full primary-bg flex items-center justify-center">
              <Check size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-black">Published!</h3>
            <p className="text-white/50 text-sm">Your content is now live on Taal.</p>
            <div className="glass rounded-2xl p-4 w-full text-left">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Distribution Status</p>
              {['Taal Platform', 'Creator Feed', 'Search Index', 'Mesh Network'].map((d, i) => (
                <div key={d} className="flex items-center gap-2 py-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${i < 2 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-sm text-white/70">{d}</span>
                  <span className={`ml-auto text-xs font-bold ${i < 2 ? 'text-green-400' : 'text-yellow-400'}`}>{i < 2 ? 'LIVE' : 'PENDING'}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('home')} className="primary-bg rounded-xl px-8 py-3 text-sm font-bold text-white">
              Upload Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
