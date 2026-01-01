import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Discount from '../models/Discount.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const checkDB = async () => {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const discounts = await Discount.find({});
        console.log('Found Discounts:', JSON.stringify(discounts, null, 2));

        // Test specific query
        const testCode = "NEW10";
        const campaign = await Discount.findOne({
            "discounts.discountCode": testCode
        });
        console.log(`Query for code "${testCode}" returned:`, campaign ? campaign._id : "NULL");

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkDB();
