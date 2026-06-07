import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Bell, Palette, Volume2, Play, Shield, LogOut, ChevronRight,
  Brain, Clock, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';

const STATS = [
  { label: 'Hours', value: '142' },
  { label: 'Tracks', value: '2.4K' },
  { label: 'Followers', value: '89' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { theme, setTheme, themes } = useTheme();
  const { playbackSpeed, setSpeed } = usePlayer();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  const SECTIONS = [
    { id: 'appearance', label: 'Appearance & Themes', icon: Palette },
    { id: 'audio', label: 'Audio Settings', icon: Volume2 },
    { id: 'playback', label: 'Playback Preferences', icon: Play },
    { id: 'ambient', label: 'Ambient AI', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      {/* Profile card */}
      <div className="pt-2 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl primary-bg flex items-center justify-center text-2xl font-black text-white">
          A
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black">Aminu Rogo</h2>
          <p className="text-sm text-white/40">@aminurogo · Creator</p>
        </div>
        <button className="glass rounded-xl p-2">
          <Settings size={18} className="primary-text" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="glass rounded-2xl p-3 text-center">
            <p className="text-xl font-black primary-text">{s.value}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Styles Gallery CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/styles')}
        className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
      >
        <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
        <Palette size={22} className="text-white" />
        <div className="flex-1 text-left">
          <p className="text-sm font-black text-white">Styles Gallery</p>
          <p className="text-xs text-white/70">12 themes · customize your look</p>
        </div>
        <ArrowRight size={16} className="text-white/70" />
      </motion.button>

      {/* Memory Timeline */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="primary-text" />
          <span className="text-xs font-black tracking-widest text-white/40 uppercase">Memory Timeline</span>
        </div>
        <p className="text-xs text-white/40">This week's mood: <span className="primary-text font-bold">Focused & Ambient</span></p>
        <div className="flex gap-1 mt-3 items-end h-10">
          {[30, 60, 40, 80, 55, 70, 45].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm primary-bg opacity-50"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-[9px] text-white/20 flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>

      {/* Settings sections */}
      <div className="flex flex-col gap-2">
        {SECTIONS.map(sec => (
          <div key={sec.id}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(activeSection === sec.id ? null : sec.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl glass text-left"
            >
              <div className="w-9 h-9 rounded-xl primary-bg/20 flex items-center justify-center">
                <sec.icon size={16} className="primary-text" />
              </div>
              <span className="flex-1 text-sm font-medium">{sec.label}</span>
              <ChevronRight size={16} className={`text-white/30 transition-transform ${activeSection === sec.id ? 'rotate-90' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {activeSection === sec.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass rounded-2xl mt-1 p-4 flex flex-col gap-4 overflow-hidden"
                >
                  {sec.id === 'appearance' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Color Theme</p>
                      <div className="grid grid-cols-5 gap-2">
                        {themes.map(t => (
                          <button key={t.id} onClick={() => setTheme(t.id)} className="flex flex-col items-center gap-1">
                            <div
                              className={`w-10 h-10 rounded-full transition-all ${theme === t.id ? 'ring-2 ring-white scale-110' : ''}`}
                              style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}
                            />
                            <span className="text-[8px] text-white/40 text-center">{t.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.id === 'audio' && (
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'High Quality Streaming', on: true },
                        { label: 'Normalize Volume', on: true },
                        { label: 'Crossfade Tracks', on: false },
                      ].map(opt => (
                        <div key={opt.label} className="flex items-center justify-between">
                          <span className="text-sm">{opt.label}</span>
                          <button className={`w-10 h-5 rounded-full transition-colors ${opt.on ? 'primary-bg' : 'bg-white/10'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${opt.on ? 'translate-x-5' : ''}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.id === 'playback' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-play</span>
                        <button onClick={() => setAutoPlay(v => !v)}
                          className={`w-10 h-5 rounded-full transition-colors ${autoPlay ? 'primary-bg' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${autoPlay ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-white/60">Default Speed</span>
                        <div className="flex gap-2">
                          {[0.75, 1, 1.25, 1.5, 2].map(s => (
                            <button key={s} onClick={() => setSpeed(s)}
                              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${playbackSpeed === s ? 'primary-bg text-white' : 'glass text-white/50'}`}
                            >{s}x</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {sec.id === 'notifications' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Push Notifications</span>
                      <button onClick={() => setNotifications(v => !v)}
                        className={`w-10 h-5 rounded-full transition-colors ${notifications ? 'primary-bg' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${notifications ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  )}

                  {sec.id === 'ambient' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-white/40">AI analyzes your listening patterns to surface insights, mood trends, and personalized recommendations.</p>
                      {[
                        { label: 'Ambient Orb', on: true },
                        { label: 'Mood Tracking', on: true },
                        { label: 'Smart Recommendations', on: true },
                      ].map(opt => (
                        <div key={opt.label} className="flex items-center justify-between">
                          <span className="text-sm">{opt.label}</span>
                          <button className={`w-10 h-5 rounded-full primary-bg`}>
                            <div className="w-4 h-4 rounded-full bg-white mx-0.5 translate-x-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.id === 'privacy' && (
                    <div className="flex flex-col gap-2">
                      {['Two-Factor Auth', 'Private Listening Mode', 'Data Encryption'].map(opt => (
                        <div key={opt} className="flex items-center justify-between py-1">
                          <span className="text-sm">{opt}</span>
                          <button className="w-10 h-5 rounded-full primary-bg">
                            <div className="w-4 h-4 rounded-full bg-white mx-0.5 translate-x-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button className="glass rounded-2xl p-4 flex items-center gap-3 text-red-400 hover:bg-red-400/10 transition-colors">
        <LogOut size={18} />
        <span className="text-sm font-bold">Sign Out</span>
      </button>
    </div>
  );
}
