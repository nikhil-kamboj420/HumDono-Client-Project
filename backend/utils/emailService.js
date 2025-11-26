// backend/utils/emailService.js
import nodemailer from 'nodemailer';

// Create transporter (using Gmail)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send OTP email
 */
export const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"HumDono Dating" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your HumDono Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #cc0033;">Welcome to HumDono! 💕</h2>
          <p>Your verification code is:</p>
          <div style="background: #ffebf1; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="color: #cc0033; font-size: 36px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email from HumDono Dating App.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send email');
  }
};
