import { SendMailClient } from "zeptomail";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure ZeptoMail Client
const url = "https://api.zeptomail.in/v1.1/email";
const token = "Zoho-enczapikey PHtE6r0OQ7zqizMm90IA7PS6RcOtYIl/qetgeVNE5t0XDvEKS01Xr48omzC2/U0pVqRDHf+byIprteybsb/RdD7kMT1KVWqyqK3sx/VYSPOZsbq6x00csF0bf03aU4Xvctdv0i3QvNfaNA==";

let client = new SendMailClient({ url, token });

/**
 * Sends a 6-digit OTP to the specified email address using ZeptoMail.
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTP = async (email, otp) => {
    try {
        // Read logo file
        let logoContent = "";
        try {
            const logoPath = path.join(__dirname, '../../client/src/assets/ailogo.png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                logoContent = logoBuffer.toString('base64');
            } else {
                console.warn(`[EmailService] Logo file not found at ${logoPath}`);
            }
        } catch (err) {
            console.error("[EmailService] Failed to read logo file:", err);
        }

        const mailOptions = {
            "from":
            {
                "address": "noreply@systemmindz.com",
                "name": "Profilet-ai"
            },
            "to":
                [
                    {
                        "email_address":
                        {
                            "address": email,
                            // extracting name from email or using a default since name is required format in provided snippet
                            "name": email.split('@')[0]
                        }
                    }
                ],
            "subject": "Email Verification OTP - Profilet-ai",
            "htmlbody": `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                         ${logoContent ? '<img src="cid:logo" alt="Profilet-ai Logo" style="width: 50px; height: 50px; vertical-align: middle; margin-right: 10px;">' : ''}
                        <span style="font-size: 24px; font-weight: bold; vertical-align: middle;"><span style="color: #000000;">Profilet</span><span style="color: #4F46E5;">-ai</span></span>
                    </div>
                    <h3 style="text-align: center;">Verify Your Email</h3>
                    <p>Hello,</p>
                    <p>Thank you for registering with Profilet-ai. Please use the following One-Time Password (OTP) to complete your registration:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; 2026 Profilet-ai. All rights reserved.</p>
                </div>
            `,
            "inline_images": logoContent ? [
                {
                    "cid": "logo",
                    "content": logoContent,
                    "mime_type": "image/png"
                }
            ] : []
        };

        await client.sendMail(mailOptions);
        console.log(`[EmailService] OTP sent successfully to ${email}`);
    } catch (error) {
        console.error(`[EmailService] Failed to send OTP to ${email}:`, error);
        // Fallback logging for development
        console.log(`[EmailService] [FALLBACK] OTP FOR ${email}: ${otp}`);
    }
};
