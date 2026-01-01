import Credit from "../models/Credit.js";
import mysqlAuthService from "../services/mysqlAuthService.js";

// Helper to determine source and get/create credit
const getOrCreateCredit = async (req) => {
    const userId = req.userId;
    // Assuming req.userSource is set by authMiddleware, OR we infer from userId format
    // But authMiddleware sets req.userId.
    // Let's rely on checking if it looks like Mongo ID or not, OR better:
    // Ideally authMiddleware should tell us the source.
    // Let's infer: If userId is 24-char hex, it might be Mongo. But MySQL IDs are also UIDs?
    // User said "mysql users". 
    // Let's try to find in Mongo first? No, that's inefficient.
    // Let's assume we can detect source. 
    // Checking previous convo: MySQL users have string IDs (UUIDs or short IDs?).

    // Actually, let's look at authMiddleware again later. For now, assume we check MySQL service if not found in Mongo?
    // Or better: Let's assume we update authMiddleware to attach `req.authSource`.
    // If not, we can try both or use a flag.

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);

    let credit = await Credit.findOne({ userId });

    if (credit) return { type: 'mongo', data: credit };

    // If not in Mongo, check MySQL (IF AVAILABLE)
    try {
        const mysqlAvailable = await mysqlAuthService.isAvailable();
        if (mysqlAvailable) {
            const mysqlCredit = await mysqlAuthService.getCredit(userId);
            if (mysqlCredit) {
                return {
                    type: 'mysql',
                    data: {
                        userId: mysqlCredit.user_id,
                        planType: mysqlCredit.plan_type,
                        totalCredits: mysqlCredit.total_credits,
                        usedCredits: mysqlCredit.used_credits,
                        expiresAt: mysqlCredit.expires_at,
                    }
                };
            }
        } else {
            console.warn('[Credits] MySQL service unavailable - defaulting to MongoDB logic');
        }
    } catch (error) {
        console.error('[Credits] Non-critical error checking MySQL credits:', error);
    }

    // Determine where to create new credit (default)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    // If it's a Mongo ID OR MySQL is unavailable, create in Mongo
    // This ensures local development always works with Mongo
    const mysqlAvailable = await (async () => {
        try { return await mysqlAuthService.isAvailable(); }
        catch { return false; }
    })();

    if (isMongoId || !mysqlAvailable) {
        const newCredit = await Credit.create({
            userId,
            planType: 'Free',
            totalCredits: 2,
            usedCredits: 0,
            expiresAt: threeMonthsFromNow
        });
        return { type: 'mongo', data: newCredit };
    } else {
        // Create in MySQL
        const newCredit = await mysqlAuthService.createCredit({
            userId,
            planType: 'Free',
            totalCredits: 2,
            usedCredits: 0,
            expiresAt: threeMonthsFromNow
        });
        return {
            type: 'mysql',
            data: {
                userId,
                planType: 'Free',
                totalCredits: 2,
                usedCredits: 0,
                expiresAt: threeMonthsFromNow
            }
        };
    }
};

// Check credit balance
export const checkCredits = async (req, res) => {
    try {
        const { type, data: credit } = await getOrCreateCredit(req);

        const isExpired = new Date() > new Date(credit.expiresAt);
        const hasBalance = credit.usedCredits < credit.totalCredits;

        if (isExpired) {
            return res.status(200).json({ success: false, message: 'Credits expired', credit });
        }

        return res.status(200).json({ success: hasBalance, credit });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Deduct credit
export const deductCredit = async (req, res) => {
    try {
        const { type, data: credit } = await getOrCreateCredit(req);

        if (new Date() > new Date(credit.expiresAt)) {
            return res.status(403).json({ message: 'Credits expired. Please upgrade.' });
        }

        if (credit.usedCredits >= credit.totalCredits) {
            return res.status(403).json({ message: 'Insufficient credits. Please upgrade.' });
        }

        if (type === 'mongo') {
            credit.usedCredits += 1;
            await credit.save();
        } else {
            // MySQL Update
            await mysqlAuthService.updateCredit(credit.userId, {
                usedCredits: credit.usedCredits + 1
            });
            credit.usedCredits += 1; // Update local obj for response
        }

        return res.status(200).json({ success: true, message: 'Credit deducted', credit });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
