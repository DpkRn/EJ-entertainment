import express from 'express';
import {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
} from '../controller/AdminController.js';

const router = express.Router();

router.get('/', getVisitors);
router.get('/:id', getVisitorById);
router.post('/', createVisitor);
router.put('/:id', updateVisitor);
router.delete('/:id', deleteVisitor);

export default router;
