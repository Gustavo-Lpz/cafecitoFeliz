import Product from '../models/product.js';


// =============================
// 📥 GET ALL
// =============================
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ available: true });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};


// =============================
// ➕ CREATE
// =============================
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, stock = 0 } = req.body;

    if (!name || price == null) {
      return res.status(400).json({
        message: 'Name and price are required'
      });
    }

    const product = await Product.create({
      ...req.body,
      stock
    });

    res.status(201).json(product);

  } catch (error) {
    next(error);
  }
};


// =============================
// 📥 GET ONE
// =============================
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product || !product.available) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);

  } catch (error) {
    next(error);
  }
};


// =============================
// ✏️ UPDATE INFO (nombre/precio/etc)
// =============================
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updated);

  } catch (error) {
    next(error);
  }
};


// =============================
// 📦 UPDATE STOCK (ADMIN ONLY)
// =============================
export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock == null || stock < 0) {
      return res.status(400).json({
        message: 'Valid stock value is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = stock;

    await product.save();

    res.json(product);

  } catch (error) {
    next(error);
  }
};


// =============================
// ➕ ADD STOCK (incremental)
// =============================
export const addStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Amount must be positive'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock += amount;

    await product.save();

    res.json(product);

  } catch (error) {
    next(error);
  }
};


// =============================
// ❌ DELETE
// =============================
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    next(error);
  }
};
