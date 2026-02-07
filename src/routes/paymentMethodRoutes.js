import express from 'express';
import {
  getPaymentMethods,
  getPaymentMethodById,
  getPaymentMethodsByUser,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deactivatePaymentMethod,
  deletePaymentMethod,
  getDefaultPaymentMethod,
} from '../controllers/paymentMethodController.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin: todos los métodos activos
router.get('/', authMiddleware, isAdmin, getPaymentMethods);

// Método default del usuario logueado
router.get('/default', authMiddleware, getDefaultPaymentMethod);

// Métodos del usuario logueado
router.get('/user', authMiddleware, getPaymentMethodsByUser);

// Obtener por ID
router.get('/:id', authMiddleware, getPaymentMethodById);

// Crear método de pago ✅
router.post('/', authMiddleware, createPaymentMethod);

// Marcar como default
router.patch('/:id/set-default', authMiddleware, setDefaultPaymentMethod);

// Desactivar
router.patch('/:id/deactivate', authMiddleware, deactivatePaymentMethod);

// Actualizar
router.put('/:id', authMiddleware, updatePaymentMethod);

// Eliminar
router.delete('/:id', authMiddleware, deletePaymentMethod);

export default router;
