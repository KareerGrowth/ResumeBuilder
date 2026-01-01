
import dotenv from 'dotenv';
dotenv.config();

console.log("RAZORPAY_KEY_ID exists:", !!process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET exists:", !!process.env.RAZORPAY_KEY_SECRET);
console.log("RAZORPAY_KEY_ID length:", process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.length : 0);

