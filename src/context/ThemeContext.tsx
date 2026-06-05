import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'default' | 'ocean' | 'ember' | 'forest' | 'rose';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: { id: Theme; label: string; primary: string; accent: string }[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const THEMES = [
  { id: 'default' as Theme, label: 'Cosmic Purple', primary: '#7C3AED', accent: '#06B6D4' },
  { id: 'ocean' as Theme, label: 'Deep Ocean', primary: '#0ea5e9', accent: '#22d3ee' },
  { id: 'ember' as Theme, label: 'Ember Fire', primary: '#f97316', accent: '#fb923c' },
  { id: 'forest' as Theme, label: 'Neon Forest', primary: '#22c55e', accent: '#4ade80' },
  { id: 'rose' as Theme, label: 'Rose Bloom', primary: '#ec4899', accent: '#f472b6' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default');

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t === 'default' ? '' : t;
    localStorage.setItem('taal-theme', t);
  };

  useEffect(() => {
    const saved = localStorage.getItem('taal-theme') as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
