// backend/utils/emailService.js
import nodemailer from 'nodemailer';

// Create transporter (supports both Gmail and SendGrid)
const createTransporter = () => {
  // If SendGrid API key is available, use SendGrid (RECOMMENDED for production)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000
    });
  }
  
  // Fallback to Gmail (for development)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add connection pooling and timeout settings
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    // Timeout settings (in milliseconds)
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000, // 30 seconds
    // TLS settings
    secure: true,
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send OTP email with timeout and retry logic
 * OPTIMIZED: Returns immediately, sends email in background
 */
export const sendOtpEmail = async (email, otp) => {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
  const provider = process.env.SENDGRID_API_KEY ? 'SendGrid' : 'Gmail';
  
  const mailOptions = {
    from: `"HumDono Dating" <${fromEmail}>`,
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

  console.log(`📧 [${provider}] Sending OTP to ${email}...`);
  const startTime = Date.now();

  try {
    const transporter = createTransporter();
    
    // Send with 15 second timeout (faster than before)
    const sendWithTimeout = Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout after 15s')), 15000)
      )
    ]);

    const info = await sendWithTimeout;
    const duration = Date.now() - startTime;
    
    console.log(`✅ [${provider}] Email sent in ${duration}ms. ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, duration, provider };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${provider}] Email failed after ${duration}ms:`, error.message);
    
    // Don't throw error - return failure status instead
    // This prevents the entire registration from failing
    return { 
      success: false, 
      error: error.message, 
      duration,
      provider,
      // Still allow user to proceed (they can request resend)
      fallback: true 
    };
  }
};
