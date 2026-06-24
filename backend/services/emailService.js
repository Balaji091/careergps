import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Trim environment variables to prevent Windows trailing carriage return (\r) issues
const emailHost = (process.env.EMAIL_HOST || '').trim();
const emailPort = Number((process.env.EMAIL_PORT || '').trim() || 587);
const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').trim();
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').trim();

// Create SMTP Transporter
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465, // true for port 465, false for 587
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false, // Avoid failures with local SMTP or self-signed certs
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[EMAIL SERVICE ERROR] SMTP connection failed:', error.message);
  } else {
    console.log('[EMAIL SERVICE] SMTP connection verified successfully. Ready to send emails.');
  }
});

/**
 * Standard CSS-styled HTML template wrapper for Career GPS brand consistency
 */
const getHtmlWrapper = (title, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 40px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
      padding: 32px;
      text-align: center;
    }
    .logo-text {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .logo-text span {
      background: linear-gradient(to right, #38BDF8, #818CF8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .body {
      padding: 40px 32px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563EB;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
      transition: background-color 0.2s ease;
    }
    .btn:hover {
      background-color: #1D4ED8;
    }
    .link-fallback {
      background-color: #F1F5F9;
      border-radius: 8px;
      padding: 16px;
      margin-top: 32px;
    }
    .link-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748B;
      margin-bottom: 8px;
    }
    .link-url {
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      word-break: break-all;
      color: #2563EB;
    }
    .footer {
      padding: 24px 32px;
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h2 class="logo-text"><span>Career</span> GPS</h2>
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <p class="footer-text">This is an automated notification from Career GPS. Please do not reply directly to this email.</p>
        <p class="footer-text" style="margin-top: 8px;">© ${new Date().getFullYear()} Career GPS. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send Email Verification link to registered user
 */
export const sendVerificationEmail = async (toEmail, name, token) => {
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
  
  const contentHtml = `
    <h1>Verify your email address</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Welcome to Career GPS! To complete your registration and activate your personalized learning dashboard, please verify your email address by clicking the button below:</p>
    
    <div class="btn-container">
      <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
    </div>
    
    <p>If you did not sign up for a Career GPS account, you can safely ignore this email.</p>
    
    <div class="link-fallback">
      <div class="link-label">If the button doesn't work, copy and paste this URL into your browser:</div>
      <div class="link-url">${verificationUrl}</div>
    </div>
  `;

  const mailOptions = {
    from: `"Career GPS" <${emailUser}>`,
    to: toEmail,
    subject: 'Verify your Career GPS account',
    html: getHtmlWrapper('Verify your Career GPS account', contentHtml),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send verification email to ${toEmail}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

/**
 * Send Password Reset token link
 */
export const sendPasswordResetEmail = async (toEmail, name, token) => {
  const resetUrl = `${clientUrl}/forgot-password?token=${token}`;
  
  const contentHtml = `
    <h1>Reset your password</h1>
    <p>Hi ${name || 'there'},</p>
    <p>We received a request to reset the password for your Career GPS account. Click the button below to choose a new password:</p>
    
    <div class="btn-container">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </div>
    
    <p>This password reset link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
    
    <div class="link-fallback">
      <div class="link-label">If the button doesn't work, copy and paste this URL into your browser:</div>
      <div class="link-url">${resetUrl}</div>
    </div>
  `;

  const mailOptions = {
    from: `"Career GPS" <${emailUser}>`,
    to: toEmail,
    subject: 'Reset your Career GPS password',
    html: getHtmlWrapper('Reset your Career GPS password', contentHtml),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Password reset email sent to ${toEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send password reset email to ${toEmail}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};
