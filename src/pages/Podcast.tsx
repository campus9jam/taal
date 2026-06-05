import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic2, Play, Pause, MessageSquare, FileText, ChevronDown, ChevronUp,
  BookOpen, Clock, Search, Sparkles, Download, Share2, Bookmark, X
} from 'lucide-react';
import { usePlayer, MOCK_PODCASTS } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';

function fmt(s?: number) {
  if (!s) return '';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ─── Extended mock data ─── */
const EXTRA_PODCASTS: Track[] = [
  { id: 'p4', title: 'Ep 3: AI & Creativity',    artist: 'Future Minds', artwork: 'https://images.unsplash.com/photo-1535223289429-462dc98c5f27?w=400', url: '', type: 'podcast', duration: 2100, genre: 'AI' },
  { id: 'p5', title: 'Ep 19: Sound as Medicine', artist: 'HeartWave',    artwork: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400', url: '', type: 'podcast', duration: 3000, genre: 'Wellness' },
  { id: 'p6', title: 'Ep 7: The Blockchain Beat', artist: 'CryptoCulture', artwork: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400', url: '', type: 'podcast', duration: 2400, genre: 'Finance' },
];
const ALL_PODCASTS = [...MOCK_PODCASTS, ...EXTRA_PODCASTS];

const AI_INSIGHTS_MAP: Record<string, string[]> = {
  p1: [
    'Explores the simulation hypothesis through a quantum mechanics lens.',
    'Key topics: consciousness, digital reality, emergence theory.',
    'References: Bostrom, Tegmark, Penrose — jumps at 18:40 & 44:10.',
  ],
  p2: [
    'Covers AGI timelines and the role of neural architectures.',
    'Guest discusses GPT-5 implications at 22:15.',
    'Strong episode for anyone interested in cognitive computing.',
  ],
  p3: [
    'Philosophical dive into free will in the age of AI.',
    'Camille argues consciousness is substrate-independent at 31:00.',
    'Key quote: "We are already post-human in our tool use."',
  ],
  p4: ['AI and human creativity are discussed as complementary, not competitive.', 'Covers generative music at 14:20.'],
  p5: ['Uses binaural audio at 05:00. Headphones recommended.', 'Claims measurable anxiety reduction after 20-min sessions.'],
  p6: ['NFT music rights explored at 08:30.', 'Interview with a blockchain music lawyer.'],
};

const BOOKMARKS: Record<string, { time: string; note: string }[]> = {
  p1: [{ time: '12:34', note: 'Simulation argument summary' }, { time: '44:10', note: 'Penrose objection' }],
  p2: [{ time: '22:15', note: 'GPT-5 claim' }],
};

/* ─── Archivist chat responses ─── */
function archivistReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("quantum") || m.includes("simulation"))
    return "Found: Ep 45 at 18:40 - Tegmark simulation argument with quantum branching. Play it?";
  if (m.includes("ai") || m.includes("artificial"))
    return "Ep 12 Digital Minds and Ep 3 AI & Creativity both match. Ep 12 is more technical.";
  if (m.includes("latest") || m.includes("new"))
    return "Latest: Ep 19 Sound as Medicine from HeartWave. Binaural audio - headphones recommended.";
  if (m.includes("bookmark") || m.includes("saved"))
    return "You have 3 bookmarks across 2 episodes. I can jump you directly to any of them.";
  if (m.includes("download"))
    return "I can queue any episode for offline playback. Which one would you like?";
  return "Searching your library for " + msg + "... Found relevant content in multiple episodes. Try: AI, quantum, music rights.";
}

export default function Podcast() {
  const { play, currentTrack, isPlaying, pause, resume } = usePlayer();
  const [expanded,      setExpanded]      = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<'episodes' | 'bookmarks' | 'downloads'>('episodes');
  const [archivistMsg,  setArchivistMsg]  = useState('');
  const [chat,          setChat]          = useState([
    { role: 'ai', text: 'Hi! I\'m your Podcast Archivist. Ask me anything — topics, timestamps, quotes.' },
  ]);
  const [showChat,      setShowChat]      = useState(false);
  const [search,        setSearch]        = useState('');
  const [savedEps,      setSavedEps]      = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!archivistMsg.trim()) return;
    const userMsg = archivistMsg.trim();
    setChat(c => [...c, { role: 'user', text: userMsg }]);
    setArchivistMsg('');
    setTimeout(() => {
      setChat(c => [...c, { role: 'ai', text: archivistReply(userMsg) }]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 600);
  };

  const filtered = ALL_PODCASTS.filter(ep =>
    !search || ep.title.toLowerCase().includes(search.toLowerCase()) ||
    ep.artist.toLowerCase().includes(search.toLowerCase()) ||
    ep.genre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 p-5 pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black">Podcast Archivist</h1>
          <p className="text-sm text-white/40 mt-1">AI-powered discovery · {ALL_PODCASTS.length} episodes</p>
        </div>
        <button onClick={() => setShowChat(v => !v)}
          className={`rounded-xl p-2.5 transition-all ${showChat ? 'primary-bg' : 'glass'}`}>
          <MessageSquare size={20} className={showChat ? 'text-white' : 'primary-text'} />
        </button>
      </div>

      {/* AI Archivist Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="primary-text" />
                <p className="text-xs font-black tracking-widest text-white/40 uppercase">Archivist AI</p>
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
                {chat.map((m, i) => (
                  <div key={i} className={`text-xs p-2.5 rounded-xl max-w-[88%] leading-relaxed ${
                    m.role === 'ai'
                      ? 'glass primary-text self-start'
                      : 'primary-bg text-white self-end'
                  }`}>{m.text}</div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input value={archivistMsg} onChange={e => setArchivistMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about topics, timestamps, guests..."
                  className="flex-1 glass rounded-xl px-3 py-2 text-sm text-white outline-none placeholder-white/30"
                />
                <button onClick={handleSend} className="primary-bg rounded-xl px-4 py-2 text-sm font-bold text-white">Ask</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5">
        <Search size={14} className="text-white/30 flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search episodes, topics, guests..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/30"
        />
        {search && <button onClick={() => setSearch('')}><X size={14} className="text-white/30" /></button>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['episodes', 'bookmarks', 'downloads'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all ${activeTab === t ? 'primary-bg text-white' : 'glass text-white/60'}`}
          >{t}</button>
        ))}
      </div>

      {/* Episodes tab */}
      {activeTab === 'episodes' && (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">No episodes found for "{search}"</div>
          )}
          {filtered.map(ep => {
            const active   = currentTrack?.id === ep.id;
            const isExpand = expanded === ep.id;
            const insights = AI_INSIGHTS_MAP[ep.id] ?? ['No AI insights available yet.'];
            const bmarks   = BOOKMARKS[ep.id] ?? [];
            return (
              <motion.div key={ep.id} className={`glass rounded-2xl overflow-hidden ${active ? 'ring-2 ring-primary/40' : ''}`}>
                {/* Row */}
                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => play(ep, ALL_PODCASTS)}>
                    <img src={ep.artwork} alt="" className="w-full h-full object-cover" />
                    {active && isPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                        {[1,2,3,4,5].map(j => <div key={j} className="w-0.5 rounded-full bg-white waveform-bar" />)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => play(ep, ALL_PODCASTS)}>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{ep.genre}</p>
                    <p className={`text-sm font-semibold mt-0.5 truncate ${active ? 'primary-text' : ''}`}>{ep.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{ep.artist} · {fmt(ep.duration)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setSavedEps(s => { const n = new Set(s); n.has(ep.id) ? n.delete(ep.id) : n.add(ep.id); return n; })}
                      className={savedEps.has(ep.id) ? 'text-yellow-400' : 'text-white/20 hover:text-white/60'}>
                      <Bookmark size={16} fill={savedEps.has(ep.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setExpanded(isExpand ? null : ep.id); }}
                      className="text-white/30 hover:text-white">
                      {isExpand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button onClick={() => active ? (isPlaying ? pause() : resume()) : play(ep, ALL_PODCASTS)}
                      className="w-9 h-9 rounded-full primary-bg flex items-center justify-center">
                      {active && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpand && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-4 flex flex-col gap-4">
                        {/* AI Insights */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={12} className="primary-text" />
                            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">AI Insights</span>
                          </div>
                          {insights.map((ins, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1.5">
                              <div className="w-1 h-1 rounded-full primary-bg mt-1.5 flex-shrink-0" />
                              <p className="text-xs text-white/60">{ins}</p>
                            </div>
                          ))}
                        </div>

                        {/* Bookmarks */}
                        {bmarks.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Bookmark size={12} className="text-yellow-400" />
                              <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Bookmarks</span>
                            </div>
                            {bmarks.map((b, i) => (
                              <div key={i} className="flex items-center gap-3 py-1.5">
                                <span className="text-xs primary-text font-bold w-12">{b.time}</span>
                                <span className="text-xs text-white/60">{b.note}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="flex-1 glass rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 text-white/60">
                            <Download size={12} /> Download
                          </button>
                          <button className="flex-1 glass rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 text-white/60">
                            <Share2 size={12} /> Share
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bookmarks tab */}
      {activeTab === 'bookmarks' && (
        <div className="flex flex-col gap-3">
          {savedEps.size === 0 && Object.keys(BOOKMARKS).length === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">No bookmarks yet.<br/>Expand an episode and bookmark timestamps.</div>
          ) : (
            Object.entries(BOOKMARKS).map(([epId, marks]) => {
              const ep = ALL_PODCASTS.find(e => e.id === epId);
              if (!ep) return null;
              return (
                <div key={epId} className="glass rounded-2xl p-4">
                  <p className="text-sm font-bold mb-2">{ep.title}</p>
                  {marks.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                      <Clock size={12} className="primary-text flex-shrink-0" />
                      <span className="text-xs primary-text font-bold w-10">{b.time}</span>
                      <span className="text-xs text-white/60 flex-1">{b.note}</span>
                      <button onClick={() => play(ep, ALL_PODCASTS)}
                        className="w-6 h-6 rounded-full primary-bg flex items-center justify-center">
                        <Play size={8} fill="white" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Downloads tab */}
      {activeTab === 'downloads' && (
        <div className="flex flex-col gap-3">
          {savedEps.size === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">No downloads yet.<br/>Expand an episode to download it.</div>
          ) : (
            Array.from(savedEps).map(epId => {
              const ep = ALL_PODCASTS.find(e => e.id === epId);
              if (!ep) return null;
              return (
                <div key={epId} className="flex items-center gap-3 p-3 glass rounded-2xl">
                  <img src={ep.artwork} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ep.title}</p>
                    <p className="text-xs text-white/40">{ep.artist} · {fmt(ep.duration)}</p>
                  </div>
                  <Download size={14} className="text-green-400" />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
