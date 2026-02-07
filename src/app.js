import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import PaymentMethodRoutes from './routes/paymentMethodRoutes.js';
import salesRoutes from './routes/salesRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment-methods', PaymentMethodRoutes);
app.use('/api/sales', salesRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Cafecito Feliz!');
});

export default app;