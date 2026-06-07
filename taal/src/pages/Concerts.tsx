import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Play, Users, Sparkles, MapPin, Share2, MessageSquare, Camera, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const UPCOMING = [
  {
    id: 'c1',
    artist: 'M83',
    title: 'Midnight City Live',
    date: 'Jun 14, 2026',
    venue: 'Lagos Arena',
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=250&fit=crop',
    viewers: 4521,
    color: '#3B82F6',
  },
  {
    id: 'c2',
    artist: 'Archivist',
    title: 'Quantum Sessions',
    date: 'Jun 21, 2026',
    venue: 'Resonance Hub',
    img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=250&fit=crop',
    viewers: 1820,
    color: '#8B5CF6',
  },
  {
    id: 'c3',
    artist: 'Neon Haze',
    title: 'Retrograde Arena',
    date: 'Jul 4, 2026',
    venue: 'Virtual Dome',
    img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=250&fit=crop',
    viewers: 3200,
    color: '#EC4899',
  },
];

const CHAT_INIT = [
  { user: 'User_4k2', text: 'this angle is insane' },
  { user: 'ZionR',    text: 'photon visuals ftw 🔥'  },
  { user: 'Alpha',    text: 'waiting for the drop'   },
];

/* ─── Live arena view ─── */
function LiveArena({ onExit }: { onExit: () => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x: -1000, y: -1000 });
  const [showChat,    setShowChat]    = useState(true);
  const [chatMsg,     setChatMsg]     = useState('');
  const [messages,    setMessages]    = useState(CHAT_INIT);
  const [activeAngle, setActiveAngle] = useState(1);

  /* Particle canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width  = canvas.parentElement?.clientWidth  ?? window.innerWidth;
    let h = canvas.height = canvas.parentElement?.clientHeight ?? 400;

    const onResize = () => {
      w = canvas.width  = canvas.parentElement?.clientWidth  ?? window.innerWidth;
      h = canvas.height = canvas.parentElement?.clientHeight ?? 400;
    };
    window.addEventListener('resize', onResize);

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -0.5 - Math.random() * 2,
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? 'rgba(56,189,248,0.8)' : 'rgba(186,230,253,0.5)',
      friction: 0.9 + Math.random() * 0.05,
    }));

    let raf: number;
    const render = () => {
      raf = requestAnimationFrame(render);
      ctx.clearRect(0, 0, w, h);
      const { x: mx, y: my } = mouseRef.current;

      particles.forEach(p => {
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - dist) * 0.02;
          p.vx -= Math.cos(angle) * force;
          p.vy -= Math.sin(angle) * force;
        }

        p.x += p.vx; p.y += p.vy;
        p.vx *= p.friction; p.vy *= p.friction;
        p.vy -= 0.05;
        if (p.y < 0)            { p.y = h; p.x = Math.random() * w; p.vy = -0.5 - Math.random() * 2; }
        if (p.x < 0 || p.x > w) { p.vx *= -1; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15; ctx.shadowColor = 'blue';
        ctx.fill();
      });
    };
    render();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [activeAngle]);

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { user: 'You', text: chatMsg }]);
    setChatMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div
        className="relative flex-1 bg-zinc-950 overflow-hidden"
        onMouseMove={e => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }}
        onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000 }; }}
        onTouchMove={e => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) mouseRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }}
        onTouchEnd={() => { mouseRef.current = { x: -1000, y: -1000 }; }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen opacity-90 z-20" />
        <img
          src={`https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&h=1000&fit=crop`}
          alt="Live"
          className="absolute inset-0 w-full h-full object-cover opacity-40 z-10 scale-105"
          key={activeAngle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10 pointer-events-none" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-5 z-30 flex items-center justify-between">
          <button onClick={onExit} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white/70 hover:text-white transition-all">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
              LIVE
            </div>
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10 flex items-center gap-1.5">
              <Users size={12} className="text-white/40" /> 4,521
            </div>
          </div>
        </div>

        {/* Camera angles */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-3 z-30">
          {[1, 2, 3].map(a => (
            <button
              key={a}
              onClick={() => setActiveAngle(a)}
              className={cn(
                'w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 border backdrop-blur-md transition-all font-black',
                activeAngle === a ? 'bg-white text-black border-white' : 'bg-black/40 text-white/40 border-white/10',
              )}
            >
              <Camera size={16} />
              <span className="text-[7px] uppercase tracking-widest">CAM {a}</span>
            </button>
          ))}
        </div>

        {/* Chat toggle */}
        <div className="absolute bottom-6 right-5 z-30">
          <button
            onClick={() => setShowChat(v => !v)}
            className={cn('p-4 rounded-2xl backdrop-blur-md transition-all', showChat ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-black/40 text-white border border-white/10')}
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-0 left-0 w-full sm:w-80 h-72 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex flex-col justify-end p-5"
            >
              <div className="flex-1 overflow-y-auto mb-3 flex flex-col gap-2" style={{ scrollbarWidth: 'none' }}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">{msg.user}</span>
                    <p className="text-sm text-white/90 font-medium bg-white/5 backdrop-blur-sm self-start px-3 py-1.5 rounded-xl rounded-tl-none border border-white/5">{msg.text}</p>
                  </motion.div>
                ))}
              </div>
              <form onSubmit={sendChat} className="flex items-center gap-2">
                <input
                  type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                  placeholder="Send a vibe..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary/40"
                />
                <button type="submit" className="p-2.5 rounded-xl text-black" style={{ background: 'var(--primary)' }}>
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Main concerts page ─── */
export default function Concerts() {
  const [isLive, setIsLive] = useState(false);

  if (isLive) return <LiveArena onExit={() => setIsLive(false)} />;

  return (
    <div className="flex flex-col gap-8 pb-32 px-5 pt-5">
      <header className="flex flex-col gap-1">
        <h2
          className="text-[32px] font-normal tracking-tighter uppercase text-primary"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          Concerts
        </h2>
        <p className="text-white/40 text-xs tracking-widest font-black uppercase">Live Arena · Virtual Nodes</p>
      </header>

      {/* Go Live CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsLive(true)}
        className="relative overflow-hidden rounded-[32px] p-6 flex items-center gap-5 text-left"
        style={{ background: 'linear-gradient(135deg, #1a0a2e, #0a1628)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-30" style={{ background: 'var(--primary)' }} />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Live Now</p>
          <h3 className="text-xl font-black text-white">Enter Arena Mode</h3>
          <p className="text-xs text-white/50 mt-0.5">Interactive concert with real-time visuals</p>
        </div>
        <Play size={22} className="text-white ml-auto flex-shrink-0" />
      </motion.button>

      {/* Upcoming concerts */}
      <section className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Upcoming Events</h3>
        <div className="flex flex-col gap-4">
          {UPCOMING.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative rounded-[28px] overflow-hidden group cursor-pointer"
              onClick={() => setIsLive(true)}
            >
              <div className="h-44 relative">
                <img src={event.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: event.color }}>{event.artist}</p>
                  <h4 className="text-lg font-black text-white leading-tight">{event.title}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[9px] text-white/50 font-bold">
                      <MapPin size={10} /> {event.venue}
                    </span>
                    <span className="text-[9px] text-white/50 font-bold">{event.date}</span>
                    <span className="flex items-center gap-1 text-[9px] text-white/50 font-bold">
                      <Users size={10} /> {event.viewers.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={e => e.stopPropagation()} className="p-2.5 rounded-xl bg-white/10 text-white/60 hover:text-white transition-colors">
                    <Share2 size={16} />
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white"
                    style={{ background: event.color }}>
                    <Ticket size={14} /> RSVP
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
