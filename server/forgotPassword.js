/**
 * ==========================================
 * FarmConnect - Forgot Password System
 * ==========================================
 * Complete password reset with OTP via email
 * Dynamic email sending to customer's email
 * ==========================================
 */

const express = require('express');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// GMAIL SMTP CONFIGURATION
// ==========================================
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: 'seadimurad88@gmail.com',
        pass: 'pemkkrbqhavqexyf'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Gmail SMTP Connection Failed:', error.message);
    } else {
        console.log('✅ Gmail SMTP Server is ready to send emails');
    }
});

// ==========================================
// HELPER FUNCTION: Generate 6-digit OTP
// ==========================================
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==========================================
// ENDPOINT 1: FORGOT PASSWORD
// POST /api/forgot-password
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validation: Check if email is provided
        if (!email || !email.trim()) {
            return res.status(400).json({ 
                message: "Email is required" 
            });
        }

        console.log(`[FORGOT PASSWORD] Request for email: ${email}`);

        // Step 1: Check if user exists in database
        const user = await prisma.user.findUnique({ 
            where: { email: email.toLowerCase().trim() } 
        });

        // IF USER DOES NOT EXIST - Stop and return 404 (Process terminates here, no email sent)
        if (!user) {
            console.log(`[FORGOT PASSWORD] ❌ Email not found: ${email}`);
            return res.status(404).json({ 
                message: "This email is not registered!" 
            });
        }

        // IF USER EXISTS - Proceed with OTP generation and email sending
        console.log(`[FORGOT PASSWORD] ✅ User found: ${user.name} (${user.email})`);

        // Step 2: Generate random 6-digit OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        console.log(`[FORGOT PASSWORD] 🔢 Generated OTP: ${otp} (expires in 10 minutes)`);

        // Step 3: Update database with OTP and expiration
        await prisma.user.update({
            where: { email: email.toLowerCase().trim() },
            data: {
                resetPasswordToken: otp,
                resetPasswordExpires: expiresAt
            }
        });

        console.log(`[FORGOT PASSWORD] 💾 OTP saved to database for: ${email}`);

        // Step 4: Send OTP email STRICTLY to the customer's specific email address
        const mailOptions = {
            from: '"FarmConnect Password Reset" <seadimurad88@gmail.com>',
            to: email, // DYNAMIC - This is the customer's actual email from the input field
            subject: '🔐 Your Password Reset Code - FarmConnect',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header with gradient background -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🌾 FarmConnect
            </h1>
            <p style="color: #e0f2f1; font-size: 16px; margin: 12px 0 0 0; font-weight: 500;">
                Direct from Soil to Your Table
            </p>
        </div>
        
        <!-- Main content body -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <h2 style="color: #1f2937; font-size: 26px; font-weight: 600; margin: 0 0 16px 0;">
                Password Reset Request
            </h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Hello <strong style="color: #059669;">${user.name}</strong>,
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                We received a request to reset your password. Use the verification code below to proceed with resetting your password:
            </p>
            
            <!-- OTP Code Display Box -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 3px solid #059669; border-radius: 16px; padding: 40px; text-align: center; margin: 0 0 32px 0;">
                <p style="color: #059669; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">
                    Your Verification Code
                </p>
                <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; display: inline-block; box-shadow: 0 4px 12px rgba(5,150,105,0.2);">
                    <h1 style="color: #047857; font-size: 48px; font-weight: 800; letter-spacing: 12px; margin: 0; font-family: 'Courier New', Courier, monospace;">
                        ${otp}
                    </h1>
                </div>
            </div>
            
            <!-- Warning Box -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 0 0 32px 0;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
                    ⚠️ <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>. For your security, please do not share this code with anyone.
                </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                If you didn't request this password reset, please ignore this email or contact our support team if you have any concerns.
            </p>
            
            <!-- Footer Section -->
            <div style="border-top: 2px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                    Need help? Contact us at <a href="mailto:seadimurad88@gmail.com" style="color: #059669; text-decoration: none; font-weight: 600;">seadimurad88@gmail.com</a>
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} FarmConnect. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
            `
        };

        // Send the email using Nodemailer
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`[FORGOT PASSWORD] ✅ Email sent successfully to: ${email}`);
        console.log(`[FORGOT PASSWORD] 📧 Message ID: ${info.messageId}`);

        // Return success response
        return res.status(200).json({ 
            message: "OTP sent successfully to your email"
        });

    } catch (error) {
        console.error('[FORGOT PASSWORD] Error:', error);
        
        // Check for specific email errors
        if (error.code === 'EAUTH') {
            console.error('[FORGOT PASSWORD] Gmail authentication failed!');
        } else if (error.code === 'ECONNECTION') {
            console.error('[FORGOT PASSWORD] Cannot connect to Gmail SMTP!');
        }
        
        return res.status(500).json({ 
            message: "Failed to send OTP. Please try again later."
        });
    }
});

// ==========================================
// ENDPOINT 2: VERIFY OTP
// POST /api/verify-otp
// ==========================================
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({ 
                message: "Email and OTP are required" 
            });
        }

        console.log(`[VERIFY OTP] Request for email: ${email}`);

        // Find user with matching email
        const user = await prisma.user.findUnique({ 
            where: { email: email.toLowerCase().trim() } 
        });

        // Check if user exists and has an active reset request
        if (!user || !user.resetPasswordToken) {
            console.log(`[VERIFY OTP] No active reset request for: ${email}`);
            return res.status(400).json({ 
                message: "No active password reset request found" 
            });
        }

        // Check if OTP has expired
        if (new Date() > new Date(user.resetPasswordExpires)) {
            console.log(`[VERIFY OTP] Expired OTP for: ${email}`);
            return res.status(400).json({ 
                message: "OTP code has expired. Please request a new one" 
            });
        }

        // Check if OTP matches
        if (user.resetPasswordToken !== otp.trim()) {
            console.log(`[VERIFY OTP] Incorrect OTP for: ${email}`);
            return res.status(400).json({ 
                message: "Incorrect OTP code" 
            });
        }

        console.log(`[VERIFY OTP] ✅ OTP verified successfully for: ${email}`);

        return res.status(200).json({ 
            message: "OTP verified successfully. You may proceed to reset your password" 
        });

    } catch (error) {
        console.error('[VERIFY OTP] Error:', error);
        return res.status(500).json({ 
            message: "Internal server error"
        });
    }
});

// ==========================================
// ENDPOINT 3: RESET PASSWORD
// POST /api/reset-password
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validation
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                message: "Email, OTP, and new password are required" 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long" 
            });
        }

        console.log(`[RESET PASSWORD] Request for email: ${email}`);

        // Find user
        const user = await prisma.user.findUnique({ 
            where: { email: email.toLowerCase().trim() } 
        });

        // Verify user exists and OTP matches
        if (!user || user.resetPasswordToken !== otp.trim()) {
            console.log(`[RESET PASSWORD] Invalid reset request for: ${email}`);
            return res.status(400).json({ 
                message: "Invalid verification state. Please request a new OTP" 
            });
        }

        // Check OTP expiry
        if (new Date() > new Date(user.resetPasswordExpires)) {
            console.log(`[RESET PASSWORD] Expired OTP for: ${email}`);
            return res.status(400).json({ 
                message: "Session expired. Please request a new OTP" 
            });
        }

        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP fields (set to null)
        await prisma.user.update({
            where: { email: email.toLowerCase().trim() },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        console.log(`[RESET PASSWORD] ✅ Password updated successfully for: ${email}`);

        return res.status(200).json({ 
            message: "Password has been successfully updated! You can now login with your new password" 
        });

    } catch (error) {
        console.error('[RESET PASSWORD] Error:', error);
        return res.status(500).json({ 
            message: "Failed to reset password. Please try again"
        });
    }
});

module.exports = router;
