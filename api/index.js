/**
 * Vercel serverless handler: forwards all /api/* requests to the Express app.
 * Restores full path from __path query (rewrite sends /api/:path* -> /api?__path=:path*).
 * Set env vars (DATABASE_URL, ADMIN_API_KEY, ORIGIN) in Vercel project settings.
 */
import app from '../backend/index.js';

export default function handler(req, res) {
  const pathSegments = req.query?.__path;
  if (pathSegments !== undefined) {
    const pathStr = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    req.url = '/api' + (pathStr ? '/' + pathStr : '');
    delete req.query.__path;
  }
  return app(req, res);
}
