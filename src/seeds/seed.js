import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { products } from '../data/products.seed.js';
import Product from '../models/products.js';

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding');    

        await Product.deleteMany();
        console.log('Cleared existing products');

        await Product.insertMany(products);
        console.log('Seeded products data');

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }   
};

seedDatabase();