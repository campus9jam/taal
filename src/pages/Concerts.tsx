import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Play, Pause, Camera, Users, Download, Ticket, Maximize2,
  Minimize2, Mic, MicOff, Heart, Share2, MessageCircle, X, Volume2,
  Star, Clock, ChevronRight, Zap
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

/* ─── Data ─── */
const CONCERTS = [
  {
    id: 'c1', title: 'Neon Haze Live', artist: 'Neon Haze',
    date: 'Jun 14, 2026', artwork: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    status: 'live', viewers: 4200, price: 'Free',
    description: 'Electrifying synthwave performance live from Lagos',
    audioUrl: 'https://streams.ilovemusic.de/iloveradio2.mp3',
  },
  {
    id: 'c2', title: 'Pulse Festival 2026', artist: 'Various Artists',
    date: 'Jun 28, 2026', artwork: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    status: 'upcoming', viewers: 0, price: '$4.99',
    description: '3-day festival spanning Afrobeat, Electronic & World music',
    audioUrl: '',
  },
  {
    id: 'c3', title: 'M83 Dreamworld Tour', artist: 'M83',
    date: 'May 20, 2026', artwork: 'https://images.unsplash.com/photo-1540039155733-5bb30b4d8d57?w=800',
    status: 'recorded', viewers: 0, price: '$2.99',
    description: 'Full 90-min set from the Dreamworld world tour',
    audioUrl: 'https://streams.ilovemusic.de/iloveradio1.mp3',
  },
];

const ANGLES = ['Main Stage', 'Crowd Cam', 'Artist Close', 'Aerial View', 'Side Stage'];

const LIVE_CHAT = [
  { user: 'user_4k2', msg: '🔥🔥🔥 this is insane', time: '22:04' },
  { user: 'nx_sounds', msg: 'Best set of the year!!', time: '22:05' },
  { user: 'bass_head', msg: 'Drop incoming 👀', time: '22:05' },
  { user: 'ambient_v', msg: 'Crowd mode vibes 💜', time: '22:06' },
];

/* ─── Canvas Arena ─── */
function ConcertCanvas({
  concert, angle, crowdMode, isAudioPlaying
}: {
  concert: typeof CONCERTS[0];
  angle: number;
  crowdMode: boolean;
  isAudioPlaying: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Particle pool
    type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number; };
    const particles: Particle[] = [];
    const addParticle = () => {
      particles.push({
        x: W() * 0.5 + (Math.random() - 0.5) * W() * 0.6,
        y: H() * (0.6 + Math.random() * 0.4),
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 3 + 1),
        life: 1,
        maxLife: 80 + Math.random() * 80,
        size: 1 + Math.random() * 3,
        hue: 260 + Math.random() * 80,
      });
    };

    const draw = (ts: number) => {
      const dt = ts - timeRef.current;
      timeRef.current = ts;
      const t = ts / 1000;

      ctx.clearRect(0, 0, W(), H());

      // ── Background gradient (shifts by angle/crowd) ──
      const hueShift = angle * 20 + (crowdMode ? 30 : 0);
      const grad = ctx.createRadialGradient(W() * 0.5, H() * 0.3, 10, W() * 0.5, H() * 0.3, H());
      grad.addColorStop(0, `hsla(${260 + hueShift}, 80%, 8%, 1)`);
      grad.addColorStop(1, `hsla(${200 + hueShift}, 60%, 3%, 1)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H());

      // ── Stage floor ──
      const floorGrad = ctx.createLinearGradient(0, H() * 0.55, 0, H());
      floorGrad.addColorStop(0, `hsla(${260 + hueShift}, 60%, 12%, 0.9)`);
      floorGrad.addColorStop(1, `hsla(${260 + hueShift}, 40%, 5%, 1)`);
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.moveTo(0, H() * 0.6);
      ctx.lineTo(W(), H() * 0.6);
      ctx.lineTo(W(), H());
      ctx.lineTo(0, H());
      ctx.closePath();
      ctx.fill();

      // ── Laser beams ──
      const beamCount = crowdMode ? 8 : 5;
      for (let i = 0; i < beamCount; i++) {
        const beamAngle = (i / beamCount) * Math.PI * 0.6 - 0.3 * Math.PI + Math.sin(t * 0.5 + i) * 0.2;
        const originX = W() * (0.2 + i / beamCount * 0.6);
        const beamLen = H() * 1.2;
        const alpha = (isAudioPlaying ? 0.6 : 0.2) + Math.sin(t * 2 + i) * 0.2;
        const lGrad = ctx.createLinearGradient(
          originX, H() * 0.55,
          originX + beamLen * Math.cos(beamAngle - Math.PI / 2),
          H() * 0.55 - beamLen * Math.sin(beamAngle)
        );
        lGrad.addColorStop(0, `hsla(${270 + i * 30 + hueShift}, 100%, 70%, ${alpha})`);
        lGrad.addColorStop(1, `hsla(${270 + i * 30 + hueShift}, 100%, 50%, 0)`);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(originX - 2, H() * 0.55);
        ctx.lineTo(originX + 2, H() * 0.55);
        ctx.lineTo(originX + beamLen * Math.cos(beamAngle - Math.PI / 2) + 2, H() * 0.55 - beamLen * Math.sin(beamAngle));
        ctx.lineTo(originX + beamLen * Math.cos(beamAngle - Math.PI / 2) - 2, H() * 0.55 - beamLen * Math.sin(beamAngle));
        ctx.closePath();
        ctx.fillStyle = lGrad;
        ctx.fill();
        ctx.restore();
      }

      // ── Crowd silhouettes ──
      const crowdAlpha = crowdMode ? 0.8 : 0.4;
      ctx.fillStyle = `rgba(0,0,0,${crowdAlpha})`;
      for (let i = 0; i < 30; i++) {
        const cx = (i / 30) * W() + (Math.sin(t * 0.3 + i) * 5);
        const headY = H() * 0.72 - (i % 3 === 0 ? 20 : 10) - (isAudioPlaying ? Math.abs(Math.sin(t * 4 + i)) * 8 : 0);
        const bodyH = H() * 0.28;
        ctx.beginPath();
        // Head
        ctx.arc(cx, headY, 8, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillRect(cx - 5, headY + 8, 10, bodyH);
        // Arms up if crowd mode
        if (crowdMode && isAudioPlaying) {
          const armY = headY + 15 + Math.sin(t * 3 + i) * 10;
          ctx.beginPath();
          ctx.moveTo(cx, headY + 12);
          ctx.lineTo(cx - 15, armY);
          ctx.moveTo(cx, headY + 12);
          ctx.lineTo(cx + 15, armY);
          ctx.strokeStyle = `rgba(0,0,0,${crowdAlpha})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      // ── Floating particles (sparks / confetti) ──
      if (isAudioPlaying && Math.random() < 0.3) addParticle();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.life -= 1 / p.maxLife;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = `hsl(${p.hue}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Stage spotlight ──
      const spX = W() * 0.5 + Math.sin(t * 0.4) * W() * 0.15;
      const spGrad = ctx.createRadialGradient(spX, H() * 0.62, 5, spX, H() * 0.62, 80);
      spGrad.addColorStop(0, `hsla(${280 + hueShift}, 100%, 90%, 0.35)`);
      spGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = spGrad;
      ctx.beginPath();
      ctx.ellipse(spX, H() * 0.62, 80, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Artist silhouette (center stage) ──
      const artX = W() * 0.5 + Math.sin(t * 0.8) * 5;
      const artY = H() * 0.55;
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      // Head
      ctx.beginPath();
      ctx.arc(artX, artY - 30, 14, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillRect(artX - 10, artY - 16, 20, 40);
      // Guitar arm
      ctx.beginPath();
      ctx.moveTo(artX + 10, artY - 10);
      ctx.lineTo(artX + 40, artY + 10 + Math.sin(t * 2) * 5);
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.lineWidth = 5;
      ctx.stroke();

      // ── Angle watermark ──
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(ANGLES[angle].toUpperCase(), 10, 20);
      ctx.restore();

      // ── LIVE badge pulse ──
      if (concert.status === 'live') {
        const pulse = 0.7 + Math.sin(t * 2) * 0.3;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(W() - 14, 14, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [angle, crowdMode, isAudioPlaying, concert.status]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{ height: 220, display: 'block' }}
    />
  );
}

/* ─── Main Component ─── */
export default function Concerts() {
  const [activeAngle,  setActiveAngle]  = useState(0);
  const [crowdMode,    setCrowdMode]    = useState(false);
  const [tickets,      setTickets]      = useState<Set<string>>(new Set());
  const [openConcert,  setOpenConcert]  = useState<string | null>(null);
  const [showChat,     setShowChat]     = useState(false);
  const [chatMsg,      setChatMsg]      = useState('');
  const [chatHistory,  setChatHistory]  = useState(LIVE_CHAT);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [reactions,    setReactions]    = useState<{id:number;emoji:string;x:number}[]>([]);
  const reactionId = useRef(0);

  const { play, pause, resume, isPlaying, currentTrack } = usePlayer();

  const activeConcert = CONCERTS.find(c => c.id === openConcert);
  const isArenaPlaying = !!(currentTrack?.id === openConcert && isPlaying);

  const sendReaction = (emoji: string) => {
    const id = reactionId.current++;
    setReactions(r => [...r, { id, emoji, x: 20 + Math.random() * 60 }]);
    setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2000);
  };

  const handlePlay = (concert: typeof CONCERTS[0]) => {
    if (!concert.audioUrl) return;
    if (currentTrack?.id === concert.id) {
      isPlaying ? pause() : resume();
    } else {
      play({
        id: concert.id, title: concert.title, artist: concert.artist,
        artwork: concert.artwork, url: concert.audioUrl, type: 'concert', duration: undefined,
      }, []);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-black">Photon Concerts</h1>
        <p className="text-sm text-white/40 mt-1">Live virtual arena · multi-angle</p>
      </div>

      {/* Ticket wallet */}
      {tickets.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 flex items-center gap-3"
        >
          <Ticket size={20} className="primary-text" />
          <p className="text-sm font-bold">{tickets.size} ticket{tickets.size > 1 ? 's' : ''} in wallet</p>
          <div className="ml-auto flex gap-1">
            {Array.from(tickets).map(tid => {
              const c = CONCERTS.find(x => x.id === tid);
              return c ? <span key={tid} className="text-[9px] glass rounded-full px-2 py-0.5 text-white/60">{c.title.split(' ')[0]}</span> : null;
            })}
          </div>
        </motion.div>
      )}

      {/* Concert cards */}
      <div className="flex flex-col gap-5">
        {CONCERTS.map(concert => (
          <motion.div key={concert.id} className="glass rounded-2xl overflow-hidden">
            {/* Arena canvas (shows when opened) or artwork */}
            {openConcert === concert.id ? (
              <div className="relative">
                <ConcertCanvas
                  concert={concert}
                  angle={activeAngle}
                  crowdMode={crowdMode}
                  isAudioPlaying={isArenaPlaying}
                />

                {/* Floating reactions */}
                <AnimatePresence>
                  {reactions.map(r => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: -80, scale: 1.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.8 }}
                      className="absolute bottom-4 text-2xl pointer-events-none"
                      style={{ left: `${r.x}%` }}
                    >
                      {r.emoji}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Arena controls overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => handlePlay(concert)}
                    className="w-9 h-9 rounded-full primary-bg flex items-center justify-center flex-shrink-0"
                  >
                    {isArenaPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
                  </button>
                  {['🔥','💜','⚡','🎵'].map(e => (
                    <button key={e} onClick={() => sendReaction(e)}
                      className="text-lg glass rounded-full w-8 h-8 flex items-center justify-center"
                    >{e}</button>
                  ))}
                  <button onClick={() => setShowChat(v => !v)} className="ml-auto glass rounded-full w-8 h-8 flex items-center justify-center">
                    <MessageCircle size={13} className="primary-text" />
                  </button>
                  <button onClick={() => setOpenConcert(null)} className="glass rounded-full w-8 h-8 flex items-center justify-center">
                    <Minimize2 size={13} className="text-white/60" />
                  </button>
                </div>

                {/* Live chat panel */}
                <AnimatePresence>
                  {showChat && (
                    <motion.div
                      initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: '100%' }}
                      className="absolute inset-y-0 right-0 w-48 glass-dark flex flex-col"
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                        <span className="text-[10px] font-black text-white/40 uppercase">Live Chat</span>
                        <button onClick={() => setShowChat(false)}><X size={12} className="text-white/40" /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
                        {chatHistory.map((m, i) => (
                          <div key={i} className="text-[9px]">
                            <span className="primary-text font-bold">{m.user}: </span>
                            <span className="text-white/70">{m.msg}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1 p-2 border-t border-white/5">
                        <input
                          value={chatMsg}
                          onChange={e => setChatMsg(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && chatMsg.trim()) {
                              setChatHistory(h => [...h, { user: 'you', msg: chatMsg, time: new Date().toTimeString().slice(0,5) }]);
                              setChatMsg('');
                            }
                          }}
                          placeholder="Chat..."
                          className="flex-1 glass rounded-lg px-2 py-1 text-[9px] text-white outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative h-44">
                <img src={concert.artwork} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {concert.status === 'live' && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 rounded-full px-3 py-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-black text-white">LIVE</span>
                    <Users size={10} className="text-white/80 ml-1" />
                    <span className="text-xs text-white/80">{concert.viewers.toLocaleString()}</span>
                  </div>
                )}
                {concert.status === 'recorded' && (
                  <div className="absolute top-3 left-3 glass rounded-full px-3 py-1">
                    <span className="text-[9px] font-black text-white/70">RECORDED</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-black">{concert.title}</h3>
                  <p className="text-sm text-white/50">{concert.artist} · {concert.date}</p>
                </div>
              </div>
            )}

            <div className="p-4 flex flex-col gap-3">
              <p className="text-xs text-white/40">{concert.description}</p>

              {/* Camera angle selector */}
              {openConcert === concert.id && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Camera Angle</p>
                  <div className="flex gap-1.5 overflow-x-auto">
                    {ANGLES.map((angle, i) => (
                      <button key={i} onClick={() => setActiveAngle(i)}
                        className={`flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold transition-all ${activeAngle === i ? 'primary-bg text-white' : 'glass text-white/50'}`}
                      >
                        <Camera size={8} />{angle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {concert.status === 'live' && (
                  <>
                    <button onClick={() => setCrowdMode(v => !v)}
                      className={`flex-shrink-0 glass rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all ${crowdMode ? 'primary-bg text-white' : 'text-white/60'}`}
                    >
                      <Users size={13} />{crowdMode ? 'Crowd ON' : 'Crowd Mode'}
                    </button>
                    <button
                      onClick={() => { setOpenConcert(openConcert === concert.id ? null : concert.id); if (openConcert !== concert.id) handlePlay(concert); }}
                      className="flex-1 primary-bg rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2"
                    >
                      {openConcert === concert.id
                        ? (isArenaPlaying ? <><Pause size={14} fill="currentColor"/> Pause</> : <><Play size={14} fill="currentColor"/>Resume</>)
                        : <><Maximize2 size={14}/> Enter Arena</>}
                    </button>
                  </>
                )}
                {concert.status === 'upcoming' && (
                  <button onClick={() => setTickets(t => { const n = new Set(t); n.has(concert.id) ? n.delete(concert.id) : n.add(concert.id); return n; })}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${tickets.has(concert.id) ? 'glass text-green-400' : 'primary-bg text-white'}`}
                  >
                    <Ticket size={14} />
                    {tickets.has(concert.id) ? `✓ Ticket Saved · ${concert.price}` : `Get Ticket · ${concert.price}`}
                  </button>
                )}
                {concert.status === 'recorded' && (
                  <>
                    <button onClick={() => setOpenConcert(openConcert === concert.id ? null : concert.id)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 ${openConcert === concert.id ? 'glass text-white/60' : 'primary-bg text-white'}`}
                    >
                      {openConcert === concert.id ? <><Minimize2 size={14}/> Close</> : <><Play size={14} fill="currentColor"/> Watch</>}
                    </button>
                    <button className="glass rounded-xl py-2.5 px-4 text-sm font-bold text-white/60 flex items-center gap-1.5">
                      <Download size={14}/> Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
