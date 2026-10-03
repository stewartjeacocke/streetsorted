# Street Sorted frontend

Requires Node.js 26. Install and run:

```bash
npm install
npm run dev
```

Set `VITE_API_ORIGIN` to the backend origin when required. The React application calls only the
project backend; it does not call council services directly. No report or nearby state persists after
refresh or cancellation.
