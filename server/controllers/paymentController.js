import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Credit from '../models/Credit.js';
import User from '../models/User.js';
import mysqlAuthService from '../services/mysqlAuthService.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Plan Details
const PLANS = {
    Pro: {
        amount: 49900, // ₹499 in paise
        credits: 5,
        validityMonths: 3,
        name: 'Pro Plan'
    },
    Ultimate: {
        amount: 99900, // ₹999 in paise
        credits: 15,
        validityMonths: 3,
        name: 'Ultimate Plan'
    }
};

// Create Order
export const createOrder = async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.userId;
        const userEmail = req.userEmail; // from auth middleware

        if (!PLANS[planType]) {
            return res.status(400).json({ message: "Invalid plan type. Choose 'Pro' or 'Ultimate'." });
        }

        const plan = PLANS[planType];

        const options = {
            amount: plan.amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}_${userId.toString().slice(-4)}`
        };

        const order = await razorpay.orders.create(options);

        // Check if MySQL user
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);

        if (isMongoId) {
            // Save in Mongo
            await Payment.create({
                orderId: order.id,
                amount: plan.amount,
                currency: "INR",
                status: "created",
                receipt: options.receipt,
                userId: userId,
                userEmail: userEmail,
                planType: planType
            });
        } else {
            // Save in MySQL (IF AVAILABLE)
            try {
                const mysqlAvailable = await mysqlAuthService.isAvailable();
                if (mysqlAvailable) {
                    await mysqlAuthService.createPayment({
                        orderId: order.id,
                        amount: plan.amount,
                        currency: "INR",
                        status: "created",
                        receipt: options.receipt,
                        userId: userId,
                        userEmail: userEmail,
                        planType: planType
                    });
                } else {
                    console.error('[Payment] MySQL unavailable - cannot store MySQL payment. Registration might have been forced to MongoDB.');
                    throw new Error("Payment storage failed: Service unavailable.");
                }
            } catch (error) {
                console.error('[Payment] MySQL Error during order creation:', error.message);
                throw error;
            }
        }

        res.json({
            success: true,
            orderId: order.id,
            amount: plan.amount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            planName: plan.name,
            userEmail: userEmail,
            userName: req.userName || 'User'
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Failed to create payment order", error: error.message });
    }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ message: "Missing payment details" });
        }

        // Verify Signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest('hex');

        if (generatedSignature !== signature) {
            return res.status(400).json({ message: "Payment verification failed: Invalid signature" });
        }

        // --- RETRIEVE PAYMENT ---
        let payment = await Payment.findOne({ orderId });
        let isMysql = false;

        if (!payment) {
            // Check MySQL (IF AVAILABLE)
            try {
                if (await mysqlAuthService.isAvailable()) {
                    const mysqlPayment = await mysqlAuthService.getPaymentByOrderId(orderId);
                    if (mysqlPayment) {
                        isMysql = true;
                        payment = {
                            planType: mysqlPayment.plan_type,
                            userId: mysqlPayment.user_id,
                            _id: mysqlPayment.id,
                        };
                    }
                }
            } catch (error) {
                console.error('[Payment] MySQL Error during verification lookup:', error.message);
            }

            if (!payment) {
                return res.status(404).json({ message: "Order not found" });
            }
        }

        // --- UPDATE PAYMENT STATUS ---
        if (isMysql) {
            await mysqlAuthService.updatePaymentStatus(orderId, paymentId, signature, "paid");
        } else {
            payment.paymentId = paymentId;
            payment.signature = signature;
            payment.status = "paid";
            await payment.save();
        }

        // --- UPDATE CREDITS ---
        const plan = PLANS[payment.planType];
        const now = new Date();
        const newExpiry = new Date(now.setMonth(now.getMonth() + plan.validityMonths));

        if (isMysql) {
            // MySQL Credit Update
            let credit = await mysqlAuthService.getCredit(payment.userId);
            if (credit) {
                const remainingCredits = Math.max(0, credit.total_credits - credit.used_credits);
                const newTotal = remainingCredits + plan.credits;

                await mysqlAuthService.updateCredit(payment.userId, {
                    planType: payment.planType,
                    totalCredits: newTotal,
                    usedCredits: 0,
                    expiresAt: newExpiry
                });
            } else {
                // Initialize default logic handled in getOrCreate, but here we explicitly grant plan
                await mysqlAuthService.createCredit({
                    userId: payment.userId,
                    planType: payment.planType,
                    totalCredits: plan.credits,
                    usedCredits: 0,
                    expiresAt: newExpiry
                });
            }

        } else {
            // Mongo Credit Update
            let credit = await Credit.findOne({ userId: payment.userId });

            if (credit) {
                const remainingCredits = Math.max(0, credit.totalCredits - credit.usedCredits);
                credit.totalCredits = remainingCredits + plan.credits;
                credit.usedCredits = 0;
                credit.expiresAt = newExpiry;
                credit.paymentId = payment._id;
                credit.planType = payment.planType;
                await credit.save();
            } else {
                await Credit.create({
                    userId: payment.userId,
                    planType: payment.planType,
                    totalCredits: plan.credits,
                    usedCredits: 0,
                    expiresAt: newExpiry,
                    paymentId: payment._id
                });
            }
        }

        res.json({ success: true, message: "Payment verified and plan upgraded successfully!" });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: "Payment verification failed", error: error.message });
    }
};
