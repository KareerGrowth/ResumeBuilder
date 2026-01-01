import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Discount from '../models/Discount.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const seedDiscounts = async () => {
    try {
        let mongodbURI = process.env.MONGODB_URI;
        const projectName = 'resume-builder';
        const url = new URL(mongodbURI.replace('mongodb+srv://', 'https://'));
        url.pathname = `/${projectName}`;
        const finalURI = url.toString().replace('https://', 'mongodb+srv://');

        console.log(`Connecting to MongoDB: ${projectName} (${finalURI.replace(/:([^:@]+)@/, ':****@')})...`);
        await mongoose.connect(finalURI);
        console.log('Connected!');

        const discountsData = [
            {
                "_id": "665f1a2c9e1f4a3b8c2d1001",
                "startDate": "2026-01-01T00:00:00.000Z",
                "endDate": "2026-03-31T23:59:59.000Z",
                "createdAt": "2026-01-01T09:30:00.000Z",
                "updatedAt": "2026-01-01T09:30:00.000Z",
                "discounts": [
                    {
                        "_id": "665f1a2c9e1f4a3b8c2d1101",
                        "discountCode": "NEW10",
                        "discountPercentage": 10
                    },
                    {
                        "_id": "665f1a2c9e1f4a3b8c2d1102",
                        "discountCode": "SAVE20",
                        "discountPercentage": 20
                    },
                    {
                        "_id": "665f1a2c9e1f4a3b8c2d1103",
                        "discountCode": "OFFER30",
                        "discountPercentage": 30
                    }
                ]
            },
            {
                "_id": "665f1a2c9e1f4a3b8c2d2001",
                "startDate": "2026-04-01T00:00:00.000Z",
                "endDate": "2026-06-30T23:59:59.000Z",
                "createdAt": "2026-04-01T10:00:00.000Z",
                "updatedAt": "2026-04-01T10:00:00.000Z",
                "discounts": [
                    {
                        "_id": "665f1a2c9e1f4a3b8c2d2101",
                        "discountCode": "WELCOME15",
                        "discountPercentage": 15
                    },
                    {
                        "_id": "665f1a2c9e1f4a3b8c2d2102",
                        "discountCode": "FESTIVE25",
                        "discountPercentage": 25
                    },
                    {
                        "_id": "665f1a2c9e1f4a3b8c2d2103",
                        "discountCode": "MEGA40",
                        "discountPercentage": 40
                    }
                ]
            }
        ];

        console.log('Clearing existing discounts...');
        await Discount.deleteMany({});

        console.log('Seeding new discounts from user provided data...');
        await Discount.insertMany(discountsData);

        console.log('✅ Discount migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

seedDiscounts();
