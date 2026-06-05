import React from 'react';
import { motion } from 'framer-motion';
import { Mic2, Radio, BookOpen, Heart, Activity, Sparkles, Bell } from 'lucide-react';
import TaalWheel from '../components/TaalWheel';
import { Link } from 'react-router-dom';

/* ─── Helpers ─── */
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ─── Sub-components ─── */
const EcosystemCard = ({ label, description, count, color }: {
  label: string; description: string; count: string; color: 'primary' | 'green';
}) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="p-5 rounded-3xl glass-morphism flex flex-col gap-4 group cursor-pointer relative overflow-hidden"
  >
    <div className={cn(
      "absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
      color === 'primary' ? 'bg-primary' : 'bg-green-500'
    )} />
    <div className="flex flex-col">
      <h4 className="text-base font-bold tracking-tight">{label}</h4>
      <p className="text-xs text-white/40 font-medium mb-4">{description}</p>
      <div className={cn(
        "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full w-fit bg-white/5",
        color === 'primary' ? 'text-primary' : 'text-green-500'
      )}>
        {count}
      </div>
    </div>
  </motion.div>
);

const ActivityItem = ({ title, meta, icon: Icon, type }: {
  title: string; meta: string; icon: React.ElementType; type: string;
}) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="flex items-center gap-4 p-4 rounded-2xl glass-morphism hover:bg-white/5 transition-all group cursor-pointer"
  >
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold truncate tracking-tight">{title}</h4>
      <p className="text-xs text-white/30 truncate">{meta}</p>
    </div>
    <div className="text-[9px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary/40 transition-colors">
      {type}
    </div>
  </motion.div>
);

const recentActivity = [
  { title: "Midnight City",    meta: "M83 • Resonance Ambient",       icon: Heart,    type: "Resonated" },
  { title: "The Simulation",   meta: "Ep 45 • Quantum Deep",           icon: Mic2,     type: "Podcast"   },
  { title: "Neon Horizon FM",  meta: "Broadcasting Now",               icon: Radio,    type: "Radio"     },
  { title: "The Last City",    meta: "Chapter 3: The Descent",         icon: BookOpen, type: "Story"     },
];

/* ─── Home ─── */
const Home = () => {
  return (
    <div className="flex flex-col gap-10 pb-40 px-5 pt-5">

      {/* Header Context */}
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
            to="/search"
            className="w-10 h-10 rounded-full glass-morphism flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Activity size={20} className="text-primary" />
          </Link>
        </div>
      </header>

      {/* The Central Hub (The Wheel) */}
      <section className="flex items-center justify-center overflow-hidden -mx-5">
        {/* Scale the 720px wheel down to fit the mobile viewport */}
        <div
          className="origin-center"
          style={{ transform: 'scale(0.46)', width: 720, height: 720, marginTop: -195, marginBottom: -195 }}
        >
          <TaalWheel />
        </div>
      </section>

      {/* Ecosystem Pulse Grid */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Ecosystem Pulse</h3>
          <button className="flex items-center gap-1 text-[10px] text-primary font-bold tracking-widest hover:translate-x-1 transition-transform">
            <span>EXPLORE DEEP</span>
            <Sparkles size={10} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <EcosystemCard label="Ambient AI"    description="Emotional Visualizer" count="Synced"    color="primary" />
          <EcosystemCard label="Mesh Network" description="Nearby Hubs"          count="4 Active"  color="green"   />
        </div>
      </section>

      {/* Resonance Feed */}
      <section className="flex flex-col gap-5">
        <h3 className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Resonance Feed</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <ActivityItem key={i} {...activity} />
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
