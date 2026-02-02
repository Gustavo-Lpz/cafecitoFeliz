import dotenv from 'dotenv';
import app from './app.js';
import  connectDB  from './config/db.js';

dotenv.config(); // 👈 FORZAMOS la carga del .env

const PORT = process.env.PORT || 3000;

console.log('MONGODB_URI:', process.env.MONGODB_URI); // 👈 DEBUG

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
