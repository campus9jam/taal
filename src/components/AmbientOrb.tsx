import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';

const MOOD_COLORS: Record<string, string[]> = {
  music:   ['#7C3AED', '#06B6D4', '#a855f7'],
  radio:   ['#06B6D4', '#0ea5e9', '#22d3ee'],
  podcast: ['#a855f7', '#7C3AED', '#8b5cf6'],
  story:   ['#f97316', '#fb923c', '#ef4444'],
  concert: ['#ec4899', '#f472b6', '#e879f9'],
  default: ['#7C3AED', '#06B6D4', '#a855f7'],
};

export default function AmbientOrb() {
  const { isPlaying, currentTrack } = usePlayer();
  const controls = useAnimation();
  const colors = MOOD_COLORS[currentTrack?.type ?? 'default'];

  useEffect(() => {
    if (isPlaying) {
      controls.start({
        scale: [1, 1.3, 1.1, 1.4, 1],
        opacity: [0.12, 0.22, 0.15, 0.25, 0.12],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      });
    } else {
      controls.start({ scale: 1, opacity: 0.07, transition: { duration: 1 } });
    }
  }, [isPlaying, currentTrack?.type]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        animate={controls}
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${colors[0]}, ${colors[1]})` }}
      />
      <motion.div
        animate={controls}
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${colors[2]}, ${colors[1]})`,
          animationDelay: '1s',
        }}
      />
    </div>
  );
}
