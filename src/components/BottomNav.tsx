import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Upload, Library, User } from 'lucide-react';
import { motion } from 'framer-motion';

const LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-dark" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-2 h-16">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl primary-bg opacity-10"
                  />
                )}
                <Icon size={20} className={isActive ? 'primary-text' : 'text-white/40'} />
                <span className={`text-[10px] font-bold ${isActive ? 'primary-text' : 'text-white/30'}`}>{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
