
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function setupDatabase() {
    const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
    };

    try {
        // Connect without database selected
        console.log('Connecting to MySQL server...');
        const connection = await mysql.createConnection(config);

        console.log("Creating database 'candidates' if not exists...");
        await connection.query("CREATE DATABASE IF NOT EXISTS candidates");

        console.log("Switching to database 'candidates'...");
        await connection.changeUser({ database: 'candidates' });

        console.log("Creating 'candidates' table if not exists...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS candidates (
                id BINARY(16) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                last_login DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log("Creating 'resume_credits' table if not exists...");
        await connection.query(`
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

        console.log("Creating 'resume_payments' table if not exists...");
        await connection.query(`
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

        console.log("Database and all tables setup complete!");
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
