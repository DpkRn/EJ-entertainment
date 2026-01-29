import express from 'express';
import { verify, me } from '../controller/VisitorController.js';

const router = express.Router();

router.post('/verify', verify);
router.get('/me', me);

export default router;
