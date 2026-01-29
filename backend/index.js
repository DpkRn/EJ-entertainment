import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { adminAuth } from './middleware/adminAuth.js';
import CategoryRoute from './routes/CategoryRoute.js';
import VisitorRoute from './routes/VisitorRoute.js';
import LinkRoute from './routes/LinkRoute.js';
import PreviewRoute from './routes/PreviewRoute.js';
import AdminCategoryRoute from './routes/AdminCategoryRoute.js';
import AdminLinkRoute from './routes/AdminLinkRoute.js';
import AdminVisitorRoute from './routes/AdminVisitorRoute.js';

const app = express();
const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

connectDB();

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

// Visitor verify + session (public)
app.use('/api/visitor', VisitorRoute);

// Public API (read-only for app)
app.use('/api/categories', CategoryRoute);
app.use('/api/links', LinkRoute);
app.use('/api/preview', PreviewRoute);

// Admin API (full CRUD) – protected by API key (no device tracking)
const adminRouter = express.Router();
adminRouter.use(adminAuth);
adminRouter.use('/categories', AdminCategoryRoute);
adminRouter.use('/links', AdminLinkRoute);
adminRouter.use('/visitors', AdminVisitorRoute);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
