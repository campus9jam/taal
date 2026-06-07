import React, {
  createContext, useContext, useState, useRef, useEffect, useCallback,
} from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */
export type ContentType = 'music' | 'radio' | 'podcast' | 'story' | 'concert';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  url: string;
  type: ContentType;
  duration?: number;
  genre?: string;
  isLocal?: boolean;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  playbackSpeed: number;
  abLoop: { start: number | null; end: number | null; active: boolean };
  isFavorite: boolean;
  eqBands: number[];
  sleepTimer: number | null;
  notificationsEnabled: boolean;
}

interface PlayerContextType extends PlayerState {
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setSpeed: (s: number) => void;
  toggleFavorite: () => void;
  setABLoop: (type: 'start' | 'end' | 'clear') => void;
  setEQBand: (index: number, value: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  addToQueue: (track: Track) => void;
  importLocalFile: (file: File) => void;
  requestNotifications: () => Promise<void>;
}

/* ─── Mock data ──────────────────────────────────────────────────────── */
const MOCK_ARTWORK = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
];

export const MOCK_TRACKS: Track[] = [
  { id: '1', title: 'Midnight City',    artist: 'M83',                album: 'Hurry Up, Were Dreaming', artwork: MOCK_ARTWORK[0], url: 'https://streams.ilovemusic.de/iloveradio2.mp3', type: 'music', duration: 240, genre: 'Electronic' },
  { id: '2', title: 'Blinding Lights',  artist: 'The Weeknd',         album: 'After Hours',             artwork: MOCK_ARTWORK[1], url: 'https://streams.ilovemusic.de/iloveradio1.mp3', type: 'music', duration: 200, genre: 'Pop' },
  { id: '3', title: 'Breathe',          artist: 'Ambient Collective',  album: 'Stillness',               artwork: MOCK_ARTWORK[2], url: '', type: 'music', duration: 320, genre: 'Ambient' },
  { id: '4', title: 'Synthwave Dreams', artist: 'Neon Haze',           album: 'Retrograde',              artwork: MOCK_ARTWORK[3], url: '', type: 'music', duration: 180, genre: 'Synthwave' },
];

export const MOCK_RADIO: Track[] = [
  { id: 'r1', title: 'Midnight Ambient FM', artist: 'Live Radio', artwork: MOCK_ARTWORK[0], url: 'https://streams.ilovemusic.de/iloveradio2.mp3', type: 'radio', genre: 'Ambient' },
  { id: 'r2', title: 'Global Beats 24/7',   artist: 'Live Radio', artwork: MOCK_ARTWORK[1], url: 'https://streams.ilovemusic.de/iloveradio1.mp3', type: 'radio', genre: 'Electronic' },
  { id: 'r3', title: 'Jazz & Soul Radio',   artist: 'Live Radio', artwork: MOCK_ARTWORK[2], url: '', type: 'radio', genre: 'Jazz' },
  { id: 'r4', title: 'Hip Hop Nation',      artist: 'Live Radio', artwork: MOCK_ARTWORK[3], url: '', type: 'radio', genre: 'Hip Hop' },
];

export const MOCK_PODCASTS: Track[] = [
  { id: 'p1', title: 'Ep 45: The Simulation', artist: 'Quantum Deep', artwork: MOCK_ARTWORK[0], url: 'https://streams.ilovemusic.de/iloveradio2.mp3', type: 'podcast', duration: 3600, genre: 'Science' },
  { id: 'p2', title: 'Ep 12: Digital Minds',  artist: 'Tech Talks',   artwork: MOCK_ARTWORK[1], url: '', type: 'podcast', duration: 2700, genre: 'Technology' },
  { id: 'p3', title: 'Ep 8: The Future',      artist: 'Visionaries',  artwork: MOCK_ARTWORK[2], url: '', type: 'podcast', duration: 3200, genre: 'Philosophy' },
];

export const MOCK_STORIES: Track[] = [
  { id: 's1', title: 'The Last City',      artist: 'Luna Press',    artwork: MOCK_ARTWORK[3], url: '', type: 'story', duration: 7200, genre: 'Sci-Fi' },
  { id: 's2', title: 'Desert of Whispers', artist: 'Odyssey Audio', artwork: MOCK_ARTWORK[0], url: '', type: 'story', duration: 5400, genre: 'Fantasy' },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
function updateMediaSession(track: Track, isPlaying: boolean) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.title,
    artist: track.artist,
    album:  track.album ?? '',
    artwork: track.artwork
      ? [{ src: track.artwork, sizes: '400x400', type: 'image/jpeg' }]
      : [],
  });
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
}

function sendNotification(track: Track) {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification('Now Playing on Taal', {
      body: `${track.title} — ${track.artist}`,
      icon: track.artwork ?? '/icons/icon-192.png',
      tag: 'taal-now-playing',
      silent: true,
    });
  } catch (_) { /* Safari throws on some options */ }
}

/* ─── Context ────────────────────────────────────────────────────────── */
const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef  = useRef<HTMLAudioElement>(new Audio());
  const sleepRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'none',
    playbackSpeed: 1,
    abLoop: { start: null, end: null, active: false },
    isFavorite: false,
    eqBands: [0, 0, 0, 0, 0, 0, 0, 0],
    sleepTimer: null,
    notificationsEnabled: (typeof Notification !== 'undefined') && Notification.permission === 'granted',
  });

  /* ── Keep a stable ref to handleNext so audio 'ended' event can call it ── */
  const handleNextRef = useRef<() => void>(() => {});

  /* ── Audio element events ─── */
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = 'auto';
    audio.volume  = state.volume;

    const onTimeUpdate  = () => {
      setState(s => {
        if (s.abLoop.active && s.abLoop.end !== null && audio.currentTime >= s.abLoop.end) {
          audio.currentTime = s.abLoop.start ?? 0;
        }
        return { ...s, currentTime: audio.currentTime };
      });
    };
    const onLoadedMeta  = () => setState(s => ({ ...s, duration: audio.duration || 0 }));
    const onPlay        = () => setState(s => ({ ...s, isPlaying: true }));
    const onPause       = () => setState(s => ({ ...s, isPlaying: false }));
    const onEnded       = () => handleNextRef.current();
    const onError       = () => setState(s => ({ ...s, isPlaying: false }));

    audio.addEventListener('timeupdate',     onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('play',           onPlay);
    audio.addEventListener('pause',          onPause);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('error',          onError);

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('error',          onError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── MediaSession action handlers ─── */
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play',          () => audioRef.current.play().catch(() => {}));
    navigator.mediaSession.setActionHandler('pause',         () => audioRef.current.pause());
    navigator.mediaSession.setActionHandler('nexttrack',     () => handleNextRef.current());
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; }
      else { handleNextRef.current(); }
    });
    navigator.mediaSession.setActionHandler('seekto', details => {
      if (details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
        setState(s => ({ ...s, currentTime: details.seekTime! }));
      }
    });
  }, []);

  /* ── play ─── */
  const play = useCallback((track: Track, queue: Track[] = []) => {
    const audio = audioRef.current;
    if (track.url) {
      audio.src          = track.url;
      audio.playbackRate = 1;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    setState(s => ({
      ...s,
      currentTrack: track,
      queue: queue.length ? queue : [track],
      isPlaying: !!track.url,
      currentTime: 0,
      duration: track.duration ?? 0,
      isFavorite: false,
    }));
    updateMediaSession(track, !!track.url);
    sendNotification(track);
  }, []);

  /* ── next ─── */
  const handleNext = useCallback(() => {
    setState(s => {
      if (!s.queue.length) return s;
      if (s.repeatMode === 'one') {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        return s;
      }
      const idx  = s.queue.findIndex(t => t.id === s.currentTrack?.id);
      const next = s.isShuffled
        ? s.queue[Math.floor(Math.random() * s.queue.length)]
        : s.queue[(idx + 1) % s.queue.length];
      if (next) {
        if (next.url) { audioRef.current.src = next.url; audioRef.current.play().catch(() => {}); }
        else audioRef.current.pause();
        updateMediaSession(next, !!next.url);
        sendNotification(next);
        return { ...s, currentTrack: next, isPlaying: !!next.url, currentTime: 0, duration: next.duration ?? 0 };
      }
      return s;
    });
  }, []);

  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

  /* ── prev ─── */
  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    setState(s => {
      if (!s.queue.length) return s;
      const idx  = s.queue.findIndex(t => t.id === s.currentTrack?.id);
      const prev = s.queue[Math.max(0, idx - 1)];
      if (prev) {
        if (prev.url) { audio.src = prev.url; audio.play().catch(() => {}); }
        updateMediaSession(prev, !!prev.url);
        return { ...s, currentTrack: prev, isPlaying: !!prev.url, currentTime: 0, duration: prev.duration ?? 0 };
      }
      return s;
    });
  }, []);

  /* ── pause / resume ─── */
  const pause  = useCallback(() => audioRef.current.pause(), []);
  const resume = useCallback(() => audioRef.current.play().catch(() => {}), []);

  /* ── seek ─── */
  const seek = useCallback((time: number) => {
    audioRef.current.currentTime = time;
    setState(s => ({ ...s, currentTime: time }));
  }, []);

  /* ── volume ─── */
  const setVolume  = useCallback((v: number) => {
    audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v, isMuted: v === 0 }));
  }, []);
  const toggleMute = useCallback(() => {
    setState(s => {
      const muted = !s.isMuted;
      audioRef.current.muted = muted;
      return { ...s, isMuted: muted };
    });
  }, []);

  /* ── shuffle / repeat / speed ─── */
  const toggleShuffle = useCallback(() => setState(s => ({ ...s, isShuffled: !s.isShuffled })), []);
  const cycleRepeat   = useCallback(() => setState(s => ({
    ...s,
    repeatMode: s.repeatMode === 'none' ? 'all' : s.repeatMode === 'all' ? 'one' : 'none',
  })), []);
  const setSpeed = useCallback((sp: number) => {
    audioRef.current.playbackRate = sp;
    setState(s => ({ ...s, playbackSpeed: sp }));
  }, []);

  /* ── favorite ─── */
  const toggleFavorite = useCallback(() => setState(s => ({ ...s, isFavorite: !s.isFavorite })), []);

  /* ── A-B loop ─── */
  const setABLoop = useCallback((type: 'start' | 'end' | 'clear') => {
    const time = audioRef.current.currentTime;
    setState(s => {
      if (type === 'clear') return { ...s, abLoop: { start: null, end: null, active: false } };
      if (type === 'start') return { ...s, abLoop: { ...s.abLoop, start: time, active: false } };
      if (type === 'end'   ) return { ...s, abLoop: { ...s.abLoop, end: time, active: s.abLoop.start !== null } };
      return s;
    });
  }, []);

  /* ── EQ ─── */
  const setEQBand = useCallback((index: number, value: number) => {
    setState(s => {
      const bands = [...s.eqBands];
      bands[index] = value;
      return { ...s, eqBands: bands };
    });
  }, []);

  /* ── Sleep timer ─── */
  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepRef.current) clearTimeout(sleepRef.current);
    if (minutes) {
      sleepRef.current = setTimeout(() => {
        audioRef.current.pause();
        setState(s => ({ ...s, sleepTimer: null }));
      }, minutes * 60 * 1000);
    }
    setState(s => ({ ...s, sleepTimer: minutes }));
  }, []);

  /* ── Queue ─── */
  const addToQueue = useCallback((track: Track) => {
    setState(s => ({ ...s, queue: [...s.queue, track] }));
  }, []);

  /* ── Local file import ─── */
  const importLocalFile = useCallback((file: File) => {
    const url     = URL.createObjectURL(file);
    const trackId = `local-${file.name}-${file.size}`;
    const track: Track = {
      id: trackId, title: file.name.replace(/\.[^/.]+$/, ''), artist: 'Local File',
      url, type: 'music', isLocal: true,
    };
    play(track, [track]);
  }, [play]);

  /* ── Notifications ─── */
  const requestNotifications = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setState(s => ({ ...s, notificationsEnabled: result === 'granted' }));
  }, []);

  /* ── next exposed value ─── */
  const next = handleNext;

  const value: PlayerContextType = {
    ...state,
    play, pause, resume, next, prev, seek,
    setVolume, toggleMute, toggleShuffle, cycleRepeat, setSpeed,
    toggleFavorite, setABLoop, setEQBand, setSleepTimer,
    addToQueue, importLocalFile, requestNotifications,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
