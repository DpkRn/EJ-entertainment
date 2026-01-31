import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getLinksByCategory,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
} from '../controller/admin/AdminController.js';

const router = express.Router();

router.use(adminAuth);

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Links (specific /links/category/:id before /links/:id)
router.get('/links/category/:categoryId', getLinksByCategory);
router.get('/links/:id', getLinkById);
router.post('/links', createLink);
router.put('/links/:id', updateLink);
router.delete('/links/:id', deleteLink);

// Visitors
router.get('/visitors', getVisitors);
router.get('/visitors/:id', getVisitorById);
router.post('/visitors', createVisitor);
router.put('/visitors/:id', updateVisitor);
router.delete('/visitors/:id', deleteVisitor);

export default router;
