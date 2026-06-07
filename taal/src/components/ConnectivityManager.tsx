import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Share2, Globe, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConnectivityManager = () => {
  const [online,      setOnline]      = useState(navigator.onLine);
  const [meshActive]                  = useState(true);
  const [showStatus,  setShowStatus]  = useState(false);

  useEffect(() => {
    const up   = () => { setOnline(true);  setShowStatus(true); };
    const down = () => { setOnline(false); setShowStatus(true); };
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    if (!navigator.onLine) setShowStatus(true);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  useEffect(() => {
    if (!showStatus) return;
    const t = setTimeout(() => setShowStatus(false), 5000);
    return () => clearTimeout(t);
  }, [showStatus]);

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col items-center pointer-events-none">
      <AnimatePresence>
        {(!online || showStatus) && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{   y: -50,  opacity: 0 }}
            className="pointer-events-auto bg-surface/80 backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              {online ? (
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase">
                  <Globe size={14} /><span>Cloud Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] tracking-widest uppercase">
                  <WifiOff size={14} /><span>Offline · Cache Active</span>
                </div>
              )}
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Share2 size={14} className={cn(meshActive ? 'text-green-500' : 'text-white/20')} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {meshActive ? 'Mesh Active' : 'Mesh Sleep'}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1 text-[10px] font-black text-primary/40">
              <Activity size={12} /><span>{online ? 'SYNCED' : 'LOCAL IDB'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showStatus && online && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 right-4 pointer-events-auto cursor-pointer p-2"
          onClick={() => setShowStatus(true)}
        >
          <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
        </motion.div>
      )}
    </div>
  );
};
