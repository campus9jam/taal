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
  /** true when this track was imported from the local device */
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
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, Were Dreaming', artwork: MOCK_ARTWORK[0], url: '', type: 'music', duration: 240, genre: 'Electronic' },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', artwork: MOCK_ARTWORK[1], url: '', type: 'music', duration: 200, genre: 'Pop' },
  { id: '3', title: 'Breathe', artist: 'Ambient Collective', album: 'Stillness', artwork: MOCK_ARTWORK[2], url: '', type: 'music', duration: 320, genre: 'Ambient' },
  { id: '4', title: 'Synthwave Dreams', artist: 'Neon Haze', album: 'Retrograde', artwork: MOCK_ARTWORK[3], url: '', type: 'music', duration: 180, genre: 'Synthwave' },
];

export const MOCK_RADIO: Track[] = [
  { id: 'r1', title: 'Midnight Ambient FM', artist: 'Live Radio', artwork: MOCK_ARTWORK[0], url: 'https://streams.ilovemusic.de/iloveradio2.mp3', type: 'radio', genre: 'Ambient' },
  { id: 'r2', title: 'Global Beats 24/7',  artist: 'Live Radio', artwork: MOCK_ARTWORK[1], url: 'https://streams.ilovemusic.de/iloveradio1.mp3', type: 'radio', genre: 'Electronic' },
  { id: 'r3', title: 'Jazz & Soul Radio',  artist: 'Live Radio', artwork: MOCK_ARTWORK[2], url: '', type: 'radio', genre: 'Jazz' },
  { id: 'r4', title: 'Hip Hop Nation',     artist: 'Live Radio', artwork: MOCK_ARTWORK[3], url: '', type: 'radio', genre: 'Hip Hop' },
];

export const MOCK_PODCASTS: Track[] = [
  { id: 'p1', title: 'Ep 45: The Simulation', artist: 'Quantum Deep',  artwork: MOCK_ARTWORK[0], url: '', type: 'podcast', duration: 3600, genre: 'Science' },
  { id: 'p2', title: 'Ep 12: Digital Minds',  artist: 'Tech Talks',    artwork: MOCK_ARTWORK[1], url: '', type: 'podcast', duration: 2700, genre: 'Technology' },
  { id: 'p3', title: 'Ep 8: The Future',      artist: 'Visionaries',   artwork: MOCK_ARTWORK[2], url: '', type: 'podcast', duration: 3200, genre: 'Philosophy' },
];

export const MOCK_STORIES: Track[] = [
  { id: 's1', title: 'The Last City',        artist: 'Luna Press',    artwork: MOCK_ARTWORK[3], url: '', type: 'story', duration: 7200, genre: 'Sci-Fi' },
  { id: 's2', title: 'Desert of Whispers',   artist: 'Odyssey Audio', artwork: MOCK_ARTWORK[0], url: '', type: 'story', duration: 5400, genre: 'Fantasy' },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

/** Update the Media Session API (lock-screen / notification controls) */
function updateMediaSession(track: Track, isPlaying: boolean) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album ?? '',
    artwork: track.artwork
      ? [{ src: track.artwork, sizes: '400x400', type: 'image/jpeg' }]
      : [],
  });
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
}

/** Send a Web Notification (if permission granted) */
function sendNotification(track: Track) {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(`Now Playing on Taal`, {
      body: `${track.title} — ${track.artist}`,
      icon: track.artwork ?? '/icons/icon-192.png',
      tag: 'taal-now-playing',    // replaces previous notification
      silent: true,
    });
  } catch (_) { /* Safari throws on some options */ }
}

/* ─── Context ────────────────────────────────────────────────────────── */
const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef   = useRef<HTMLAudioElement>(new Audio());
  const localUrls  = useRef<Map<string, string>>(new Map()); // id → objectURL
  const sleepRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    notificationsEnabled: Notification.permission === 'granted',
  });

  /* ── Audio element events ─── */
  const handleNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    const audio = audioRef.current;

    // Background audio: prevent the browser from suspending on tab switch
    audio.preload = 'auto';

    const onTimeUpdate = () => {
      setState(s => {
        // A-B loop enforcement
        if (s.abLoop.active && s.abLoop.end !== null && audio.currentTime >= s.abLoop.end) {
          audio.currentTime = s.abLoop.start ?? 0;
        }
        return { ...s, currentTime: audio.currentTime };
      });
    };
    const onLoadedMeta = () => setState(s => ({ ...s, duration: audio.duration || 0 }));
    const onPlay  = () => setState(s => ({ ...s, isPlaying: true }));
    const onPause = () => setState(s => ({ ...s, isPlaying: false }));
    const onEnded = () => handleNextRef.current();

    audio.addEventListener('timeupdate',    onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('play',          onPlay);
    audio.addEventListener('pause',         onPause);
    audio.addEventListener('ended',         onEnded);

    return () => {
      audio.removeEventListener('timeupdate',    onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('play',          onPlay);
      audio.removeEventListener('pause',         onPause);
      audio.removeEventListener('ended',         onEnded);
    };
  }, []);

  /* ── Media Session handlers ─── */
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play',          () => audioRef.current.play().catch(() => {}));
    navigator.mediaSession.setActionHandler('pause',         () => audioRef.current.pause());
    navigator.mediaSession.setActionHandler('nexttrack',     () => handleNextRef.current());
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; }
      else { handleNextRef.current(); } // simplified; full prev is below
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
        setState(s => ({ ...s, currentTime: details.seekTime! }));
      }
    });
  }, []);

  /* ── Play ─── */
  const play = useCallback((track: Track, queue: Track[] = []) => {
    const audio = audioRef.current;

    if (track.url) {
      audio.src = track.url;
      audio.playbackRate = 1; // reset on new track
      audio.play().catch(() => {});
    } else {
      // No URL — still "select" the track (UI shows it) but nothing plays
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

  /* ── Next / Prev ─── */
  const handleNext = useCallback(() => {
    setState(s => {
      if (!s.queue.length) return s;
      const idx   = s.queue.findIndex(t => t.id === s.currentTrack?.id);
      const next  = s.isShuffled
        ? s.queue[Math.floor(Math.random() * s.queue.length)]
        : s.repeatMode === 'all' || idx < s.queue.length - 1
          ? s.queue[(idx + 1) % s.queue.length]
          : s.queue[idx]; // stay at end if no repeat

      if (next && next.id !== s.currentTrack?.id) {
        if (next.url) { audioRef.current.src = next.url; audioRef.current.play().catch(() => {}); }
        updateMediaSession(next, !!next.url);
        sendNotification(next);
        return { ...s, currentTrack: next, isPlaying: !!next.url, currentTime: 0 };
      }
      if (s.repeatMode === 'one') { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
      return s;
    });
  }, []);

  // Keep handleNextRef in sync for MediaSession / ended handler
  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

  const handlePrev = useCallback(() => {
    if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    setState(s => {
      if (!s.queue.length) return s;
      const idx  = s.queue.findIndex(t => t.id === s.currentTrack?.id);
      const prev = s.queue[(idx - 1 + s.queue.length) % s.queue.length];
      if (prev && prev.url) { audioRef.current.src = prev.url; audioRef.current.play().catch(() => {}); }
      if (prev) { updateMediaSession(prev, !!prev.url); sendNotification(prev); }
      return { ...s, currentTrack: prev || s.currentTrack, isPlaying: !!prev?.url, currentTime: 0 };
    });
  }, []);

  /* ── Basic controls ─── */
  const pause  = useCallback(() => audioRef.current.pause(), []);
  const resume = useCallback(() => {
    setState(s => {
      if (s.currentTrack?.url) { audioRef.current.play().catch(() => {}); }
      else { return { ...s, isPlaying: !s.isPlaying }; }
      return s;
    });
  }, []);

  const seek        = useCallback((time: number) => { audioRef.current.currentTime = time; setState(s => ({ ...s, currentTime: time })); }, []);
  const setVolume   = useCallback((v: number)    => { audioRef.current.volume = v;         setState(s => ({ ...s, volume: v })); }, []);
  const toggleMute  = useCallback(() => {
    audioRef.current.muted = !audioRef.current.muted;
    setState(s => ({ ...s, isMuted: !s.isMuted }));
  }, []);
  const toggleShuffle = useCallback(() => setState(s => ({ ...s, isShuffled: !s.isShuffled })), []);
  const cycleRepeat   = useCallback(() => setState(s => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    return { ...s, repeatMode: modes[(modes.indexOf(s.repeatMode) + 1) % 3] };
  }), []);
  const setSpeed = useCallback((speed: number) => {
    audioRef.current.playbackRate = speed;
    setState(s => ({ ...s, playbackSpeed: speed }));
  }, []);
  const toggleFavorite = useCallback(() => setState(s => ({ ...s, isFavorite: !s.isFavorite })), []);
  const setABLoop      = useCallback((type: 'start' | 'end' | 'clear') => {
    setState(s => {
      if (type === 'clear')  return { ...s, abLoop: { start: null, end: null, active: false } };
      if (type === 'start')  return { ...s, abLoop: { ...s.abLoop, start: s.currentTime } };
      if (type === 'end')    return { ...s, abLoop: { ...s.abLoop, end: s.currentTime, active: true } };
      return s;
    });
  }, []);
  const setEQBand = useCallback((index: number, value: number) => {
    setState(s => { const bands = [...s.eqBands]; bands[index] = value; return { ...s, eqBands: bands }; });
  }, []);
  const addToQueue = useCallback((track: Track) => setState(s => ({ ...s, queue: [...s.queue, track] })), []);

  /* ── Sleep timer ─── */
  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepRef.current) { clearTimeout(sleepRef.current); sleepRef.current = null; }
    if (minutes) {
      sleepRef.current = setTimeout(() => {
        audioRef.current.pause();
        setState(s => ({ ...s, isPlaying: false, sleepTimer: null }));
      }, minutes * 60 * 1000);
    }
    setState(s => ({ ...s, sleepTimer: minutes }));
  }, []);

  /* ── Local file import ─── */
  const importLocalFile = useCallback((file: File) => {
    // Revoke old URL for same-name file to avoid memory leaks
    const existingId = `local-${file.name}`;
    if (localUrls.current.has(existingId)) {
      URL.revokeObjectURL(localUrls.current.get(existingId)!);
    }

    const objectUrl = URL.createObjectURL(file);
    localUrls.current.set(existingId, objectUrl);

    // Extract duration from Audio element before adding to queue
    const tmpAudio = new Audio(objectUrl);
    tmpAudio.addEventListener('loadedmetadata', () => {
      const track: Track = {
        id: existingId,
        title: file.name.replace(/\.[^/.]+$/, ''), // strip extension
        artist: 'Local File',
        url: objectUrl,
        type: 'music',
        duration: Math.round(tmpAudio.duration) || undefined,
        isLocal: true,
      };

      setState(s => {
        const queue = [track, ...s.queue.filter(t => t.id !== existingId)];
        return { ...s, queue };
      });

      // Auto-play the imported file
      audioRef.current.src = objectUrl;
      audioRef.current.play().catch(() => {});
      setState(s => ({ ...s, currentTrack: track, isPlaying: true, currentTime: 0, duration: track.duration ?? 0 }));
      updateMediaSession(track, true);
      sendNotification(track);
    });

    // Notify even before metadata loads
    setState(s => ({ ...s }));
  }, []);

  /* ── Notifications ─── */
  const requestNotifications = useCallback(async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setState(s => ({ ...s, notificationsEnabled: perm === 'granted' }));
  }, []);

  /* ── Cleanup object URLs on unmount ─── */
  useEffect(() => {
    return () => {
      localUrls.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <PlayerContext.Provider value={{
      ...state,
      play, pause, resume,
      next: handleNext, prev: handlePrev,
      seek, setVolume, toggleMute, toggleShuffle, cycleRepeat,
      setSpeed, toggleFavorite, setABLoop, setEQBand, setSleepTimer,
      addToQueue, importLocalFile, requestNotifications,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
