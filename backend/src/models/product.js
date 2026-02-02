import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['cafe', 'postre', 'combo'],
      default: 'cafe'
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Product', productSchema);
