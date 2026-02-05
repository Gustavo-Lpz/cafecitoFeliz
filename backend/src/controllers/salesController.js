import User from '../models/user.js';
import Sale from '../models/sale.js';
import Product from '../models/product.js';
import { calculateDiscount } from '../utils/discountUtils.js';


// =====================================================
// 🔥 FUNCIÓN BASE COMPARTIDA
// =====================================================
async function processSale({
  userId = null,
  guestInfo = null,
  items,
  paymentMethod
}) {

  let subtotal = 0;
  const saleItems = [];

  // =========================
  // VALIDAR + DESCONTAR STOCK
  // =========================
  for (const item of items) {

    const product = await Product.findById(item.productId);

    if (!product || !product.available) {
      throw new Error(`Producto no disponible`);
    }

    const quantity = item.quantity || 1;

    if (product.stock < quantity) {
      throw new Error(`Stock insuficiente para ${product.name}`);
    }

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

  // =========================
  // 🔥 DESCUENTO USUARIO
  // =========================
  let discountPercent = 0;
  let discountAmount = 0;

  if (userId) {

    const user = await User.findById(userId);

    // ✅ primero incrementamos compra
    user.purchasesCount += 1;

    // ✅ luego calculamos descuento
    discountPercent = calculateDiscount(user.purchasesCount);

    discountAmount = Number(
      (subtotal * discountPercent / 100).toFixed(2)
    );

    await user.save();
  }

  const total = Number((subtotal - discountAmount).toFixed(2));

  // =========================
  // CREAR VENTA
  // =========================
  const sale = await Sale.create({
    user: userId,
    guest: !userId,
    guestInfo,
    items: saleItems,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    paymentMethod,
    status: 'paid'
  });

  return sale;
}


// =====================================================
// GUEST
// =====================================================
export async function createGuestSale(req, res, next) {
  try {

    const { items, paymentMethod, guestInfo } = req.body;

    const sale = await processSale({
      items,
      paymentMethod,
      guestInfo
    });

    res.status(201).json({ sale });

  } catch (error) {
    next(error);
  }
}


// =====================================================
// USER
// =====================================================
export async function createSale(req, res, next) {
  try {

    const { items, paymentMethod } = req.body;

    const sale = await processSale({
      userId: req.user.userId,
      items,
      paymentMethod
    });

    res.status(201).json({ sale });

  } catch (error) {
    next(error);
  }
}


// =====================================================
// ADMIN
// =====================================================
export async function getAllSales(req, res, next) {
  try {

    const sales = await Sale.find()
      .populate('user', 'displayName email purchasesCount')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json(sales);

  } catch (error) {
    next(error);
  }
}


// =====================================================
// RESUMEN DIARIO
// =====================================================
export async function getDailySalesSummary(req, res, next) {
  try {

    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

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

    res.json({
      totalSales: summary[0]?.totalSales || 0,
      totalAmount: summary[0]?.totalAmount || 0
    });

  } catch (error) {
    next(error);
  }
}
