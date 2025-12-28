import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Resume from "../models/Resume.js";
import tokenBlacklistService from "../services/tokenBlacklistService.js";
import mysqlAuthService from "../services/mysqlAuthService.js";
import Credit from "../models/Credit.js";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
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
    // Set access token cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: ACCESS_TOKEN_SECONDS * 1000,
        path: '/'
    });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
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
        const { name, email, password } = req.body;

        // check if required fields are present
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        // STEP 1: Check if user already exists in MongoDB
        const existingMongoUser = await User.findOne({ email });
        if (existingMongoUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // STEP 2: Check if user exists in MySQL (candidates database) - STRICT CHECK
        // This ensures email uniqueness across BOTH databases
        try {
            const mysqlAvailable = await mysqlAuthService.isAvailable();

            // STRICT: If MySQL is not available, we MUST block registration to prevent duplicates
            if (!mysqlAvailable) {
                console.error('MySQL service unavailable during registration - blocking to prevent duplicates');
                return res.status(503).json({
                    message: 'Registration temporarily unavailable. Please try again later.'
                });
            }

            const candidate = await mysqlAuthService.getCandidateByEmail(email);
            if (candidate) {
                return res.status(400).json({
                    message: 'Email already registered. Please use login instead.'
                });
            }
        } catch (error) {
            console.error('Critical error checking MySQL user:', error);
            // STRICT: Block registration on error to ensure uniqueness safety
            return res.status(500).json({
                message: 'System error during registration check. Please try again.'
            });
        }

        // STEP 3: Create new user in MongoDB
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            lastLogin: new Date()
        });

        // Initialize User Credits (Free Plan: 2 credits, 3 months validity)
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        await Credit.create({
            userId: newUser._id,
            planType: 'Free',
            totalCredits: 2,
            usedCredits: 0,
            expiresAt: threeMonthsFromNow
        });

        // Generate tokens
        const accessToken = generateAccessToken(newUser._id.toString(), newUser.email, 'mongodb');
        const refreshToken = generateRefreshToken(newUser._id.toString(), newUser.email, 'mongodb');

        // Store refresh token in database
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000);
        await RefreshToken.create({
            userId: newUser._id,
            token: refreshToken,
            expiresAt
        });

        // Set cookies
        setTokenCookies(res, accessToken, refreshToken);

        // Return success (don't send tokens in body)
        newUser.password = undefined;
        return res.status(201).json({
            message: 'User created successfully',
            user: newUser,
            source: 'mongodb'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(400).json({ message: error.message })
    }
}

// controller for user login
// POST: /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        console.log(`[LOGIN] Attempting login for email: ${email}`);

        let user = null;
        let userId = null;
        let source = null;

        // Priority 1: Check MySQL candidates database first
        console.log('[LOGIN] Checking MySQL database...');
        try {
            const mysqlAvailable = await mysqlAuthService.isAvailable();
            console.log(`[LOGIN] MySQL available: ${mysqlAvailable}`);

            if (mysqlAvailable) {
                const candidate = await mysqlAuthService.authenticateCandidate(email, password);
                console.log(`[LOGIN] MySQL authentication result: ${candidate ? 'SUCCESS' : 'FAILED'}`);

                if (candidate) {
                    // Convert MySQL candidate to user format
                    user = {
                        name: candidate.name,
                        email: candidate.email,
                        _id: candidate.id // Use MySQL ID
                    };
                    userId = Buffer.from(candidate.id).toString('hex'); // Convert binary UUID to hex string
                    source = 'mysql';

                    console.log(`[LOGIN] MySQL user authenticated: ${email}, userId: ${userId}`);

                    // Update last login
                    await mysqlAuthService.updateLastLogin(email);
                }
            } else {
                console.log('[LOGIN] MySQL not available, skipping MySQL authentication');
            }
        } catch (error) {
            console.error('[LOGIN] MySQL authentication error:', error.message);
            console.error('[LOGIN] Full error:', error);
            // Continue to MongoDB check
        }

        // Priority 2: Check MongoDB if not found in MySQL
        if (!user) {
            console.log('[LOGIN] Checking MongoDB database...');
            const mongoUser = await User.findOne({ email });
            console.log(`[LOGIN] MongoDB user found: ${mongoUser ? 'YES' : 'NO'}`);

            if (mongoUser && mongoUser.comparePassword(password)) {
                user = mongoUser;
                userId = mongoUser._id.toString();
                source = 'mongodb';

                console.log(`[LOGIN] MongoDB user authenticated: ${email}`);

                // Update last login
                mongoUser.lastLogin = new Date();
                await mongoUser.save();
            } else if (mongoUser) {
                console.log('[LOGIN] MongoDB user found but password incorrect');
            }
        }

        // If no user found in either database
        if (!user) {
            console.log(`[LOGIN] Login failed for ${email} - user not found or invalid password`);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log(`[LOGIN] Login successful for ${email} from ${source}`);

        // Generate tokens
        const accessToken = generateAccessToken(userId, email, source);
        const refreshToken = generateRefreshToken(userId, email, source);

        // Store refresh token in MongoDB (for both MySQL and MongoDB users)
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000);
        console.log(`[LOGIN] Creating refresh token for userId: ${userId}, source: ${source}`);

        await RefreshToken.create({
            userId: userId, // Always store as string (works for both MongoDB ObjectId strings and MySQL hex strings)
            token: refreshToken,
            expiresAt
        });

        console.log('[LOGIN] Refresh token created successfully');

        // Set cookies
        setTokenCookies(res, accessToken, refreshToken);

        // Remove password from response
        if (user.password) {
            user.password = undefined;
        }

        return res.status(200).json({
            message: 'Login successful',
            user,
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
            resumes = await Resume.find({ userEmail: req.userEmail });
        } else {
            // MongoDB users - find by userId
            resumes = await Resume.find({ userId });
        }

        return res.status(200).json({ resumes });
    } catch (error) {
        console.error('Get resumes error:', error);
        return res.status(400).json({ message: error.message })
    }
}
