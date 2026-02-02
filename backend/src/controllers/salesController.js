import User from '../models/user.js';
import Sale from '../models/sale.js';
import Product from '../models/product.js';
import { calculateDiscount } from '../utils/discountUtils.js';

/**
 * Crear una venta
 */
export async function createGuestSale(req, res, next) {
  try {
    const { items, paymentMethod, guestInfo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    if (!guestInfo?.name || !guestInfo?.phone) {
      return res.status(400).json({
        message: 'Guest name and phone are required'
      });
    }

    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.available) {
        return res.status(404).json({
          message: 'Product not available'
        });
      }

      const quantity = item.quantity || 1;

      // Verificar stock
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      // Actualizar stock
      product.stock -= quantity;
      await product.save();

      const itemSubtotal = product.price * quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal: itemSubtotal
      });
    }

    // ❌ Invitados NO tienen descuento
    const sale = await Sale.create({
      guest: true,
      guestInfo,
      items: saleItems,
      subtotal,
      discountPercent: 0,
      discountAmount: 0,
      total: subtotal,
      paymentMethod
    });

    res.status(201).json({
      message: 'Guest sale completed successfully',
      sale
    });

  } catch (error) {
    next(error);
  }
}

export async function createSale(req, res, next) {
  try {
    const userId = req.user.userId;
    const { items, paymentMethod } = req.body;

    // 🔐 Validaciones básicas
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let subtotal = 0;
    const saleItems = [];

    // 🧱 Construir items desde productos reales
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      const quantity = item.quantity || 1;
      const itemSubtotal = product.price * quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal: itemSubtotal,
      });
    }

    // 🔹 Calcular descuento por compras previas
    const discountPercent = calculateDiscount(user.purchasesCount);
    const discountAmount = Number(
      (subtotal * discountPercent / 100).toFixed(2)
    );
    const total = Number((subtotal - discountAmount).toFixed(2));

    // 💾 Guardar venta
    const sale = await Sale.create({
      user: userId,
      items: saleItems,
      subtotal,
      discountPercent,
      discountAmount,
      total,
      paymentMethod,
    });

    // 🔥 Incrementar contador solo si la venta fue exitosa
    user.purchasesCount += 1;
    await user.save();

    res.status(201).json({
      message: 'Sale completed successfully',
      sale,
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Obtener todas las ventas (admin o histórico)
 */
export async function getAllSales(req, res, next) {
  try {
    const sales = await Sale.find()
      .populate('user', 'displayName email')
      .populate('items.product', 'name price')
      .populate('paymentMethod', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(sales);
  } catch (error) {
    next(error);
  }
}

/**
 * 📊 Resumen diario de ventas (cierre de caja simple)
 */
export async function getDailySalesSummary(req, res, next) {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const summary = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    res.status(200).json({
      date: start.toISOString().split('T')[0],
      totalSales: summary[0]?.totalSales || 0,
      totalAmount: summary[0]?.totalAmount || 0
    });

  } catch (error) {
    next(error);
  }
}

