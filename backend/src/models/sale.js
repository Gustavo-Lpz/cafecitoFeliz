import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    // 🧑 Usuario registrado (opcional)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    // 👤 Cliente invitado
    guest: {
      type: Boolean,
      default: false,
    },

    guestInfo: {
      name: String,
      phone: String,
      email: String,
    },

    // 🧾 Productos vendidos
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🔥 AQUÍ EL CAMBIO IMPORTANTE
    paymentMethod: {
      type: String,
      enum: ['efectivo', 'tarjeta'],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'paid',
    },
  },
  {
    timestamps: true,
  }
);

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
