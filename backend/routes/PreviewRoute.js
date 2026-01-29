import express from 'express';
import { getPreview } from '../controller/PreviewController.js';

const router = express.Router();

router.get('/', getPreview);

export default router;
