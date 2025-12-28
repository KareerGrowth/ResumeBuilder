import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import requestIp from 'request-ip';
import mysqlAuthService from './services/mysqlAuthService.js';
import "dotenv/config";
import connectDB from "./configs/db.js";
import { testConnection } from "./configs/mysql.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import creditRoutes from './routes/creditRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Database connections
await connectDB();

// Test MySQL connection (optional - won't fail if MySQL is unavailable)
try {
    const mysqlConnected = await testConnection();
    if (mysqlConnected) {
        console.log('MySQL connection available for candidate authentication');
    } else {
        console.warn('MySQL connection not available - candidate authentication disabled');
    }
} catch (error) {
    console.warn('MySQL connection test failed:', error.message);
}

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', // Added 5174 just in case
    'http://localhost:3000',
    'https://resume-builder-production.up.railway.app'
];

app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Don't block during development for easier debugging
            // return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.get('/', (req, res) => res.send("Server is live..."))
app.use('/api/users', userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', aiRouter)
app.use('/api/credits', creditRoutes)
app.use('/api/payment', paymentRouter)

// Initialize MySQL Tables if configured
if (process.env.MYSQL_HOST) {
    // Initialize MySQL tables for credits and payments
    mysqlAuthService.initializeTables().catch(err => console.error(err));
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});
