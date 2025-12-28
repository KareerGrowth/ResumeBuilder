import getMySQLPool from '../configs/mysql.js';
import bcrypt from 'bcrypt';

/**
 * Service for authenticating candidates from MySQL database
 */
class MySQLAuthService {
    /**
     * Get candidate by email from MySQL
     * @param {string} email - Candidate email
     * @returns {Promise<Object|null>} - Candidate object or null
     */
    async getCandidateByEmail(email) {
        try {
            const pool = getMySQLPool();
            const [rows] = await pool.execute(
                'SELECT * FROM candidates WHERE email = ?',
                [email]
            );

            if (rows.length === 0) {
                return null;
            }

            return rows[0];
        } catch (error) {
            console.error('Error fetching candidate from MySQL:', error.message);
            throw error;
        }
    }

    /**
     * Authenticate candidate with email and password
     * @param {string} email - Candidate email
     * @param {string} password - Plain text password
     * @returns {Promise<Object|null>} - Candidate object if authenticated, null otherwise
     */
    async authenticateCandidate(email, password) {
        try {
            console.log(`[MySQL Auth] Authenticating candidate: ${email}`);
            const candidate = await this.getCandidateByEmail(email);

            if (!candidate) {
                console.log(`[MySQL Auth] Candidate not found: ${email}`);
                return null;
            }

            console.log(`[MySQL Auth] Candidate found: ${email}`);

            // Check if password_hash exists
            if (!candidate.password_hash) {
                console.warn(`[MySQL Auth] Candidate has no password set: ${email}`);
                return null;
            }

            console.log(`[MySQL Auth] Comparing password for: ${email}`);
            // Compare password with hash
            const isPasswordValid = await bcrypt.compare(password, candidate.password_hash);

            if (!isPasswordValid) {
                console.log(`[MySQL Auth] Invalid password for: ${email}`);
                return null;
            }

            console.log(`[MySQL Auth] Authentication successful for: ${email}`);

            // Remove password hash from returned object
            delete candidate.password_hash;

            return candidate;
        } catch (error) {
            console.error(`[MySQL Auth] Error authenticating candidate ${email}:`, error.message);
            console.error('[MySQL Auth] Full error:', error);
            throw error;
        }
    }

    /**
     * Update last login time for candidate
     * @param {string} email - Candidate email
     */
    async updateLastLogin(email) {
        try {
            const pool = getMySQLPool();
            await pool.execute(
                'UPDATE candidates SET last_login = NOW() WHERE email = ?',
                [email]
            );
        } catch (error) {
            console.error('Error updating last login:', error.message);
            // Don't throw - this is not critical
        }
    }

    /**
     * Check if MySQL connection is available
     * @returns {Promise<boolean>}
     */
    async isAvailable() {
        try {
            const pool = getMySQLPool();
            const connection = await pool.getConnection();
            connection.release();
            return true;
        } catch (error) {
            console.error('MySQL not available:', error.message);
            return false;
        }
    }

    /**
     * Create necessary tables if they don't exist
     */
    async initializeTables() {
        if (!process.env.MYSQL_HOST) return; // Skip if no MySQL config

        try {
            const pool = getMySQLPool();

            // Create resume_credits table
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS resume_credits (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL UNIQUE,
                    plan_type ENUM('Free', 'Pro', 'Ultimate') DEFAULT 'Free',
                    total_credits INT DEFAULT 2,
                    used_credits INT DEFAULT 0,
                    expires_at DATETIME,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Create resume_payments table
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS resume_payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id VARCHAR(255) NOT NULL,
                    payment_id VARCHAR(255),
                    signature VARCHAR(255),
                    amount INT NOT NULL,
                    currency VARCHAR(10) DEFAULT 'INR',
                    status ENUM('created', 'paid', 'failed') DEFAULT 'created',
                    user_id VARCHAR(255) NOT NULL,
                    user_email VARCHAR(255) NOT NULL,
                    plan_type ENUM('Pro', 'Ultimate') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            console.log('[MySQL] Payment and Credit tables initialized');
        } catch (error) {
            console.error('[MySQL] Error initializing tables:', error.message);
        }
    }

    // --- Credit Management Methods ---

    async getCredit(userId) {
        const pool = getMySQLPool();
        const [rows] = await pool.execute('SELECT * FROM resume_credits WHERE user_id = ?', [userId]);
        return rows[0] || null;
    }

    async createCredit(creditData) {
        const pool = getMySQLPool();
        const { userId, planType, totalCredits, usedCredits, expiresAt } = creditData;
        const [result] = await pool.execute(
            'INSERT INTO resume_credits (user_id, plan_type, total_credits, used_credits, expires_at) VALUES (?, ?, ?, ?, ?)',
            [userId, planType, totalCredits, usedCredits, expiresAt]
        );
        return { ...creditData, id: result.insertId };
    }

    async updateCredit(userId, updates) {
        const pool = getMySQLPool();
        const { planType, totalCredits, usedCredits, expiresAt } = updates;

        // Build dynamic query
        let query = 'UPDATE resume_credits SET ';
        const params = [];
        const fields = [];

        if (planType !== undefined) { fields.push('plan_type = ?'); params.push(planType); }
        if (totalCredits !== undefined) { fields.push('total_credits = ?'); params.push(totalCredits); }
        if (usedCredits !== undefined) { fields.push('used_credits = ?'); params.push(usedCredits); }
        if (expiresAt !== undefined) { fields.push('expires_at = ?'); params.push(expiresAt); }

        if (fields.length === 0) return null;

        query += fields.join(', ') + ' WHERE user_id = ?';
        params.push(userId);

        await pool.execute(query, params);
        return await this.getCredit(userId);
    }

    // --- Payment Management Methods ---

    async createPayment(paymentData) {
        const pool = getMySQLPool();
        const { orderId, amount, currency, status, receipt, userId, userEmail, planType } = paymentData;

        await pool.execute(
            'INSERT INTO resume_payments (order_id, amount, currency, status, user_id, user_email, plan_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [orderId, amount, currency, status || 'created', userId, userEmail, planType]
        );
    }

    async getPaymentByOrderId(orderId) {
        const pool = getMySQLPool();
        const [rows] = await pool.execute('SELECT * FROM resume_payments WHERE order_id = ?', [orderId]);
        return rows[0] || null;
    }

    async updatePaymentStatus(orderId, paymentId, signature, status) {
        const pool = getMySQLPool();
        await pool.execute(
            'UPDATE resume_payments SET payment_id = ?, signature = ?, status = ? WHERE order_id = ?',
            [paymentId, signature, status, orderId]
        );
    }
}

export default new MySQLAuthService();
