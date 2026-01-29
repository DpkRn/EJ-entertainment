import express from 'express';
import { getCategories, getCategoryById } from '../controller/CategoryController.js';

const router = express.Router();

// Public read-only
router.get('/', getCategories);
router.get('/:id', getCategoryById);

export default router;
