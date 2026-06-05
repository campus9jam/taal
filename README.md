# Taal — Cross-Platform Audio Ecosystem

> Music · Radio · Podcasts · Stories · Mesh P2P · Virtual Concerts

## Stack
- **React 19** + **TypeScript** + **Vite 8**
- **Framer Motion** — animations
- **Tailwind CSS v4** — styling
- **React Router v7** — navigation
- **MediaSession API** — lock-screen / notification controls
- **Web Notifications API** — now-playing alerts
- **Canvas API** — Concert Arena renderer
- **Service Worker** — PWA / offline shell

## Features

| Module | What's built |
|--------|-------------|
| 🎵 Music | Track list, genre filter, context menu, shuffle, favorites |
| 📻 Radio | Live streams, categories, Radio Timeline |
| 🎙 Podcast | AI Archivist chat, search, bookmarks, offline downloads |
| 📖 Stories | Immersive mode (full-screen reader+player), EmotionPulse, chapter timeline |
| 🌐 Mesh | Radar canvas scanner, peer pairing, P2P file transfer simulation, send tracks |
| 🎤 Concerts | HTML Canvas arena (lasers, crowd, particles), multi-angle camera, live chat, reactions |
| 🎨 Styles | 12 themes (5 free, 7 premium), full-screen preview, filter by tags |
| 📂 Local Import | Drag-and-drop / file picker → auto-play + MediaSession |
| 🔔 Notifications | Web Notifications API, now-playing alerts |
| 🔊 Background Audio | MediaSession API, Service Worker, lock-screen controls |
| 📱 PWA | Manifest, installable, offline shell |

## Run locally

```bash
tar -xzf taal-v5.tar.gz
cd taal
npm install
npm run dev
```

## Deploy to Vercel

### Option A — Connect repo (recommended)
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Done — CI/CD is automatic on every push to `main`

### Option B — GitHub Actions CI/CD
Add these secrets to your GitHub repo → Settings → Secrets:

| Secret | Where to get it |
|--------|----------------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after `vercel link` |

Then every push to `main` auto-deploys to production.
PRs get preview deployments automatically.

## Project structure

```
src/
  pages/
    Home.tsx          # Taal Wheel + Discovery Engine
    Music.tsx         # Universal Music player
    Radio.tsx         # Live radio streams
    Podcast.tsx       # AI Archivist + episode viewer
    Stories.tsx       # Audiobooks + immersive reader
    Mesh.tsx          # P2P network + file transfer
    Concerts.tsx      # Canvas arena + live chat
    StylesGallery.tsx # 12 visual themes
    Library.tsx       # Favorites, local files, playlists, history
    Upload.tsx        # Local import + publish flow
    Profile.tsx       # Settings, themes, creator link
  components/
    TaalWheel.tsx     # Interactive navigation wheel
    MiniPlayer.tsx    # Persistent bottom player bar
    FullPlayer.tsx    # Expanded player (EQ, A-B loop, queue)
    AmbientOrb.tsx    # Animated background orb
    DiscoveryEngine.tsx # AI recommendations + trending
    BottomNav.tsx     # Tab navigation
  context/
    PlayerContext.tsx # Audio engine + MediaSession + Notifications
    ThemeContext.tsx  # Theme switcher
```
