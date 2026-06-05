import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, User, Music, Download, Radio, Signal, CheckCircle, X,
  Zap, Globe, Link2, Link, Bluetooth, Share2, ArrowRight, RefreshCw
} from 'lucide-react';
import { usePlayer, MOCK_TRACKS } from '../context/PlayerContext';

/* ─── Types ─── */
type PeerStatus = 'scanning' | 'discovered' | 'pairing' | 'paired' | 'failed';
type TransferState = 'idle' | 'queued' | 'transferring' | 'done' | 'error';

interface Peer {
  id: string; name: string; distance: string; status: PeerStatus;
  tracks: number; color: string; signal: number; method: 'wifi' | 'bluetooth';
}

interface SharedTrack {
  id: string; title: string; peer: string; type: string; size: string; color: string;
  url?: string;
}

/* ─── Mock data ─── */
const PEER_TEMPLATES: Omit<Peer, 'status'>[] = [
  { id: 'p1', name: 'user_4k2',   distance: '2m',  tracks: 12, color: '#7C3AED', signal: 95, method: 'wifi' },
  { id: 'p2', name: 'nx_sounds',  distance: '5m',  tracks: 8,  color: '#06B6D4', signal: 78, method: 'wifi' },
  { id: 'p3', name: 'bass_head',  distance: '8m',  tracks: 24, color: '#22c55e', signal: 62, method: 'bluetooth' },
  { id: 'p4', name: 'ambient_v',  distance: '15m', tracks: 5,  color: '#f97316', signal: 40, method: 'bluetooth' },
];

const SHARED_TRACKS: SharedTrack[] = [
  { id: 'st1', title: 'Synthwave Dreams',  peer: 'p1', type: 'music', size: '8.2 MB',  color: '#7C3AED', url: '' },
  { id: 'st2', title: 'Desert Vibes EP',   peer: 'p1', type: 'music', size: '24 MB',   color: '#7C3AED', url: '' },
  { id: 'st3', title: 'Deep Space Radio',  peer: 'p2', type: 'radio', size: 'Stream',  color: '#06B6D4', url: 'https://streams.ilovemusic.de/iloveradio2.mp3' },
  { id: 'st4', title: 'Midnight Ambient',  peer: 'p3', type: 'music', size: '12.4 MB', color: '#22c55e', url: '' },
  { id: 'st5', title: 'Quantum Deep Ep45', peer: 'p2', type: 'podcast', size: '41 MB', color: '#06B6D4', url: '' },
];

/* ─── Radar Canvas ─── */
function RadarCanvas({ peers, active }: { peers: Peer[]; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const S = 200;
    canvas.width = S; canvas.height = S;
    const cx = S / 2, cy = S / 2;
    let angle = 0;

    const discovered = peers.filter(p => p.status === 'discovered' || p.status === 'paired' || p.status === 'pairing');

    const draw = () => {
      ctx.clearRect(0, 0, S, S);

      // BG
      ctx.fillStyle = 'rgba(10,10,20,0.95)';
      ctx.beginPath(); ctx.arc(cx, cy, S / 2, 0, Math.PI * 2); ctx.fill();

      if (!active) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OFFLINE', cx, cy + 4);
        return;
      }

      // Rings
      [40, 70, 90].forEach((r, i) => {
        ctx.strokeStyle = `rgba(124,58,237,${0.15 + i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      });

      // Sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(0, 0, 90, 0);
      grad.addColorStop(0, 'rgba(124,58,237,0.6)');
      grad.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 90, -0.3, 0.3);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
      angle += 0.04;

      // Peer blips
      discovered.forEach((peer, i) => {
        const bAngle = (i / PEER_TEMPLATES.length) * Math.PI * 2 - Math.PI / 4;
        const dist = peer.signal > 70 ? 35 : peer.signal > 40 ? 60 : 82;
        const bx = cx + Math.cos(bAngle) * dist;
        const by = cy + Math.sin(bAngle) * dist;
        const pulse = (Math.sin(Date.now() * 0.003 + i) + 1) / 2;

        // Ping circle
        ctx.beginPath();
        ctx.arc(bx, by, 8 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = peer.color + '30';
        ctx.fill();

        // Blip
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fillStyle = peer.status === 'paired' ? '#22c55e' : peer.color;
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(peer.name, bx, by - 8);
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#7C3AED';
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [peers, active]);

  return <canvas ref={canvasRef} style={{ width: 200, height: 200, borderRadius: '50%', display: 'block' }} />;
}

/* ─── Main ─── */
export default function Mesh() {
  const { play } = usePlayer();

  const [peers,        setPeers]        = useState<Peer[]>([]);
  const [scanning,     setScanning]     = useState(false);
  const [meshActive,   setMeshActive]   = useState(false);
  const [pairing,      setPairing]      = useState<string | null>(null);
  const [transfers,    setTransfers]    = useState<Record<string, { state: TransferState; progress: number; speed: string }>>({});
  const [sendTarget,   setSendTarget]   = useState<string | null>(null);
  const [sentCount,    setSentCount]    = useState(0);
  const transferTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Scan */
  const handleScan = () => {
    setScanning(true);
    setPeers([]);
    setTimeout(() => {
      setPeers(PEER_TEMPLATES.map(p => ({ ...p, status: 'discovered' as PeerStatus })));
      setMeshActive(true);
      setScanning(false);
    }, 3000);
  };

  /* Pair with a peer */
  const handlePair = (peerId: string) => {
    if (pairing) return;
    setPairing(peerId);
    setPeers(ps => ps.map(p => p.id === peerId ? { ...p, status: 'pairing' } : p));
    setTimeout(() => {
      setPeers(ps => ps.map(p => p.id === peerId ? { ...p, status: 'paired' } : p));
      setPairing(null);
    }, 2000);
  };

  const handleUnpair = (peerId: string) => {
    setPeers(ps => ps.map(p => p.id === peerId ? { ...p, status: 'discovered' } : p));
  };

  /* Start transfer */
  const startTransfer = (trackId: string) => {
    setTransfers(t => ({ ...t, [trackId]: { state: 'transferring', progress: 0, speed: '0 MB/s' } }));
  };

  /* Progress ticker */
  useEffect(() => {
    const running = Object.entries(transfers).some(([, v]) => v.state === 'transferring');
    if (!running) return;
    const iv = setInterval(() => {
      setTransfers(prev => {
        const next = { ...prev };
        let changed = false;
        for (const [id, tr] of Object.entries(next)) {
          if (tr.state === 'transferring') {
            const inc = 8 + Math.random() * 12;
            const newProg = Math.min(tr.progress + inc, 100);
            const speed = `${(2 + Math.random() * 3).toFixed(1)} MB/s`;
            next[id] = { state: newProg >= 100 ? 'done' : 'transferring', progress: newProg, speed };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 200);
    return () => clearInterval(iv);
  }, [transfers]);

  /* Send own track to peer */
  const sendTrackToPeer = (trackId: string, peerId: string) => {
    setSendTarget(null);
    const key = `send-${trackId}-${peerId}`;
    setTransfers(t => ({ ...t, [key]: { state: 'transferring', progress: 0, speed: '0 MB/s' } }));
    setSentCount(c => c + 1);
  };

  const pairedPeers = peers.filter(p => p.status === 'paired');

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-black">Taal Mesh</h1>
        <p className="text-sm text-white/40 mt-1">P2P local audio network</p>
      </div>

      {/* Status bar */}
      <div className="glass rounded-2xl p-3 flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meshActive ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
        <span className="text-sm font-bold flex-1">
          {meshActive ? `Mesh Active · ${peers.length} peers · ${pairedPeers.length} paired` : 'Mesh Offline'}
        </span>
        {sentCount > 0 && <span className="text-xs text-green-400 font-bold">{sentCount} sent</span>}
        {meshActive && <Globe size={14} className="text-green-400" />}
      </div>

      {/* Radar + Scan */}
      <div className="flex flex-col items-center gap-4">
        <RadarCanvas peers={peers} active={meshActive} />

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleScan}
          disabled={scanning}
          className={`flex items-center gap-3 rounded-2xl px-8 py-3 text-sm font-black ${scanning ? 'glass text-white/60' : 'primary-bg text-white'}`}
        >
          {scanning
            ? <><RefreshCw size={16} className="animate-spin" /> Scanning...</>
            : <><Wifi size={16} /> {meshActive ? 'Re-scan' : 'Discover Peers'}</>}
        </motion.button>
        <p className="text-xs text-white/30">WiFi Direct · Bluetooth · Nearby Share</p>
      </div>

      {/* Peer list */}
      <AnimatePresence>
        {meshActive && peers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">Nearby Peers</p>
            <div className="flex flex-col gap-2">
              {peers.map((peer, i) => (
                <motion.div
                  key={peer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl glass transition-all ${peer.status === 'paired' ? 'ring-2 ring-green-500/40' : ''}`}
                >
                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: peer.color + '30' }}>
                    <User size={18} style={{ color: peer.color }} />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black flex items-center justify-center ${
                      peer.status === 'paired' ? 'bg-green-400' :
                      peer.status === 'pairing' ? 'bg-yellow-400' : 'bg-white/20'
                    }`}>
                      {peer.method === 'bluetooth'
                        ? <Bluetooth size={6} className="text-black" />
                        : <Wifi size={6} className="text-black" />}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{peer.name}</p>
                    <p className="text-xs text-white/40">{peer.tracks} tracks · {peer.distance}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Signal size={9} className={peer.signal > 70 ? 'text-green-400' : peer.signal > 40 ? 'text-yellow-400' : 'text-red-400'} />
                      <span className="text-[9px] text-white/30">{peer.signal}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 items-end">
                    {peer.status === 'discovered' && (
                      <button onClick={() => handlePair(peer.id)}
                        className="primary-bg rounded-lg px-3 py-1.5 text-[10px] font-black text-white flex items-center gap-1"
                      ><Link size={9}/> Pair</button>
                    )}
                    {peer.status === 'pairing' && (
                      <span className="glass rounded-lg px-3 py-1.5 text-[10px] font-black text-yellow-400 flex items-center gap-1">
                        <RefreshCw size={9} className="animate-spin" /> Pairing...
                      </span>
                    )}
                    {peer.status === 'paired' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => setSendTarget(peer.id)}
                          className="glass rounded-lg px-2.5 py-1.5 text-[10px] font-black text-green-400 flex items-center gap-1">
                          <Share2 size={9}/> Send
                        </button>
                        <button onClick={() => handleUnpair(peer.id)}
                          className="glass rounded-lg px-2 py-1.5 text-[10px] font-black text-white/30">
                          <X size={9}/>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send track modal */}
      <AnimatePresence>
        {sendTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-end"
            onClick={e => { if (e.target === e.currentTarget) setSendTarget(null); }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full glass-dark rounded-t-3xl p-5 pb-10"
            >
              <p className="text-sm font-black mb-4 text-center">Send to {peers.find(p => p.id === sendTarget)?.name}</p>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {MOCK_TRACKS.map(track => (
                  <button key={track.id}
                    onClick={() => sendTrackToPeer(track.id, sendTarget!)}
                    className="flex items-center gap-3 p-3 glass rounded-xl text-left"
                  >
                    <img src={track.artwork} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-white/40">{track.artist}</p>
                    </div>
                    <ArrowRight size={14} className="primary-text" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mesh Hub — incoming content */}
      <AnimatePresence>
        {meshActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">Mesh Hub — Available</p>
            <div className="flex flex-col gap-2">
              {SHARED_TRACKS.filter(t => peers.some(p => p.id === t.peer)).map(track => {
                const tf = transfers[track.id];
                const sourcePeer = peers.find(p => p.id === track.peer);
                return (
                  <motion.div key={track.id} className="glass rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: track.color + '25' }}>
                        {track.type === 'radio'
                          ? <Radio size={15} style={{ color: track.color }} />
                          : <Music size={15} style={{ color: track.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <p className="text-xs text-white/40">{sourcePeer?.name} · {track.size}</p>
                      </div>

                      {/* State indicator */}
                      {!tf && (
                        <button onClick={() => startTransfer(track.id)}
                          className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white flex-shrink-0"
                        ><Download size={14} /></button>
                      )}
                      {tf?.state === 'done' && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle size={18} className="text-green-400" />
                          <button onClick={() => { if (track.url) play({ id: track.id, title: track.title, artist: sourcePeer?.name ?? '', url: track.url, type: 'radio', artwork: '' }, []); }}
                            className="w-7 h-7 rounded-full primary-bg flex items-center justify-center">
                            <Music size={10} className="text-white" />
                          </button>
                        </div>
                      )}
                      {tf?.state === 'transferring' && (
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                            <circle cx="16" cy="16" r="12" fill="none" stroke="var(--primary)" strokeWidth="3"
                              strokeDasharray={`${2 * Math.PI * 12}`}
                              strokeDashoffset={`${2 * Math.PI * 12 * (1 - tf.progress / 100)}`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 0.2s' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black primary-text">
                            {Math.round(tf.progress)}
                          </span>
                        </div>
                      )}
                    </div>

                    {tf?.state === 'transferring' && (
                      <div className="px-3 pb-3">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full primary-bg transition-all duration-200"
                            style={{ width: `${tf.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                          <Zap size={8} className="primary-text" /> {tf.speed} via WiFi Direct
                        </p>
                      </div>
                    )}
                    {tf?.state === 'done' && (
                      <div className="px-3 pb-2">
                        <p className="text-[10px] text-green-400 flex items-center gap-1">
                          <CheckCircle size={8} /> Saved to Downloads
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!meshActive && (
        <div className="flex flex-col items-center gap-3 py-10 text-white/30">
          <Wifi size={48} strokeWidth={1} />
          <p className="text-sm text-center">Tap "Discover Peers" to start the Mesh network</p>
          <p className="text-xs text-center text-white/20">Works with WiFi Direct, Bluetooth & Nearby Share</p>
        </div>
      )}
    </div>
  );
}
