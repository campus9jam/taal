import React from 'react';
import { NavLink } from 'react-router-dom';
import { Music2, Radio, Search, Download, User } from 'lucide-react';
import { motion } from 'framer-motion';

const LINKS = [
  { to: '/music',   label: 'Music',   icon: Music2    },
  { to: '/radio',   label: 'Radio',   icon: Radio     },
  { to: '/search',  label: 'Search',  icon: Search    },
  { to: '/library', label: 'Library', icon: Download  },
  { to: '/profile', label: 'Profile', icon: User      },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{
        background: 'rgba(2,8,23,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 h-[60px]">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl relative min-w-[56px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.12)' }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'primary-text' : 'text-white/40'}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'primary-text' : 'text-white/30'
                  }`}
                >
                  {label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full primary-bg"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
