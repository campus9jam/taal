import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon, Music, Mic2, BookOpen, Video,
  CloudUpload, FolderOpen, Bell, BellOff, Play,
  X, FileAudio, Download, Pause, Trash2, CheckCircle2,
  HardDrive, Wifi, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/context/PlayerContext';

const CONTENT_TYPES = [
  { id: 'music',   label: 'Music',   icon: Music,    color: '#7C3AED' },
  { id: 'podcast', label: 'Podcast', icon: Mic2,     color: '#a855f7' },
  { id: 'story',   label: 'Story',   icon: BookOpen, color: '#f97316' },
  { id: 'concert', label: 'Concert', icon: Video,    color: '#ec4899' },
];

const MOCK_DOWNLOADS = [
  { id: 'd1', title: 'Midnight City',   artist: 'M83',             size: '8.2 MB',  status: 'done',   progress: 100 },
  { id: 'd2', title: 'Quantum Dreams',  artist: 'Archivist',       size: '12.4 MB', status: 'active', progress: 62  },
  { id: 'd3', title: 'The Simulation',  artist: 'Quantum Deep',    size: '45.1 MB', status: 'queued', progress: 0   },
];

export default function Upload() {
  const { importLocalFile, requestNotifications, notificationsEnabled, currentTrack } = usePlayer();
  const [step,      setStep]      = useState<'home' | 'type' | 'details' | 'success'>('home');
  const [type,      setType]      = useState('music');
  const [form,      setForm]      = useState({ title: '', artist: '', genre: 'Electronic' });
  const [localQ,    setLocalQ]    = useState<File[]>([]);
  const [dragging,  setDragging]  = useState(false);
  const [downloads, setDownloads] = useState(MOCK_DOWNLOADS);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('audio/'));
    if (!valid.length) return;
    valid.forEach(f => importLocalFile(f));
    setLocalQ(q => [...valid, ...q]);
  };

  return (
    <div className="flex flex-col gap-8 pb-32 px-5 pt-5">
      <header className="flex flex-col gap-1">
        <h2
          className="text-[32px] font-normal tracking-tighter uppercase text-primary"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          Upload
        </h2>
        <p className="text-white/40 text-xs tracking-widest font-black uppercase">Import & Publish to C9 Taal</p>
      </header>

      {/* Notifications */}
      <div
        className={cn('rounded-2xl p-4 flex items-center gap-3', notificationsEnabled ? '' : '')}
        style={{
          background: notificationsEnabled ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
          border: notificationsEnabled ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {notificationsEnabled
          ? <Bell size={18} className="text-green-400 flex-shrink-0" />
          : <BellOff size={18} className="text-white/30 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{notificationsEnabled ? 'Notifications on' : 'Enable notifications'}</p>
          <p className="text-[10px] text-white/40 mt-0.5">
            {notificationsEnabled ? "Lock-screen now-playing alerts active" : "Get now-playing alerts in the background"}
          </p>
        </div>
        {!notificationsEnabled && (
          <button onClick={requestNotifications} className="px-3 py-2 rounded-xl text-xs font-black text-white flex-shrink-0"
            style={{ background: 'var(--primary)' }}>
            Allow
          </button>
        )}
      </div>

      {/* Local File Import */}
      <div>
        <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">Import from Device</p>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          className={cn('rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all border-2 border-dashed',
            dragging ? 'border-primary/80' : 'border-white/10 hover:border-primary/40',
          )}
          style={{ background: dragging ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.03)' }}
        >
          <FolderOpen size={32} className={dragging ? 'text-primary' : 'text-white/30'} />
          <div className="text-center">
            <p className="text-sm font-bold text-white">Drop audio files here</p>
            <p className="text-xs text-white/40 mt-1">or tap to browse — MP3, M4A, FLAC, WAV, OGG</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="audio/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

        <AnimatePresence>
          {localQ.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 mt-3">
              {localQ.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary"
                    style={{ background: 'rgba(124,58,237,0.15)' }}>
                    <FileAudio size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-white">{file.name.replace(/\.[^/.]+$/, '')}</p>
                    <p className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  {currentTrack?.id === `local-${file.name}-${file.size}` ? (
                    <div className="flex gap-0.5 items-end h-4">
                      {[1,2,3].map(j => <div key={j} className="w-0.5 rounded-full primary-bg waveform-bar" style={{ animationDelay: `${j*0.1}s` }} />)}
                    </div>
                  ) : <Play size={14} className="text-white/30" />}
                  <button onClick={() => setLocalQ(q => q.filter((_, qi) => qi !== i))} className="text-white/20 hover:text-white/60">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Download Center */}
      <div>
        <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">Download Center</p>

        {/* Storage overview */}
        <div className="rounded-[28px] p-5 relative overflow-hidden mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(124,58,237,0.1)' }} />
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary" style={{ background: 'rgba(124,58,237,0.15)' }}>
              <HardDrive size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-white">Storage Status</p>
              <p className="text-[10px] text-white/40">2.4 GB / 8 GB used</p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: '30%', background: 'var(--primary)' }} />
          </div>
          <div className="flex items-center gap-4 mt-3">
            {[['Encrypted', <ShieldCheck size={12} />, '#4ade80'], ['Synced', <Wifi size={12} />, 'var(--accent)']].map(([label, icon, color]) => (
              <div key={label as string} className="flex items-center gap-1.5" style={{ color: color as string }}>
                {icon as React.ReactNode}
                <span className="text-[9px] font-black uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Downloads list */}
        <div className="flex flex-col gap-3">
          {downloads.map((dl, i) => (
            <motion.div
              key={dl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: dl.status === 'done' ? 'rgba(74,222,128,0.1)' : 'rgba(124,58,237,0.1)' }}>
                {dl.status === 'done'   ? <CheckCircle2 size={18} className="text-green-400" /> :
                 dl.status === 'active' ? <Download size={18} className="text-primary animate-bounce" /> :
                 <Download size={18} className="text-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{dl.title}</p>
                <p className="text-[10px] text-white/40 truncate">{dl.artist} · {dl.size}</p>
                {dl.status === 'active' && (
                  <div className="w-full h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${dl.progress}%`, background: 'var(--primary)' }} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {dl.status === 'active' && (
                  <button className="p-2 text-white/30 hover:text-white transition-colors"><Pause size={16} /></button>
                )}
                <button
                  onClick={() => setDownloads(d => d.filter(x => x.id !== dl.id))}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[10px] text-white/20 font-black">OR PUBLISH</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Publish CTA */}
      <AnimatePresence mode="wait">
        {step === 'home' && (
          <motion.button
            key="home"
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep('type')}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-4 flex items-center justify-center gap-2 text-sm font-black text-white rounded-2xl"
            style={{ background: 'var(--primary)' }}
          >
            <CloudUpload size={18} /> Upload & Publish Content
          </motion.button>
        )}

        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <p className="text-sm text-white/50 font-medium">What are you uploading?</p>
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_TYPES.map(ct => (
                <motion.button key={ct.id} whileTap={{ scale: 0.95 }}
                  onClick={() => { setType(ct.id); setStep('details'); }}
                  className="rounded-2xl p-5 flex flex-col items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: ct.color + '20' }}>
                    <ct.icon size={24} style={{ color: ct.color }} />
                  </div>
                  <span className="text-sm font-bold text-white">{ct.label}</span>
                </motion.button>
              ))}
            </div>
            <button onClick={() => setStep('home')} className="text-xs text-white/30 font-bold mt-2">← Back</button>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <p className="text-sm text-white/50 font-medium">Fill in the details</p>
            {['title', 'artist'].map(field => (
              <input
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(form as any)[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            ))}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep('success')}
              className="py-3 rounded-xl text-sm font-black text-white"
              style={{ background: 'var(--primary)' }}
            >
              Submit
            </motion.button>
            <button onClick={() => setStep('type')} className="text-xs text-white/30 font-bold">← Back</button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 size={48} className="text-green-400" />
            <p className="text-lg font-black text-white">Transmission Sent</p>
            <p className="text-sm text-white/40 text-center">Your content has been published to the C9 network</p>
            <button onClick={() => setStep('home')} className="mt-2 px-6 py-2.5 rounded-xl text-xs font-black text-white"
              style={{ background: 'var(--primary)' }}>
              Upload Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
