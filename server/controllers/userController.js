import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Resume from "../models/Resume.js";
import tokenBlacklistService from "../services/tokenBlacklistService.js";
import mysqlAuthService from "../services/mysqlAuthService.js";
import Credit from "../models/Credit.js";

import { sendOTP } from "../services/emailService.js";
import crypto from 'crypto';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '7d';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '14d';

// Convert expiry string to seconds for cookie maxAge
const getExpiryInSeconds = (expiry) => {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
};

const ACCESS_TOKEN_SECONDS = getExpiryInSeconds(ACCESS_TOKEN_EXPIRY);
const REFRESH_TOKEN_SECONDS = getExpiryInSeconds(REFRESH_TOKEN_EXPIRY);

/**
 * Generate access token
 */
const generateAccessToken = (userId, email, source = 'mongodb') => {
    return jwt.sign(
        { userId, email, type: 'access', source },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId, email, source = 'mongodb') => {
    return jwt.sign(
        { userId, email, type: 'refresh', source },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

/**
 * Set token cookies
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Set access token cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: ACCESS_TOKEN_SECONDS * 1000,
        path: '/'
    });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: REFRESH_TOKEN_SECONDS * 1000,
        path: '/'
    });
};

/**
 * Clear token cookies
 */
const clearTokenCookies = (res) => {
    res.cookie('accessToken', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
    });

    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
    });
};

// controller for user registration
// POST: /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // check if required fields are present
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        // STEP 1: Check if user already exists in MongoDB
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // STEP 2: Check if user exists in MySQL (optional)
        try {
            const mysqlAvailable = await mysqlAuthService.isAvailable();
            if (mysqlAvailable) {
                const candidate = await mysqlAuthService.getCandidateByEmail(email);
                if (candidate) {
                    return res.status(400).json({
                        message: 'Email already registered in candidate system. Please use login instead.'
                    });
                }
            }
        } catch (error) {
            console.error('Non-critical error checking MySQL user:', error);
        }

        // STEP 3: Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // STEP 4: Create inactive user in MongoDB
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpExpiresAt,
            isVerified: false
        });

        // Send OTP
        await sendOTP(email, otp);

        return res.status(201).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email,
            requiresVerification: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(400).json({ message: error.message })
    }
}

// Verify OTP Controller
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        // Check verification
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Activate User
        await User.findOneAndUpdate(
            { email },
            {
                isVerified: true,
                $unset: { otp: 1, otpExpiresAt: 1 },
                lastLogin: new Date()
            }
        );

        // Initialize User Credits
        try {
            console.log(`[VERIFY_OTP] Initializing credits for user: ${user._id}`);
            const threeMonthsFromNow = new Date();
            threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

            await Credit.updateOne(
                { userId: user._id },
                {
                    $setOnInsert: {
                        planType: 'Free',
                        totalCredits: 2,
                        usedCredits: 0,
                        expiresAt: threeMonthsFromNow
                    }
                },
                { upsert: true }
            );
            console.log(`[VERIFY_OTP] Credits initialized/checked successfully`);
        } catch (creditError) {
            // E11000 is expected if another process wins the race
            if (creditError.code === 11000) {
                console.log("[VERIFY_OTP] Credits record already exists (duplicate key handled)");
            } else {
                console.error("[VERIFY_OTP] Non-duplicate error setting up credits:", creditError);
            }
        }

        // Generate tokens (7 days)
        const userIdStr = user._id.toString();
        const accessToken = generateAccessToken(userIdStr, user.email, 'mongodb');
        const refreshToken = generateRefreshToken(userIdStr, user.email, 'mongodb');

        // Store refresh token (upsert to avoid conflicts)
        try {
            const expiresAt = new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000);
            await RefreshToken.findOneAndUpdate(
                { userId: userIdStr },
                {
                    token: refreshToken,
                    expiresAt
                },
                { upsert: true, new: true }
            );
        } catch (tokenError) {
            console.error("Error storing refresh token:", tokenError);
        }

        setTokenCookies(res, accessToken, refreshToken);

        user.password = undefined;
        return res.status(200).json({
            message: 'Email verified successfully',
            user,
            token: accessToken,
            source: 'mongodb'
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Resend OTP Controller
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update user using findOneAndUpdate to avoid validation issues with other fields
        await User.findOneAndUpdate(
            { email },
            {
                otp,
                otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
            },
            { upsert: false } // Only if user exists
        );

        await sendOTP(email, otp);

        res.status(200).json({ message: 'New OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// controller for user login
// POST: /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please register.', userNotFound: true });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Account not verified. Please verify your email.',
                requiresVerification: true,
                email: email
            });
        }

        if (!user.comparePassword(password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        console.log(`[LOGIN] Found MongoDB user: ${user._id}`);
        let userId = user._id.toString();
        let source = 'mongodb';

        // Priority 1: Check MySQL candidates database first
        try {
            const mysqlAvailable = await mysqlAuthService.isAvailable();
            if (mysqlAvailable) {
                console.log('[LOGIN] Checking MySQL database for candidate...');
                const candidate = await mysqlAuthService.authenticateCandidate(email, password);
                if (candidate) {
                    // Convert MySQL candidate to user format
                    user = {
                        name: candidate.name,
                        email: candidate.email,
                        _id: candidate.id
                    };
                    userId = Buffer.from(candidate.id).toString('hex');
                    source = 'mysql';
                    console.log(`[LOGIN] Authenticated via MySQL. userId: ${userId}`);
                    await mysqlAuthService.updateLastLogin(email);
                }
            }
        } catch (error) {
            console.error('[LOGIN] MySQL auth non-fatal error:', error.message);
        }

        // Final sanity check for userId and source
        if (!userId || !source) {
            console.error(`[LOGIN] CRITICAL: userId or source missing. userId=${userId}, source=${source}`);
            // Fallback to MongoDB if we have the user
            if (user && user._id) {
                userId = user._id.toString();
                source = 'mongodb';
            }
        }

        // If user came from MongoDB, update last login (use findOneAndUpdate to avoid validation blocks)
        if (source === 'mongodb') {
            await User.findOneAndUpdate(
                { _id: user._id },
                { lastLogin: new Date() }
            );
        }

        console.log(`[LOGIN] Login proceeding for ${email} from ${source} (userId: ${userId})`);

        // Generate tokens
        const accessToken = generateAccessToken(userId, email, source);
        const refreshToken = generateRefreshToken(userId, email, source);

        // Store refresh token in MongoDB (for both MySQL and MongoDB users)
        try {
            const expiresAt = new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000);
            console.log(`[LOGIN] Creating/Updating refresh token for userId: ${userId}, source: ${source}`);

            await RefreshToken.findOneAndUpdate(
                { userId: userId },
                {
                    token: refreshToken,
                    expiresAt
                },
                { upsert: true, new: true }
            );

            console.log('[LOGIN] Refresh token handled successfully');
        } catch (tokenError) {
            console.error('[LOGIN] Refresh token error:', tokenError);
            // Non-fatal, but logged
        }

        // Set cookies
        setTokenCookies(res, accessToken, refreshToken);

        // Remove password from response
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;

        return res.status(200).json({
            message: 'Login successful',
            user: userObj,
            token: accessToken, // Send token for fallback auth
            source
        });

    } catch (error) {
        console.error('[LOGIN] Unexpected error:', error);
        return res.status(400).json({ message: error.message })
    }
}

// controller for refreshing access token
// POST: /api/users/refresh-token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            clearTokenCookies(res);
            return res.status(401).json({ message: 'Refresh token not found. Please login again.' });
        }

        // Check if token is blacklisted
        const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
            clearTokenCookies(res);
            return res.status(401).json({ message: 'Token has been invalidated. Please login again.' });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, JWT_SECRET);
        } catch (error) {
            clearTokenCookies(res);
            return res.status(401).json({ message: 'Invalid or expired refresh token. Please login again.' });
        }

        // Verify it's a refresh token
        if (decoded.type !== 'refresh') {
            clearTokenCookies(res);
            return res.status(401).json({ message: 'Invalid token type. Please login again.' });
        }

        // Check if refresh token exists in database
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            clearTokenCookies(res);
            return res.status(401).json({ message: 'Refresh token not found. Please login again.' });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(decoded.userId, decoded.email, decoded.source);
        const newRefreshToken = generateRefreshToken(decoded.userId, decoded.email, decoded.source);

        // Blacklist old refresh token (token rotation)
        await tokenBlacklistService.blacklistToken(refreshToken);

        // Delete old refresh token from database
        await RefreshToken.deleteOne({ token: refreshToken });

        // Store new refresh token
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000);
        await RefreshToken.create({
            userId: storedToken.userId,
            token: newRefreshToken,
            expiresAt
        });

        // Set new cookies
        setTokenCookies(res, newAccessToken, newRefreshToken);

        return res.status(200).json({
            message: 'Token refreshed successfully',
            source: decoded.source
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({ message: 'Error refreshing token. Please try again.' });
    }
}

// controller for logout
// POST: /api/users/logout
export const logout = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        // Blacklist both tokens
        if (accessToken) {
            await tokenBlacklistService.blacklistToken(accessToken);
        }

        if (refreshToken) {
            await tokenBlacklistService.blacklistToken(refreshToken);
            // Delete refresh token from database
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        // Clear cookies
        clearTokenCookies(res);

        return res.status(200).json({ message: 'Logout successful' });

    } catch (error) {
        console.error('Logout error:', error);
        // Still clear cookies even if blacklisting fails
        clearTokenCookies(res);
        return res.status(200).json({ message: 'Logout successful' });
    }
}

// controller for getting user by id
// GET: /api/users/data
export const getUserById = async (req, res) => {
    try {
        const userId = req.userId;
        const source = req.userSource;

        if (source === 'mysql') {
            // Fetch from MySQL
            const candidate = await mysqlAuthService.getCandidateByEmail(req.userEmail);
            if (!candidate) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({
                user: {
                    name: candidate.name,
                    email: candidate.email,
                    _id: userId
                },
                source: 'mysql'
            });
        } else {
            // Fetch from MongoDB
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.password = undefined;
            return res.status(200).json({ user, source: 'mongodb' });
        }

    } catch (error) {
        console.error('Get user error:', error);
        return res.status(400).json({ message: error.message })
    }
}

// controller for getting user resumes
// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;
        const source = req.userSource;

        // For MySQL users, we need to map their ID differently
        // For now, we'll use email as the common identifier
        let resumes;

        if (source === 'mysql') {
            // MySQL users - find resumes by email
            resumes = await Resume.find({ userEmail: req.userEmail }).sort({ updatedAt: -1 });
        } else {
            // MongoDB users - find by userId
            resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
        }

        return res.status(200).json({ resumes });
    } catch (error) {
        console.error('Get resumes error:', error);
        return res.status(400).json({ message: error.message })
    }
}
// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update user with OTP
        await User.findOneAndUpdate(
            { email },
            {
                otp,
                otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            },
            { upsert: false }
        );

        await sendOTP(email, otp);

        res.status(200).json({ message: 'OTP sent to your email.' });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ message: error.message });
    }
}

// Verify Reset OTP
export const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        return res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify OTP again for security
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired session. Please try again.' });
        }

        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'Session expired. Please try again.' });
        }

        // Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findOneAndUpdate(
            { email },
            {
                password: hashedPassword,
                $unset: { otp: 1, otpExpiresAt: 1 }
            }
        );

        res.status(200).json({ message: 'Password reset successfully. You can now login.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

