import nodemailer from 'nodemailer';

// Configure transporter
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // OPTIMIZATIONS FOR RENDER/CLOUD
    family: 4, // Force IPv4 (Fixes Gmail IPv6 timeouts on cloud)
    logger: true, // Log SMTP info for debugging
    debug: true, // Show debug output
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

/**
 * Sends a 6-digit OTP to the specified email address.
 * Falls back to console logging if SMTP credentials are not configured.
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTP = async (email, otp) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn(`[EmailService] SMTP credentials missing. Logging OTP for development:`);
            console.log(`\n--------------------------------------------`);
            console.log(`| OTP FOR ${email}: ${otp} |`);
            console.log(`--------------------------------------------\n`);
            return;
        }

        const mailOptions = {
            from: `"KareerGrowth Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Email Verification OTP - KareerGrowth',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4F46E5; text-align: center;">KareerGrowth</h2>
                    <h3>Verify Your Email</h3>
                    <p>Hello,</p>
                    <p>Thank you for registering with KareerGrowth. Please use the following One-Time Password (OTP) to complete your registration:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; 2026 KareerGrowth. All rights reserved.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EmailService] OTP sent successfully to ${email}`);
    } catch (error) {
        console.error(`[EmailService] Failed to send OTP to ${email}:`, error);
        // We log the OTP anyway so the developer isn't stuck
        console.log(`[EmailService] [FALLBACK] OTP FOR ${email}: ${otp}`);
    }
};
