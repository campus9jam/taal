import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Sparkles, Download, Eye, Palette, Zap, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ─── Style data ─── */
type StyleId =
  | 'cosmic' | 'ocean' | 'ember' | 'forest' | 'rose'
  | 'midnight' | 'aurora' | 'neon' | 'desert' | 'void'
  | 'sakura' | 'glacier';

interface Style {
  id: StyleId;
  name: string;
  tagline: string;
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  themeKey?: string; // maps to ThemeContext key
  tags: string[];
  premium: boolean;
  new?: boolean;
  popular?: boolean;
  previewGradient: string;
  patternClass?: string;
}

const STYLES: Style[] = [
  {
    id: 'cosmic', name: 'Cosmic Purple', tagline: 'Deep space vibes',
    primary: '#7C3AED', accent: '#06B6D4', bg: '#0a0a0f', surface: '#111118',
    themeKey: 'default',
    tags: ['Dark', 'Cosmic', 'Classic'], premium: false, popular: true,
    previewGradient: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
  },
  {
    id: 'ocean', name: 'Deep Ocean', tagline: 'Cold & crystalline',
    primary: '#0ea5e9', accent: '#22d3ee', bg: '#020c1a', surface: '#0a1628',
    themeKey: 'ocean',
    tags: ['Dark', 'Blue', 'Chill'], premium: false,
    previewGradient: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
  },
  {
    id: 'ember', name: 'Ember Fire', tagline: 'Warm & bold',
    primary: '#f97316', accent: '#fb923c', bg: '#0f0800', surface: '#1a1000',
    themeKey: 'ember',
    tags: ['Dark', 'Warm', 'Energy'], premium: false,
    previewGradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
  },
  {
    id: 'forest', name: 'Neon Forest', tagline: 'Nature meets neon',
    primary: '#22c55e', accent: '#4ade80', bg: '#020f06', surface: '#061a0a',
    themeKey: 'forest',
    tags: ['Dark', 'Green', 'Nature'], premium: false,
    previewGradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
  },
  {
    id: 'rose', name: 'Rose Bloom', tagline: 'Soft & electric',
    primary: '#ec4899', accent: '#f472b6', bg: '#0f020a', surface: '#1a0511',
    themeKey: 'rose',
    tags: ['Dark', 'Pink', 'Soft'], premium: false,
    previewGradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  },
  {
    id: 'midnight', name: 'Midnight Noir', tagline: 'Pure darkness, no mercy',
    primary: '#a78bfa', accent: '#818cf8', bg: '#000000', surface: '#0a0a0a',
    tags: ['Dark', 'Minimal', 'AMOLED'], premium: true, new: true,
    previewGradient: 'linear-gradient(135deg, #1a1a2e 0%, #a78bfa 100%)',
  },
  {
    id: 'aurora', name: 'Aurora Borealis', tagline: 'Shifting northern lights',
    primary: '#34d399', accent: '#818cf8', bg: '#020617', surface: '#0f172a',
    tags: ['Dark', 'Multi', 'Dynamic'], premium: true, popular: true,
    previewGradient: 'linear-gradient(135deg, #34d399 0%, #818cf8 50%, #ec4899 100%)',
  },
  {
    id: 'neon', name: 'Neon Rave', tagline: 'Loud. Bright. Unstoppable.',
    primary: '#ff0090', accent: '#00ffcc', bg: '#060010', surface: '#10001a',
    tags: ['Dark', 'Neon', 'Party'], premium: true,
    previewGradient: 'linear-gradient(135deg, #ff0090 0%, #00ffcc 100%)',
  },
  {
    id: 'desert', name: 'Desert Sand', tagline: 'Dusty & cinematic',
    primary: '#d97706', accent: '#92400e', bg: '#1c0f00', surface: '#2a1600',
    tags: ['Dark', 'Earthy', 'Chill'], premium: true,
    previewGradient: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
  },
  {
    id: 'void', name: 'The Void', tagline: 'Stripped to nothing',
    primary: '#ffffff', accent: '#888888', bg: '#000000', surface: '#0d0d0d',
    tags: ['Minimal', 'AMOLED', 'Mono'], premium: true, new: true,
    previewGradient: 'linear-gradient(135deg, #222222 0%, #ffffff 100%)',
  },
  {
    id: 'sakura', name: 'Sakura Dream', tagline: 'Soft pink twilight',
    primary: '#fb7185', accent: '#fda4af', bg: '#0d0108', surface: '#1a020d',
    tags: ['Dark', 'Pink', 'Soft'], premium: true,
    previewGradient: 'linear-gradient(135deg, #fb7185 0%, #fda4af 100%)',
  },
  {
    id: 'glacier', name: 'Glacier Ice', tagline: 'Arctic cold precision',
    primary: '#67e8f9', accent: '#a5f3fc', bg: '#000d14', surface: '#001a26',
    tags: ['Dark', 'Blue', 'Premium'], premium: true, new: true,
    previewGradient: 'linear-gradient(135deg, #67e8f9 0%, #a5f3fc 100%)',
  },
];

const ALL_TAGS = ['All', 'Dark', 'Minimal', 'Warm', 'Blue', 'Pink', 'Green', 'Neon', 'AMOLED'];

/* ─── Sub-components ─── */
function StyleCard({
  style,
  active,
  installed,
  onInstall,
  onPreview,
}: {
  style: Style;
  active: boolean;
  installed: boolean;
  onInstall: () => void;
  onPreview: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.97 }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer ${active ? 'ring-2 ring-white' : ''}`}
    >
      {/* Gradient preview */}
      <div
        className="h-28 w-full relative"
        style={{ background: style.previewGradient }}
        onClick={onPreview}
      >
        {/* Mock mini-player inside preview */}
        <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-black/40 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{ background: style.primary }} />
          <div className="flex-1">
            <div className="h-1.5 rounded-full w-3/4 bg-white/60 mb-1" />
            <div className="h-1 rounded-full w-1/2 bg-white/30" />
          </div>
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: style.primary }}>
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-white ml-0.5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {style.new && (
            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-green-400 text-black uppercase tracking-wider">New</span>
          )}
          {style.popular && (
            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-yellow-400 text-black uppercase tracking-wider">Popular</span>
          )}
        </div>

        {/* Lock / active */}
        <div className="absolute top-2 right-2">
          {active ? (
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <Check size={12} className="text-black" />
            </div>
          ) : style.premium && !installed ? (
            <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Lock size={11} className="text-white/70" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 glass">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-black truncate">{style.name}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{style.tagline}</p>
          </div>
          <button
            onClick={onInstall}
            className="flex-shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black transition-all"
            style={active
              ? { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
              : { background: style.primary + '25', color: style.primary }
            }
          >
            {active ? 'ON' : installed ? 'Apply' : style.premium ? 'Get' : 'Apply'}
          </button>
        </div>

        {/* Color dots */}
        <div className="flex gap-1.5 mt-2">
          {[style.primary, style.accent, style.bg === '#000000' ? '#111' : style.bg].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PreviewModal({ style, onClose, onApply }: { style: Style; onClose: () => void; onApply: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: style.bg }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: style.primary }} />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-3xl opacity-15"
          style={{ background: style.accent }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-14 pb-4">
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm font-bold">← Back</button>
        <p className="text-xs font-black tracking-widest text-white/40 uppercase">Preview</p>
        <div className="w-16" />
      </div>

      {/* Mock UI */}
      <div className="flex-1 px-5 overflow-y-auto relative">
        {/* Mock wheel */}
        <div className="flex items-center justify-center py-8">
          <div className="relative w-44 h-44">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute rounded-full border-2 border-white/5" style={{ inset: '10%' }} />
            <div className="absolute rounded-full pulse-glow" style={{ inset: '35%', background: `radial-gradient(circle, ${style.primary}, #000)` }} />
            {['Music', 'Radio', 'Story', 'Mesh', 'Cast'].map((label, i) => {
              const angle = (i / 5) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const r = 60;
              const x = 88 + r * Math.cos(rad) - 20;
              const y = 88 + r * Math.sin(rad) - 10;
              return (
                <div key={label}
                  className="absolute rounded-lg flex items-center justify-center text-[8px] font-black"
                  style={{ left: x, top: y, width: 40, height: 20, background: style.primary + '30', color: style.primary, border: `1px solid ${style.primary}30` }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock mini player */}
        <div className="rounded-2xl px-4 py-3 mb-3 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.07)` }}
        >
          <div className="w-10 h-10 rounded-xl" style={{ background: style.previewGradient }} />
          <div className="flex-1">
            <div className="h-2 rounded w-3/4 mb-1.5" style={{ background: 'rgba(255,255,255,0.6)' }} />
            <div className="h-1.5 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.2)' }} />
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: style.primary }}>
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[9px] border-l-white ml-0.5" />
          </div>
        </div>

        {/* Mock track rows */}
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="w-9 h-9 rounded-lg" style={{ background: style.primary + (i === 1 ? '60' : '30') }} />
            <div className="flex-1">
              <div className="h-2 rounded mb-1" style={{ background: 'rgba(255,255,255,0.5)', width: `${55 + i * 10}%` }} />
              <div className="h-1.5 rounded" style={{ background: 'rgba(255,255,255,0.2)', width: '40%' }} />
            </div>
            {i === 1 && (
              <div className="flex gap-0.5 items-end h-4">
                {[1,2,3].map(j => <div key={j} className="w-0.5 rounded-full waveform-bar" style={{ background: style.primary }} />)}
              </div>
            )}
          </div>
        ))}

        {/* Tag pills */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {style.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold rounded-full px-3 py-1"
              style={{ background: style.primary + '20', color: style.primary }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Apply button */}
      <div className="relative px-5 pb-10 pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onApply}
          className="w-full rounded-2xl py-4 text-white font-black text-base flex items-center justify-center gap-2"
          style={{ background: style.primary, boxShadow: `0 0 30px ${style.primary}60` }}
        >
          <Sparkles size={18} />
          Apply "{style.name}"
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function StylesGallery() {
  const { theme, setTheme } = useTheme();
  const [filter, setFilter] = useState('All');
  const [installed, setInstalled] = useState<Set<StyleId>>(new Set(['cosmic', 'ocean', 'ember', 'forest', 'rose']));
  const [previewing, setPreviewing] = useState<Style | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const currentStyle = STYLES.find(s => s.themeKey === theme || (theme === 'default' && s.id === 'cosmic')) ?? STYLES[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const applyStyle = (style: Style) => {
    if (style.themeKey) {
      setTheme(style.themeKey as any);
      showToast(`✓ ${style.name} applied`);
    } else if (style.premium && !installed.has(style.id)) {
      showToast('Premium style — tap Get to unlock');
    } else {
      showToast(`✓ ${style.name} applied`);
    }
    setPreviewing(null);
  };

  const installStyle = (style: Style) => {
    if (style.premium && !installed.has(style.id)) {
      setInstalled(s => new Set([...s, style.id]));
      showToast(`Unlocked: ${style.name}`);
    } else {
      applyStyle(style);
    }
  };

  const filtered = filter === 'All'
    ? STYLES
    : STYLES.filter(s => s.tags.includes(filter));

  const free = filtered.filter(s => !s.premium);
  const premium = filtered.filter(s => s.premium);

  return (
    <div className="flex flex-col gap-0 pb-safe">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 glass-dark rounded-full px-5 py-2.5 text-xs font-bold whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {previewing && (
          <PreviewModal
            style={previewing}
            onClose={() => setPreviewing(null)}
            onApply={() => applyStyle(previewing)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={18} className="primary-text" />
          <p className="text-xs font-black tracking-widest text-white/40 uppercase">Styles Gallery</p>
        </div>
        <h1 className="text-2xl font-black">Make it yours</h1>
        <p className="text-sm text-white/40 mt-1">Choose a visual style for your Taal experience</p>
      </div>

      {/* Active style banner */}
      <div className="mx-5 mb-5">
        <div
          className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
          style={{ background: currentStyle.previewGradient }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="relative flex-1">
            <p className="text-xs font-black text-white/70 uppercase tracking-widest">Active Style</p>
            <p className="text-base font-black text-white">{currentStyle.name}</p>
          </div>
          <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
        </div>
      </div>

      {/* Filter tags */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-2 mb-2">
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filter === tag ? 'primary-bg text-white' : 'glass text-white/60'}`}
          >{tag}</button>
        ))}
      </div>

      {/* Free styles */}
      {free.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Download size={12} className="primary-text" />
            <p className="text-xs font-black tracking-widest text-white/40 uppercase">Free ({free.length})</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {free.map(style => (
              <StyleCard
                key={style.id}
                style={style}
                active={currentStyle.id === style.id}
                installed={installed.has(style.id)}
                onInstall={() => installStyle(style)}
                onPreview={() => setPreviewing(style)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Premium styles */}
      {premium.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={12} className="text-yellow-400" />
            <p className="text-xs font-black tracking-widest text-white/40 uppercase">Premium ({premium.length})</p>
            <span className="ml-auto text-[10px] text-yellow-400 font-bold glass rounded-full px-2 py-0.5">Tap to unlock</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {premium.map(style => (
              <StyleCard
                key={style.id}
                style={style}
                active={currentStyle.id === style.id}
                installed={installed.has(style.id)}
                onInstall={() => installStyle(style)}
                onPreview={() => setPreviewing(style)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Coming soon */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={12} className="text-white/30" />
          <p className="text-xs font-black tracking-widest text-white/20 uppercase">Coming Soon</p>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
          {['Custom gradient builder', 'Import from image', 'Community styles', 'Seasonal drops'].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-sm text-white/30">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
