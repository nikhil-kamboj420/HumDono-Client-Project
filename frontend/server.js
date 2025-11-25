// /frontend/server.js
// Minimal, robust static server for production builds (Express + Node ESM)
//
// Requirements:
//  - Node >= 18+ (you already have Node 20 in Railway logs)
//  - Install express in frontend: `cd frontend && npm install express`
//  - package.json "start": "node server.js"
//  - Build the frontend first (vite build -> creates dist/)

import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 4173;
const distPath = path.join(process.cwd(), 'dist');

// Simple logger
function log(...args) {
  console.log('[frontend-server]', ...args);
}

// Health endpoint (useful for Railway checks)
app.get('/health', (req, res) => res.status(200).send('ok'));

// If dist exists, serve static files
if (fs.existsSync(distPath)) {
  log('Serving static assets from', distPath);

  // Cache static assets aggressively (add Cache-Control headers)
  app.use(express.static(distPath, {
    maxAge: '1d', // static assets cache for 1 day (adjust if needed)
    setHeaders: (res, filePath) => {
      // Serve html files without aggressive caching
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // API routes should be handled by your frontend if proxied
  // Otherwise, if backend is separate, frontend will call backend domain directly.

  // SPA fallback: serve index.html for non-API routes.
  // Using app.use fallback avoids path-to-regexp '*' parsing issues.
  app.use((req, res, next) => {
    // If request looks like an API call, skip (so backend can handle it)
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) return next();

    const indexHtml = path.join(distPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      res.status(500).send('index.html not found');
    }
  });
} else {
  // dist missing: don't crash — expose health and explain
  log('WARNING: dist folder not found at', distPath);
  app.get('/', (req, res) => {
    res.status(200).send('Frontend build not found. Run `npm run build` and deploy the dist folder.');
  });
}

// Start server
app.listen(PORT, () => {
  log(`Static server listening on port ${PORT}`);
});
