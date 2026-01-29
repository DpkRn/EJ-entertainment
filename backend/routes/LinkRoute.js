import express from 'express';
import {
  getLinksByCategory,
  incrementView,
  incrementLike,
  incrementReply,
} from '../controller/LinkController.js';

const router = express.Router();

// Public: increment stats (return updated link)
router.post('/:id/view', incrementView);
router.post('/:id/like', incrementLike);
router.post('/:id/reply', incrementReply);

// Public read-only
router.get('/category/:categoryId', getLinksByCategory);

export default router;
