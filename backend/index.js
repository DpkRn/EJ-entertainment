import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import visitorRoutes from './routes/visitorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

connectDB();

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

// Return 503 until MongoDB is connected (avoids 500 on cold start)
app.use('/api/visitor', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connecting. Please retry in a moment.' });
  }
  next();
});
app.use('/api/admin', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connecting. Please retry in a moment.' });
  }
  next();
});

// Visitor API: auth, categories (read), links (read + view/like/reply), preview
app.use('/api/visitor', visitorRoutes);

// Admin API: categories, links, visitors (full CRUD) – protected by API key
app.use('/api/admin', adminRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// On Vercel, the app is imported by api/ and must not listen; Vercel runs it as serverless.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
