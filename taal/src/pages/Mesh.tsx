import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Users, Wifi, Bluetooth, Download, Check, AlertCircle, Sparkles, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_PEERS = [
  { id: 'p1', name: 'ZionR Node',      avatar: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=60&h=60&fit=crop', distance: '1.2m', activeContent: 'Midnight City',    latency: 12 },
  { id: 'p2', name: 'Obsidian Wave',   avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop', distance: '3.8m', activeContent: 'Quantum Deep',     latency: 28 },
  { id: 'p3', name: 'Solaris Hub',     avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop', distance: '6.1m', activeContent: 'Cyber Stories',    latency: 45 },
];

export default function Mesh() {
  const [status,          setStatus]          = useState<'idle' | 'searching' | 'connected'>('idle');
  const [peers,           setPeers]           = useState<typeof MOCK_PEERS>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [latencies,       setLatencies]       = useState<Record<string, number>>({});
  const [pingResult,      setPingResult]      = useState<string | null>(null);

  const startSearch = async () => {
    setStatus('searching');
    await new Promise(r => setTimeout(r, 1800));
    setPeers(MOCK_PEERS);
    setStatus('connected');
  };

  useEffect(() => {
    if (status !== 'connected') return;
    const iv = setInterval(() => {
      const l: Record<string, number> = {};
      peers.forEach(p => { l[p.id] = Math.floor(Math.random() * 50) + 10; });
      setLatencies(l);
    }, 2000);
    return () => clearInterval(iv);
  }, [status, peers]);

  const ping = (peer: typeof MOCK_PEERS[0]) => {
    setPingResult(`Pinging ${peer.name}...`);
    setTimeout(() => setPingResult(`${peer.name} acknowledged ✓`), 1000);
    setTimeout(() => setPingResult(null), 3500);
  };

  return (
    <div className="flex flex-col gap-8 pb-32 px-5 pt-5">
      <header className="flex items-start justify-between">
        <div>
          <h2
            className="text-[32px] font-normal tracking-tighter uppercase text-primary"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            Taal Mesh
          </h2>
          <p className="text-white/40 text-xs font-bold tracking-tight uppercase">P2P Distribution · Node Discovery</p>
        </div>
        <button
          onClick={() => setShowDiagnostics(v => !v)}
          className={cn(
            'px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors',
            showDiagnostics ? 'text-black' : 'text-white/40',
          )}
          style={showDiagnostics ? { background: 'var(--primary)' } : { background: 'rgba(255,255,255,0.05)' }}
        >
          {showDiagnostics ? 'Live Diagnostics' : 'Monitor Nodes'}
        </button>
      </header>

      {/* Ping toast */}
      <AnimatePresence>
        {pingResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2.5 rounded-full text-xs font-bold text-white fixed top-14 left-1/2 -translate-x-1/2 z-50"
            style={{ background: 'rgba(10,14,30,0.95)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            {pingResult}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan CTA */}
      {status === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 py-12"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.05)' }}>
              <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.08)' }}>
                <Wifi size={28} className="text-primary" />
              </div>
            </div>
            <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-white font-black text-lg">No Active Nodes</p>
            <p className="text-white/40 text-sm mt-1">Scan to discover nearby Taal peers</p>
          </div>
          <button
            onClick={startSearch}
            className="px-8 py-3 rounded-2xl font-black text-sm text-white"
            style={{ background: 'var(--primary)' }}
          >
            Initiate Scan
          </button>
        </motion.div>
      )}

      {/* Searching */}
      {status === 'searching' && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="relative w-32 h-32">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                className="absolute inset-0 rounded-full border border-primary"
              />
            ))}
            <div className="absolute inset-0 rounded-full border border-primary/40 flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.08)' }}>
              <Bluetooth size={28} className="text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest animate-pulse">Scanning for nodes...</p>
        </div>
      )}

      {/* Connected */}
      {status === 'connected' && (
        <div className="flex flex-col gap-6">
          {/* Status bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-black text-green-400">Mesh Active</span>
            </div>
            <span className="text-[10px] text-green-400/60 font-bold uppercase tracking-widest">{peers.length} Nodes Connected</span>
          </div>

          {/* Peers */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Connected Nodes</h3>
            {peers.map((peer, i) => (
              <motion.div
                key={peer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="relative flex-shrink-0">
                  <img src={peer.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{peer.name}</p>
                  <p className="text-[10px] text-white/40 truncate mt-0.5">{peer.activeContent} · {peer.distance}</p>
                  {showDiagnostics && (
                    <p className="text-[9px] font-mono mt-1" style={{ color: latencies[peer.id] < 20 ? '#4ade80' : latencies[peer.id] < 40 ? '#facc15' : '#f87171' }}>
                      {latencies[peer.id] ?? peer.latency}ms latency
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => ping(peer)}
                    className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors text-primary hover:bg-primary/20"
                    style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
                  >
                    Ping
                  </button>
                  <button className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    Sync
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Rescan */}
          <button
            onClick={() => { setStatus('idle'); setPeers([]); }}
            className="py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            Disconnect All
          </button>
        </div>
      )}
    </div>
  );
}
