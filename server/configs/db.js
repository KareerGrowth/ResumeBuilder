import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => { console.log("Database connected successfully") })

        let mongodbURI = process.env.MONGODB_URI;
        const projectName = 'resume-builder';

        if (!mongodbURI) {
            throw new Error("MONGODB_URI environment variable not set")
        }

        // Create the final URI
        const url = new URL(mongodbURI.replace('mongodb+srv://', 'https://'));
        url.pathname = `/${projectName}`;
        const finalURI = url.toString().replace('https://', 'mongodb+srv://');

        console.log(`[DB] Connecting to MongoDB: ${projectName}...`);
        await mongoose.connect(finalURI);
        console.log(`[DB] Successfully connected to database: ${mongoose.connection.db.databaseName}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
    }
}

export default connectDB;