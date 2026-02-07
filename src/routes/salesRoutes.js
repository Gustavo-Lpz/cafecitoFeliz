import { Router } from 'express';
import {
  createSale,
  createGuestSale,
  getAllSales,
  getDailySalesSummary
} from '../controllers/salesController.js';

import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = Router();

/**
 * Crear venta como invitado
 * POST /api/sales/guest
 */
router.post('/guest', createGuestSale);

/**
 * 📊 Resumen diario de ventas (cierre de caja simple)
 * GET /api/sales/summary/daily
 */
router.get(
  '/summary/daily',
  authMiddleware,
  isAdmin,
  getDailySalesSummary
);

/**
 * Crear venta (usuario autenticado)
 * POST /api/sales
 */
router.post('/', authMiddleware, createSale);

/**
 * Obtener todas las ventas (solo admin)
 * GET /api/sales
 */
router.get('/', authMiddleware, isAdmin, getAllSales);

export default router;
