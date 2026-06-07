import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, Radio, BookOpen, Heart, Activity, Sparkles, Bell, Music, Zap } from 'lucide-react';
import { TaalWheel } from '@/components/TaalWheel';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { usePlayer, MOCK_TRACKS, MOCK_RADIO } from '@/context/PlayerContext';

const DISCOVERY = [
  { vibe: 'Trending', title: 'Midnight City',   subtitle: 'M83 • Electronic',    category: 'music' },
  { vibe: 'New Drop',  title: 'Quantum Dreams',  subtitle: 'Archivist • Ambient', category: 'music' },
  { vibe: 'Live Now',  title: 'Neon Horizon FM', subtitle: 'Broadcasting Now',    category: 'radio' },
  { vibe: 'Featured',  title: 'The Last City',   subtitle: 'Chapter 3 • Sci-Fi',  category: 'story' },
];

const RECENT_ACTIVITY = [
  { title: 'Midnight City',   meta: 'M83 • Resonance Ambient',  icon: Heart,    type: 'Resonated' },
  { title: 'The Simulation',  meta: 'Ep 45 • Quantum Deep',      icon: Mic2,     type: 'Podcast'   },
  { title: 'Neon Horizon FM', meta: 'Broadcasting Now',          icon: Radio,    type: 'Radio'     },
  { title: 'The Last City',   meta: 'Chapter 3: The Descent',    icon: BookOpen, type: 'Story'     },
];

const EcosystemCard = ({
  label, description, count, color, icon: Icon,
}: {
  label: string; description: string; count: string;
  color: 'primary' | 'accent' | 'green'; icon?: React.ElementType;
}) => (
  <motion.div
    whileTap={{ scale: 0.97 }}
    className="p-5 rounded-3xl glass-morphism flex flex-col gap-3 group cursor-pointer relative overflow-hidden"
  >
    <div className={cn(
      'absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40',
      color === 'primary' ? 'bg-primary' : color === 'accent' ? 'bg-accent' : 'bg-green-500',
    )} />
    <div className="relative flex flex-col gap-1">
      {Icon && <Icon size={16} className={cn(
        color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : 'text-green-400',
      )} />}
      <h4 className="text-sm font-bold tracking-tight text-white mt-1">{label}</h4>
      <p className="text-[10px] text-white/40 font-medium">{description}</p>
      <div className={cn(
        'text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full w-fit mt-2 bg-white/5',
        color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : 'text-green-400',
      )}>
        {count}
      </div>
    </div>
  </motion.div>
);

const ActivityItem = ({
  title, meta, icon: Icon, type,
}: {
  title: string; meta: string; icon: React.ElementType; type: string;
}) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="flex items-center gap-4 p-4 rounded-2xl glass-morphism hover:bg-white/5 transition-all group cursor-pointer"
  >
    <div className="w-12 h-12 rounded-2xl glass-morphism flex items-center justify-center text-white/30 group-hover:text-primary transition-colors flex-shrink-0">
      <Icon size={22} strokeWidth={1.5} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold truncate tracking-tight text-white">{title}</h4>
      <p className="text-[10px] text-white/30 truncate mt-0.5">{meta}</p>
    </div>
    <div className="text-[9px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary/50 transition-colors flex-shrink-0">
      {type}
    </div>
  </motion.div>
);

export default function Home() {
  const { play } = usePlayer();
  const [isSmartMixing, setIsSmartMixing] = useState(false);

  const launchSmartMix = () => {
    setIsSmartMixing(true);
    play(MOCK_TRACKS[0], MOCK_TRACKS);
    setTimeout(() => setIsSmartMixing(false), 1200);
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Your Universe</h1>
          <p className="text-white/40 text-sm font-medium tracking-tight">C9 TAAL • Resonance Active</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/upload"
            className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center hover:bg-white/10 transition-colors relative"
          >
            <Bell size={20} className="text-white/40" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </Link>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Activity size={20} className="text-primary" />
          </Link>
        </div>
      </header>

      {/* Wheel */}
      <section className="py-6 flex items-center justify-center">
        <TaalWheel />
      </section>

      {/* Ecosystem Pulse */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Ecosystem Pulse</h3>
          <button
            onClick={() => play(MOCK_RADIO[0], MOCK_RADIO as any)}
            className="flex items-center gap-1 text-[10px] font-bold tracking-widest hover:translate-x-1 transition-transform text-primary"
          >
            <span>EXPLORE DEEP</span>
            <Sparkles size={10} />
          </button>
        </div>

        {/* Horizontal discovery */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {DISCOVERY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => play(MOCK_TRACKS[i % MOCK_TRACKS.length], MOCK_TRACKS)}
              className="min-w-[190px] p-5 rounded-3xl glass-morphism relative overflow-hidden group cursor-pointer flex-shrink-0"
            >
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-60 transition-opacity">
                {item.category === 'music' ? <Music size={14} /> : item.category === 'radio' ? <Radio size={14} /> : <BookOpen size={14} />}
              </div>
              <span className="text-[8px] font-black tracking-widest uppercase text-primary">{item.vibe}</span>
              <h4 className="text-sm font-bold mt-1 text-white truncate">{item.title}</h4>
              <p className="text-[10px] text-white/40 truncate mt-0.5">{item.subtitle}</p>
              <button className="mt-4 w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors bg-white/5 hover:bg-primary/20">
                Listen Now
              </button>
            </motion.div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={launchSmartMix} disabled={isSmartMixing} className="text-left w-full">
            <EcosystemCard
              label="Acoustic AI"
              description={isSmartMixing ? 'Synthesizing...' : 'Smart Mix Engine'}
              count={isSmartMixing ? '--' : 'READY'}
              color="primary"
              icon={Zap}
            />
          </button>
          <Link to="/styles">
            <EcosystemCard label="Ambient AI" description="Emotional Visualizer" count="Synced" color="primary" />
          </Link>
          <Link to="/mesh">
            <EcosystemCard label="Mesh Network" description="Nearby Nodes" count="Live" color="accent" />
          </Link>
          <Link to="/library">
            <EcosystemCard label="Repository" description="Storage Health" count="Optimized" color="green" />
          </Link>
        </div>
      </section>

      {/* Resonance Feed */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Your Resonance Feed</h3>
          <Link to="/library" className="text-[9px] font-black uppercase text-primary">View All</Link>
        </div>
        <div className="flex flex-col gap-3">
          {RECENT_ACTIVITY.map((item, i) => (
            <ActivityItem key={i} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}
