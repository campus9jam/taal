import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, Pause, ChevronRight, Moon, Sun, Type, Maximize2,
  Minimize2, Volume2, Bookmark, Heart, Share2, Clock, SkipBack, SkipForward
} from 'lucide-react';
import { usePlayer, MOCK_STORIES } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';

/* ─── Extended data ─── */
const EXTRA_STORIES: Track[] = [
  { id: 's3', title: 'Neon Gods',           artist: 'CyberPress',    artwork: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=400', url: '', type: 'story', duration: 6000, genre: 'Cyberpunk' },
  { id: 's4', title: 'The Last Griot',      artist: 'Ubuntu Press',  artwork: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400', url: '', type: 'story', duration: 8100, genre: 'African' },
];
const ALL_STORIES = [...MOCK_STORIES, ...EXTRA_STORIES];

type ChapterMap = Record<string, { title: string; duration: number; synopsis: string }[]>;
const CHAPTERS: ChapterMap = {
  s1: [
    { title: 'Prologue: The Signal',    duration: 600,  synopsis: 'A cryptic signal arrives from deep space.' },
    { title: 'Ch 1: Awakening',         duration: 1200, synopsis: 'Kira decodes the message against orders.' },
    { title: 'Ch 2: The Descent',       duration: 1500, synopsis: 'The team enters the abandoned station.' },
    { title: 'Ch 3: The Last City',     duration: 1800, synopsis: 'What they find changes everything.' },
    { title: 'Epilogue',                duration: 400,  synopsis: 'A door opens.' },
  ],
  s2: [
    { title: 'Pt 1: The Dunes',         duration: 1800, synopsis: 'Traveler crosses the desert alone.' },
    { title: 'Pt 2: Mirage',            duration: 1800, synopsis: 'She hears voices in the wind.' },
    { title: 'Pt 3: The Oasis',         duration: 1800, synopsis: 'The oasis holds a dark secret.' },
  ],
  s3: [
    { title: 'Chapter 1: Upload',       duration: 1500, synopsis: 'Reon uploads his mind to the grid.' },
    { title: 'Chapter 2: The Net',      duration: 2000, synopsis: 'He discovers what the corporates hide.' },
    { title: 'Chapter 3: Breakout',     duration: 2500, synopsis: 'The escape costs everything.' },
  ],
  s4: [
    { title: 'The Elder\'s Voice',      duration: 2700, synopsis: 'A griot carries the last oral history.' },
    { title: 'The Long Walk',           duration: 2700, synopsis: 'Memory and survival intertwine.' },
    { title: 'Home\'s Echo',            duration: 2700, synopsis: 'The final transmission.' },
  ],
};

const EMOTIONS_MAP: Record<string, { label: string; val: number; color: string }[]> = {
  s1: [
    { label: 'Tense',      val: 80, color: '#ef4444' },
    { label: 'Hopeful',    val: 45, color: '#22c55e' },
    { label: 'Mysterious', val: 90, color: '#8b5cf6' },
    { label: 'Melancholy', val: 60, color: '#3b82f6' },
  ],
  s2: [
    { label: 'Calm',       val: 70, color: '#22c55e' },
    { label: 'Eerie',      val: 60, color: '#8b5cf6' },
    { label: 'Longing',    val: 85, color: '#3b82f6' },
    { label: 'Wonder',     val: 55, color: '#f97316' },
  ],
  s3: [
    { label: 'Tense',      val: 90, color: '#ef4444' },
    { label: 'Dark',       val: 75, color: '#6b7280' },
    { label: 'Thrilling',  val: 85, color: '#f97316' },
    { label: 'Hopeful',    val: 30, color: '#22c55e' },
  ],
  s4: [
    { label: 'Nostalgic',  val: 80, color: '#f97316' },
    { label: 'Proud',      val: 70, color: '#eab308' },
    { label: 'Melancholy', val: 65, color: '#3b82f6' },
    { label: 'Moving',     val: 90, color: '#ec4899' },
  ],
};

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}:${sec.toString().padStart(2,'0')}` : `0:${sec.toString().padStart(2,'0')}`;
}

/* ─── Immersive Mode ─── */
function ImmersiveMode({ story, onClose }: { story: Track; onClose: () => void }) {
  const { play, pause, resume, isPlaying, currentTrack, currentTime, duration, seek, prev, next } = usePlayer();
  const active   = currentTrack?.id === story.id;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const chapters = CHAPTERS[story.id] ?? [];
  const [fontSize, setFontSize] = useState(16);
  const [darkBg,   setDarkBg]   = useState(true);

  // Find current chapter
  let elapsed = 0;
  let currentChapterIdx = 0;
  for (let i = 0; i < chapters.length; i++) {
    if (currentTime >= elapsed && currentTime < elapsed + chapters[i].duration) { currentChapterIdx = i; break; }
    elapsed += chapters[i].duration;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: darkBg ? '#050508' : '#f5f0e8' }}
    >
      {/* Ambient artwork bg */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${story.artwork})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px)' }}
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={onClose} className="glass rounded-full p-2">
          <Minimize2 size={18} className={darkBg ? 'text-white/60' : 'text-black/60'} />
        </button>
        <div className="text-center">
          <p className={`text-xs font-black uppercase tracking-widest ${darkBg ? 'text-white/40' : 'text-black/40'}`}>
            {story.genre} · Ch {currentChapterIdx + 1}/{chapters.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDarkBg(v => !v)} className="glass rounded-full p-2">
            {darkBg ? <Sun size={16} className="text-white/60" /> : <Moon size={16} className="text-black/60" />}
          </button>
          <div className="flex gap-1">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="glass rounded-full p-2">
              <Type size={12} className={darkBg ? 'text-white/60' : 'text-black/60'} />
            </button>
            <button onClick={() => setFontSize(s => Math.min(22, s + 2))} className="glass rounded-full p-2">
              <Type size={18} className={darkBg ? 'text-white/60' : 'text-black/60'} />
            </button>
          </div>
        </div>
      </div>

      {/* Chapter content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <motion.div key={currentChapterIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className={`text-xl font-black mb-1 ${darkBg ? 'text-white' : 'text-black'}`}>
            {chapters[currentChapterIdx]?.title ?? story.title}
          </h2>
          <p className={`text-xs uppercase tracking-widest mb-4 ${darkBg ? 'text-white/40' : 'text-black/40'}`}>{story.artist}</p>
          <p className={`leading-relaxed ${darkBg ? 'text-white/70' : 'text-black/70'}`} style={{ fontSize }}>
            {chapters[currentChapterIdx]?.synopsis ?? 'Loading chapter content...'}
          </p>
          {/* Extended narrative placeholder */}
          <p className={`mt-4 leading-relaxed ${darkBg ? 'text-white/50' : 'text-black/50'}`} style={{ fontSize: fontSize - 1 }}>
            The audio narrative continues, weaving sound and silence into a story that transcends the page.
            Every pause carries weight. Every breath, intentional. Sit back, close your eyes, and let the world
            of {story.title} unfold around you.
          </p>
        </motion.div>
      </div>

      {/* Player controls */}
      <div className="relative px-5 pb-10 pt-3 glass-dark">
        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full mb-3 cursor-pointer"
          onClick={e => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * duration);
          }}>
          <div className="h-full primary-bg rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mb-3">
          <span>{fmt(Math.round(currentTime))}</span>
          <span>{fmt(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button onClick={prev} className="text-white/50 hover:text-white">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (!active) play(story, ALL_STORIES);
              else isPlaying ? pause() : resume();
            }}
            className="w-14 h-14 rounded-full primary-bg flex items-center justify-center text-white"
            style={{ boxShadow: '0 0 25px var(--primary)' }}
          >
            {active && isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </motion.button>
          <button onClick={next} className="text-white/50 hover:text-white">
            <SkipForward size={24} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function Stories() {
  const { play, currentTrack, isPlaying, pause, resume } = usePlayer();
  const [immersive,  setImmersive]  = useState<Track | null>(null);
  const [activeTab,  setActiveTab]  = useState<'all' | 'saved'>('all');
  const [saved,      setSaved]      = useState<Set<string>>(new Set());
  const [openStory,  setOpenStory]  = useState<string | null>(null);

  const stories = activeTab === 'all' ? ALL_STORIES : ALL_STORIES.filter(s => saved.has(s.id));

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      {/* Immersive overlay */}
      <AnimatePresence>
        {immersive && <ImmersiveMode story={immersive} onClose={() => setImmersive(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-black">Sonic Stories</h1>
        <p className="text-sm text-white/40 mt-1">Immersive audiobooks · {ALL_STORIES.length} stories</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['all', 'saved'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all ${activeTab === t ? 'primary-bg text-white' : 'glass text-white/60'}`}
          >{t === 'all' ? 'All Stories' : `Saved (${saved.size})`}</button>
        ))}
      </div>

      {/* Story cards */}
      <div className="flex flex-col gap-5">
        {stories.map(story => {
          const active   = currentTrack?.id === story.id;
          const isExpand = openStory === story.id;
          const chapters = CHAPTERS[story.id] ?? [];
          const emotions = EMOTIONS_MAP[story.id] ?? [];

          return (
            <motion.div key={story.id} className="flex flex-col gap-0">
              {/* Hero image */}
              <div className="relative rounded-2xl overflow-hidden">
                <img src={story.artwork} alt="" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="glass-dark rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/70">{story.genre}</span>
                  <span className="glass-dark rounded-full px-2.5 py-0.5 text-[9px] font-black text-white/50">{fmt(story.duration || 0)}</span>
                </div>

                {/* Save button */}
                <button
                  onClick={() => setSaved(s => { const n = new Set(s); n.has(story.id) ? n.delete(story.id) : n.add(story.id); return n; })}
                  className="absolute top-3 right-3 glass-dark rounded-full p-2"
                >
                  <Heart size={16} className={saved.has(story.id) ? 'text-red-400' : 'text-white/50'}
                    fill={saved.has(story.id) ? 'currentColor' : 'none'} />
                </button>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-black">{story.title}</h3>
                  <p className="text-sm text-white/50">{story.artist}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { setImmersive(story); if (!active) play(story, ALL_STORIES); }}
                      className="primary-bg rounded-full px-5 py-2.5 text-sm font-bold text-white flex items-center gap-2"
                    >
                      <Maximize2 size={13} />
                      Immersive Mode
                    </motion.button>
                    <button
                      onClick={() => active ? (isPlaying ? pause() : resume()) : play(story, ALL_STORIES)}
                      className="glass rounded-full px-4 py-2.5 text-xs font-bold text-white/70 flex items-center gap-1.5"
                    >
                      {active && isPlaying ? <><Pause size={12} fill="currentColor"/>Pause</> : <><Play size={12} fill="currentColor"/>Play</>}
                    </button>
                    <button onClick={() => setOpenStory(isExpand ? null : story.id)}
                      className="glass rounded-full p-2.5 text-white/50"
                    >
                      {isExpand ? <ChevronRight size={14} className="-rotate-90" /> : <ChevronRight size={14} className="rotate-90" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded panel */}
              <AnimatePresence>
                {isExpand && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="glass rounded-b-2xl overflow-hidden -mt-1 border-t-0"
                  >
                    <div className="p-4 flex flex-col gap-4">

                      {/* EmotionPulse */}
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">EmotionPulse</p>
                        <div className="flex flex-col gap-2">
                          {emotions.map(e => (
                            <div key={e.label} className="flex items-center gap-3">
                              <span className="text-xs text-white/50 w-20">{e.label}</span>
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }} animate={{ width: `${e.val}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className="h-full rounded-full" style={{ background: e.color }}
                                />
                              </div>
                              <span className="text-[10px] text-white/30 w-8 text-right">{e.val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chapter timeline */}
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">Chapters</p>
                        <div className="flex flex-col gap-1.5">
                          {chapters.map((ch, i) => {
                            // Compute chapter start offset
                            const startOffset = chapters.slice(0, i).reduce((a, c) => a + c.duration, 0);
                            const isCurrent = active && currentTrack?.duration
                              ? false // simplified: just highlight first chapter
                              : i === 0;
                            return (
                              <motion.div key={i} whileTap={{ scale: 0.98 }}
                                onClick={() => { if (!active) play(story, ALL_STORIES); }}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${i === 0 && active ? 'glass border border-primary/30' : 'hover:bg-white/5'}`}
                              >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 && active ? 'primary-bg text-white' : 'glass text-white/40'}`}>
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${i === 0 && active ? 'primary-text' : 'text-white/80'}`}>{ch.title}</p>
                                  <p className="text-[10px] text-white/30 mt-0.5 truncate">{ch.synopsis}</p>
                                </div>
                                <span className="text-[10px] text-white/30 flex-shrink-0">{fmt(ch.duration)}</span>
                                <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
