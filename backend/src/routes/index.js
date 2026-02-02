import express from 'express';

import authRoutes from './authRoutes.js';
import categoryRoutes from './category.routes.js';
import notificationRoutes from './notification.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import productRoutes from './product.routes.js';
import salesRoutes from './salesRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/sales', salesRoutes);

export default router;
