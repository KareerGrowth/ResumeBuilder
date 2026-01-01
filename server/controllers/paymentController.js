import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Credit from '../models/Credit.js';
import User from '../models/User.js';
import Discount from '../models/Discount.js';
import mysqlAuthService from '../services/mysqlAuthService.js';
import mongoose from 'mongoose';

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

/**
 * Validates a discount code for a specific user.
 * Returns the discount details and the parent campaign ID if valid.
 */
const validateDiscount = async (code, userId) => {
    console.log(`[Discount] Validating code: "${code}" (Type: ${typeof code})`);
    if (!code) return null;

    // 1. Find the campaign containing the code
    const campaign = await Discount.findOne({
        "discounts.discountCode": code
    });

    console.log(`[Discount] Campaign search result:`, campaign ? campaign._id : "NULL");

    if (!campaign) {
        throw new Error("Invalid discount code");
    }

    // 2. Check Date Validity
    const now = new Date();
    console.log(`[Discount] Checking Dates. Now: ${now.toISOString()}, Start: ${campaign.startDate.toISOString()}, End: ${campaign.endDate.toISOString()}`);

    if (now < campaign.startDate || now > campaign.endDate) {
        throw new Error("Discount code is expired or not yet active");
    }

    // 3. Check specific discount details
    const discount = campaign.discounts.find(d => d.discountCode === code);
    if (!discount) {
        console.log(`[Discount] Code "${code}" not found in campaign discounts array.`);
        throw new Error("Invalid discount code");
    }

    // 4. Check if user has already used a coupon from this campaign
    // (Only for MongoDB users for now as MySQL schema update is complex)
    const isMongoId = mongoose.Types.ObjectId.isValid(userId);
    if (isMongoId) {
        const user = await User.findById(userId);
        if (user && user.usedDiscounts && user.usedDiscounts.includes(campaign._id)) {
            throw new Error("You have already used a coupon from this campaign");
        }
    } else {
        // MySQL logic would go here if needed
        // For now, we assume MySQL users can use it once per order session but validation is skipped
    }

    return {
        ...discount.toObject(),
        campaignId: campaign._id
    };
};

/**
 * Endpoint to check discount validity (Frontend Use)
 */
export const checkDiscount = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.userId;

        const discount = await validateDiscount(code, userId);

        if (discount) {
            res.json({
                success: true,
                discount
            });
        } else {
            // Should verifyDiscount throw error? yes it does.
            // This else might be unreachable if validateDiscount throws.
            res.status(400).json({ message: "Invalid code" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create Order
export const createOrder = async (req, res) => {
    try {
        const { planType, discountCode } = req.body;
        const userId = req.userId;
        const userEmail = req.userEmail; // from auth middleware

        if (!PLANS[planType]) {
            return res.status(400).json({ message: "Invalid plan type. Choose 'Pro' or 'Ultimate'." });
        }

        const plan = PLANS[planType];
        let finalAmount = plan.amount;
        let discountDetails = null;

        // Apply Discount if Provided
        if (discountCode) {
            try {
                const discount = await validateDiscount(discountCode, userId);
                if (discount) {
                    const discountAmount = Math.floor(plan.amount * (discount.discountPercentage / 100));
                    finalAmount = plan.amount - discountAmount;
                    discountDetails = discount;
                }
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        }

        const options = {
            amount: finalAmount,
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
                amount: finalAmount,
                currency: "INR",
                status: "created",
                receipt: options.receipt,
                userId: userId,
                userEmail: userEmail,
                planType: planType,
                discountCode: discountCode || null,
                originalAmount: plan.amount,
                discountApplied: discountDetails ? discountDetails.discountPercentage : 0
            });
        } else {
            // Save in MySQL (IF AVAILABLE)
            try {
                const mysqlAvailable = await mysqlAuthService.isAvailable();
                if (mysqlAvailable) {
                    // Note: MySQL createPayment might need schema update to store discount
                    // For now passing basic fields.
                    await mysqlAuthService.createPayment({
                        orderId: order.id,
                        amount: finalAmount,
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
            amount: finalAmount,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            planName: plan.name,
            userEmail: userEmail,
            userName: req.userName || 'User',
            discountApplied: discountDetails ? true : false,
            originalAmount: plan.amount
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

            // *** CRITICAL: RECORD DISCOUNT USAGE ***
            if (payment.discountCode) {
                try {
                    const campaign = await Discount.findOne({
                        "discounts.discountCode": payment.discountCode
                    });
                    if (campaign) {
                        await User.findByIdAndUpdate(payment.userId, {
                            $addToSet: { usedDiscounts: campaign._id }
                        });
                        console.log(`[Payment] Recorded discount usage for user ${payment.userId}, campaign ${campaign._id}`);
                    }
                } catch (discountErr) {
                    console.error("[Payment] Failed to record discount usage:", discountErr);
                    // Non-fatal, proceed with giving credits
                }
            }
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
