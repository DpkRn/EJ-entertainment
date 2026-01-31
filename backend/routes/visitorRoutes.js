import express from 'express';
import { verify, me } from '../controller/visitor/VisitorController.js';
import { getCategories, getCategoryById } from '../controller/visitor/CategoryController.js';
import {
  getLinksByCategory,
  incrementView,
  incrementLike,
  incrementReply,
} from '../controller/visitor/LinkController.js';
import { getPreview } from '../controller/visitor/PreviewController.js';

const router = express.Router();

// Visitor auth
router.post('/verify', verify);
router.get('/me', me);

// Categories (read-only)
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Links (read + view/like/reply)
router.get('/links/category/:categoryId', getLinksByCategory);
router.post('/links/:id/view', incrementView);
router.post('/links/:id/like', incrementLike);
router.post('/links/:id/reply', incrementReply);

// Preview
router.get('/preview', getPreview);

export default router;
