import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true }, // Amount in paise
    discountCode: { type: String },
    originalAmount: { type: Number }, // Original amount in paise
    discountApplied: { type: Number }, // Percentage applied
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    receipt: { type: String },
    // Using Mixed to support both MongoDB ObjectId and MySQL String IDs
    userId: { type: mongoose.Schema.Types.Mixed, required: true },
    userEmail: { type: String, required: true },
    planType: { type: String, enum: ['Pro', 'Ultimate'], required: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
