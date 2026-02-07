import { Router } from 'express';
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  updateStock,
  addStock,
  deleteProduct
} from '../controllers/productController.js';

import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = Router();

// público
router.get('/', getProducts);
router.get('/:id', getProductById);

// admin
router.post('/', authMiddleware, isAdmin, createProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.patch('/:id/stock', authMiddleware, isAdmin, updateStock);
router.patch('/:id/stock/add', authMiddleware, isAdmin, addStock);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

export default router;
