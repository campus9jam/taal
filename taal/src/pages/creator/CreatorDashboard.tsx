import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, DollarSign, Users, Play, TrendingUp, Upload, Megaphone,
  Music, Mic2, BookOpen, Video, ChevronRight, Eye, Heart, Share2,
  Star, Target, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const NAV = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'content', label: 'Content', icon: Music },
  { id: 'promote', label: 'Promote', icon: Megaphone },
  { id: 'audience', label: 'Audience', icon: Users },
];

const CONTENT_ITEMS = [
  { id: 'c1', title: 'Midnight City Remix', type: 'music', plays: 3420, likes: 280, status: 'LIVE', revenue: 12.40 },
  { id: 'c2', title: 'Quantum Deep Ep 45', type: 'podcast', plays: 1890, likes: 145, status: 'LIVE', revenue: 8.20 },
  { id: 'c3', title: 'Desert Whispers Ch1', type: 'story', plays: 542, likes: 67, status: 'PENDING', revenue: 0 },
  { id: 'c4', title: 'Neon Haze Live Set', type: 'concert', plays: 6100, likes: 520, status: 'LIVE', revenue: 48.00 },
];

const PROMO_PACKAGES = [
  { id: 'pr1', name: 'Homepage Boost', desc: 'Featured on home for 24h', price: 4.99, icon: Star, color: '#f97316' },
  { id: 'pr2', name: 'Search Boost', desc: 'Top search result for 48h', price: 2.99, icon: Target, color: '#7C3AED' },
  { id: 'pr3', name: 'Regional Promo', desc: 'Reach users in your region', price: 7.99, icon: Users, color: '#06B6D4' },
  { id: 'pr4', name: 'New Release Push', desc: 'Alert all followers', price: 1.99, icon: Megaphone, color: '#22c55e' },
];

const TYPE_ICONS: Record<string, any> = { music: Music, podcast: Mic2, story: BookOpen, concert: Video };
const TYPE_COLORS: Record<string, string> = { music: '#7C3AED', podcast: '#a855f7', story: '#f97316', concert: '#ec4899' };

function StatCard({ label, value, sub, icon: Icon, color, trend }: any) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '25' }}>
          <Icon size={15} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xl font-black">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-white/30">{sub}</p>}
      </div>
    </div>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
          className="flex-1 rounded-t-sm"
          style={{ background: i === data.length - 1 ? color : color + '60' }}
        />
      ))}
    </div>
  );
}

export default function CreatorDashboard() {
  const [tab, setTab] = useState('overview');
  const [promoActive, setPromoActive] = useState<string | null>(null);

  const weekData = [220, 340, 280, 490, 380, 520, 610];
  const revenueData = [8, 12, 9, 18, 14, 22, 28];

  return (
    <div className="flex flex-col gap-0 min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <p className="text-xs font-black tracking-widest text-white/30 uppercase">Creator Studio</p>
        <h1 className="text-2xl font-black mt-1">Dashboard</h1>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-0 overflow-x-auto px-5 mb-5 pb-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold mr-1 transition-all ${tab === id ? 'primary-bg text-white' : 'glass text-white/50'}`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-28 flex flex-col gap-5">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Plays" value="12.4K" icon={Play} color="#7C3AED" trend={18} />
              <StatCard label="Revenue" value="$68.60" icon={DollarSign} color="#22c55e" trend={24} />
              <StatCard label="Followers" value="342" icon={Users} color="#06B6D4" trend={7} />
              <StatCard label="Likes" value="1,012" icon={Heart} color="#ec4899" trend={12} />
            </div>

            {/* Weekly plays chart */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black tracking-widest text-white/40 uppercase">This Week</p>
                <p className="text-xs font-bold primary-text">+18% vs last week</p>
              </div>
              <MiniChart data={weekData} color="var(--primary)" />
              <div className="flex justify-between mt-2">
                {['M','T','W','T','F','S','S'].map(d => (
                  <span key={d} className="text-[9px] text-white/20 flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>

            {/* Recent content performance */}
            <div>
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Content Performance</p>
              <div className="flex flex-col gap-2">
                {CONTENT_ITEMS.slice(0, 3).map(item => {
                  const Icon = TYPE_ICONS[item.type];
                  const color = TYPE_COLORS[item.type];
                  return (
                    <div key={item.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '25' }}>
                        <Icon size={16} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-[10px] text-white/40 flex items-center gap-1"><Play size={8} />{item.plays.toLocaleString()}</span>
                          <span className="text-[10px] text-white/40 flex items-center gap-1"><Heart size={8} />{item.likes}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-400">${item.revenue.toFixed(2)}</p>
                        <span className={`text-[9px] font-black ${item.status === 'LIVE' ? 'text-green-400' : 'text-yellow-400'}`}>{item.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-4">Play Distribution by Type</p>
              {[
                { type: 'Music', val: 65, color: '#7C3AED' },
                { type: 'Podcast', val: 20, color: '#a855f7' },
                { type: 'Concert', val: 10, color: '#ec4899' },
                { type: 'Story', val: 5, color: '#f97316' },
              ].map(d => (
                <div key={d.type} className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-white/50 w-16">{d.type}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.val}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: d.color }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-8 text-right">{d.val}%</span>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Top Metrics</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Avg Completion Rate', value: '78%', trend: 5 },
                  { label: 'Replay Rate', value: '23%', trend: -2 },
                  { label: 'Offline Plays', value: '1,240', trend: 31 },
                  { label: 'Mesh Shares', value: '89', trend: 44 },
                  { label: 'Playlist Adds', value: '340', trend: 12 },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-sm text-white/70">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{m.value}</span>
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${m.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {m.trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(m.trend)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Revenue (30 Days)</p>
              <MiniChart data={[...revenueData, ...revenueData.slice(0,4)]} color="#22c55e" />
              <div className="flex justify-between mt-3">
                <div>
                  <p className="text-2xl font-black text-green-400">$68.60</p>
                  <p className="text-xs text-white/40">This month</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">$212.40</p>
                  <p className="text-xs text-white/40">All time</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* REVENUE */}
        {tab === 'revenue' && (
          <>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-1">Available Balance</p>
              <p className="text-4xl font-black text-green-400">$68.60</p>
              <p className="text-xs text-white/40 mt-1">Next payout: Jun 15, 2026</p>
              <button className="mt-4 primary-bg rounded-xl px-6 py-2.5 text-sm font-bold text-white w-full">
                Withdraw to Bank
              </button>
            </div>

            <div>
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Revenue Breakdown</p>
              {[
                { label: 'Stream Royalties', value: '$32.10', icon: Play },
                { label: 'Premium Content', value: '$24.50', icon: Star },
                { label: 'Concert Tickets', value: '$8.00', icon: Video },
                { label: 'Tips / Donations', value: '$4.00', icon: Heart },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3 py-3 border-b border-white/5">
                  <r.icon size={16} className="primary-text" />
                  <span className="flex-1 text-sm text-white/70">{r.label}</span>
                  <span className="text-sm font-bold text-green-400">{r.value}</span>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Transaction History</p>
              {[
                { label: 'Payout - May 2026', amount: '-$48.00', date: 'May 15', type: 'out' },
                { label: 'Stream royalties', amount: '+$22.40', date: 'Jun 1', type: 'in' },
                { label: 'Concert ticket sales', amount: '+$8.00', date: 'Jun 2', type: 'in' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${tx.type === 'in' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                    {tx.type === 'in' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{tx.label}</p>
                    <p className="text-[10px] text-white/30">{tx.date}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>{tx.amount}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CONTENT */}
        {tab === 'content' && (
          <div className="flex flex-col gap-3">
            <button className="primary-bg rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-white text-sm">
              <Upload size={16} /> Upload New Content
            </button>
            {CONTENT_ITEMS.map(item => {
              const Icon = TYPE_ICONS[item.type];
              const color = TYPE_COLORS[item.type];
              return (
                <motion.div key={item.id} whileTap={{ scale: 0.98 }} className="glass rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '25' }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.title}</p>
                      <span className={`text-[9px] font-black ${item.status === 'LIVE' ? 'text-green-400' : 'text-yellow-400'}`}>● {item.status}</span>
                    </div>
                    <ChevronRight size={16} className="text-white/20" />
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Play size={10} />{item.plays.toLocaleString()} plays</span>
                    <span className="flex items-center gap-1"><Heart size={10} />{item.likes} likes</span>
                    <span className="flex items-center gap-1 ml-auto text-green-400 font-bold">${item.revenue.toFixed(2)} earned</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PROMOTE */}
        {tab === 'promote' && (
          <>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-1">Promo Budget</p>
              <p className="text-3xl font-black">$15.00</p>
              <p className="text-xs text-white/40">available credits</p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase">Choose a Campaign</p>
              {PROMO_PACKAGES.map(pkg => (
                <motion.div key={pkg.id} whileTap={{ scale: 0.98 }}
                  onClick={() => setPromoActive(promoActive === pkg.id ? null : pkg.id)}
                  className={`glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${promoActive === pkg.id ? 'ring-2 ring-primary/60' : ''}`}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: pkg.color + '25' }}>
                    <pkg.icon size={20} style={{ color: pkg.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{pkg.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{pkg.desc}</p>
                  </div>
                  <p className="text-sm font-black primary-text">${pkg.price}</p>
                </motion.div>
              ))}
              {promoActive && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="primary-bg rounded-2xl py-3.5 text-sm font-bold text-white"
                >
                  Launch Campaign
                </motion.button>
              )}
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Active Campaigns</p>
              <div className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Homepage Boost — Neon Haze Live</p>
                  <p className="text-xs text-white/40">Ends in 6h • 1,240 impressions</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* AUDIENCE */}
        {tab === 'audience' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Followers" value="342" icon={Users} color="#06B6D4" trend={7} />
              <StatCard label="Active Listeners" value="128" icon={Play} color="#7C3AED" trend={14} />
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Top Regions</p>
              {[
                { region: 'Nigeria', pct: 42 },
                { region: 'Ghana', pct: 18 },
                { region: 'Kenya', pct: 15 },
                { region: 'UK', pct: 12 },
                { region: 'Others', pct: 13 },
              ].map(r => (
                <div key={r.region} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-white/50 w-16">{r.region}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${r.pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full primary-bg"
                    />
                  </div>
                  <span className="text-xs text-white/30 w-8 text-right">{r.pct}%</span>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-black tracking-widest text-white/40 uppercase mb-3">Listener Demographics</p>
              {[
                { label: '18–24', pct: 35 },
                { label: '25–34', pct: 40 },
                { label: '35–44', pct: 18 },
                { label: '45+', pct: 7 },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-white/50 w-12">{d.label}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full accent-text" style={{ background: 'var(--accent)' }} />
                  </div>
                  <span className="text-xs text-white/30 w-8 text-right">{d.pct}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
