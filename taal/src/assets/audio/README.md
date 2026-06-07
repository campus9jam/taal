# src/assets/audio/

Audio files here are processed by Vite and importable as URL strings:

```ts
import myTrack from '@/assets/audio/my-track.mp3';
// myTrack === '/assets/audio/my-track-[hash].mp3'

play({ url: myTrack, ... })
```

Vite will hash the filename and put it in dist/assets/audio/.
