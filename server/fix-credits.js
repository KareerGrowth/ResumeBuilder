
import mongoose from 'mongoose';
import Credit from './models/Credit.js';
import 'dotenv/config';

const fixCredits = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Find all credits and update them
        const credits = await Credit.find({});
        console.log(`Found ${credits.length} credit records.`);

        for (let credit of credits) {
            credit.totalCredits = 50; // Give plenty
            credit.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year
            await credit.save();
            console.log(`Updated credits for user ${credit.userId}: ${credit.usedCredits}/${credit.totalCredits}`);
        }

        console.log("Done!");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixCredits();
