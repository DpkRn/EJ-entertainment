import express from 'express';
import {
  getLinksByCategory,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
} from '../controller/AdminController.js';

const router = express.Router();

router.get('/category/:categoryId', getLinksByCategory);
router.get('/:id', getLinkById);
router.post('/', createLink);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);

export default router;
