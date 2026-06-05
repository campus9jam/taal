# /public/audio/

Drop local audio files here. They will be served at /audio/<filename> in production.

Example usage in PlayerContext mock data:
```ts
url: '/audio/my-track.mp3'
```

Files placed here are NOT processed by Vite — they are copied as-is to dist/.
For files you want to import via ES modules (e.g. `import track from './my-track.mp3'`),
place them in src/assets/audio/ instead.
