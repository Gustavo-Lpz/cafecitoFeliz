import PaymentMethod from '../models/paymentMethod.js';

/* =========================
   ADMIN - Todos los métodos
========================= */
export async function getPaymentMethods(req, res, next) {
  try {
    const paymentMethods = await PaymentMethod
      .find({ isActive: true })
      .populate('user', 'displayName email');

    res.status(200).json(paymentMethods);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Obtener por ID (owner/admin)
========================= */
export async function getPaymentMethodById(req, res, next) {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findById(id)
      .populate('user', 'displayName email');

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Solo dueño o admin
    if (
      paymentMethod.user._id.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(paymentMethod);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Métodos del usuario logueado
========================= */
export async function getPaymentMethodsByUser(req, res, next) {
  try {
    const userId = req.user.userId;

    const paymentMethods = await PaymentMethod.find({
      user: userId,
      isActive: true
    });

    res.status(200).json(paymentMethods);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Crear método de pago
========================= */
export async function createPaymentMethod(req, res, next) {
  try {
    const user = req.user.userId;

    const {
      type,
      cardNumber,
      cardHolderName,
      expiryDate,
      paypalEmail,
      bankName,
      accountNumber,
      isDefault = false
    } = req.body;

    if (!type) {
      return res.status(400).json({ message: 'Payment type is required' });
    }

    const validTypes = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid payment method type' });
    }

    // Validaciones por tipo
    if (['credit_card', 'debit_card'].includes(type)) {
      if (!cardNumber || !cardHolderName || !expiryDate) {
        return res.status(400).json({ message: 'Card data is incomplete' });
      }
    }

    if (type === 'paypal' && !paypalEmail) {
      return res.status(400).json({ message: 'PayPal email is required' });
    }

    if (type === 'bank_transfer' && (!bankName || !accountNumber)) {
      return res.status(400).json({ message: 'Bank data is required' });
    }

    // Desactivar default anterior
    if (isDefault) {
      await PaymentMethod.updateMany(
        { user, isDefault: true },
        { isDefault: false }
      );
    }

    const paymentMethod = await PaymentMethod.create({
      user,
      type,
      cardNumber,
      cardHolderName,
      expiryDate,
      paypalEmail,
      bankName,
      accountNumber,
      isDefault
    });

    res.status(201).json(paymentMethod);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Actualizar método
========================= */
export async function updatePaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    if (paymentMethod.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.body.isDefault === true) {
      await PaymentMethod.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }

    const updated = await PaymentMethod.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Marcar como default
========================= */
export async function setDefaultPaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod || paymentMethod.user.toString() !== userId) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await PaymentMethod.updateMany(
      { user: userId, isDefault: true },
      { isDefault: false }
    );

    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.status(200).json(paymentMethod);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Desactivar método
========================= */
export async function deactivatePaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod || paymentMethod.user.toString() !== userId) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    paymentMethod.isActive = false;
    paymentMethod.isDefault = false;

    await paymentMethod.save();

    res.status(200).json(paymentMethod);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Obtener default del usuario
========================= */
export async function getDefaultPaymentMethod(req, res, next) {
  try {
    const userId = req.user.userId;

    const paymentMethod = await PaymentMethod.findOne({
      user: userId,
      isDefault: true,
      isActive: true
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'No default payment method found' });
    }

    res.status(200).json(paymentMethod);
  } catch (error) {
    next(error);
  }
}

/* =========================
   Eliminar método (hard delete)
========================= */
export async function deletePaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod || paymentMethod.user.toString() !== userId) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await paymentMethod.deleteOne();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
