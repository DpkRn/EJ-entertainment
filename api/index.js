/**
 * Vercel serverless handler: forwards all /api/* requests to the Express app.
 * Set env vars (DATABASE_URL, ADMIN_API_KEY, ORIGIN) in Vercel project settings.
 */
import app from '../backend/index.js';

export default app;
