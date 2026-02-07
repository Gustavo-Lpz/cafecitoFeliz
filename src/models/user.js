import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
    purchasesCount: {
    type: Number,
    default: 0,
    min: 0,
    },
  phone: {
    type: String,
    required: true,
    max: 10,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model('User', userSchema);

export default User;