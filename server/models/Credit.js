import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    planType: { type: String, enum: ['Free', 'Pro', 'Ultimate'], default: 'Free' },
    totalCredits: { type: Number, default: 2 },
    usedCredits: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

const Credit = mongoose.model("Credit", CreditSchema);
export default Credit;
