import express from 'express';
import { createOrder, verifyPayment, checkDiscount } from '../controllers/paymentController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/validate-discount', checkDiscount);

export default router;
