import express from 'express';
import { checkCredits, deductCredit } from '../controllers/creditController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/check', protect, checkCredits);
router.post('/deduct', protect, deductCredit);

export default router;
