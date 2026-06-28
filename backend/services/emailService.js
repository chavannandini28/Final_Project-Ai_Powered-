import { google } from 'googleapis';

// Gmail API OAuth2 setup
const getGmailClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

// Create email in RFC 2822 format
const createEmail = ({ to, subject, html, text }) => {
  const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  
  const messageParts = [
    `From: ${emailFrom}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html
  ];
  
  const message = messageParts.join('\n');
  
  // Encode to base64url
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return encodedMessage;
};

// Send email using Gmail API (HTTP-based, works on Railway)
const sendWithGmailAPI = async ({ to, subject, html, text }) => {
  const gmail = getGmailClient();
  const encodedMessage = createEmail({ to, subject, html, text });

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });

  return { success: true, messageId: response.data.id };
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const emailService = process.env.EMAIL_SERVICE || 'development';

    // Development mode - just log to console
    if (emailService === 'development' || !emailService) {
      console.log('📧 Email (Development Mode):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Body: ${text || html}`);
      console.log('   Note: Configure EMAIL_SERVICE in .env to send real emails');
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    // Use Gmail API with OAuth2 (HTTP-based, works on Railway)
    if (emailService === 'gmail') {
      return await sendWithGmailAPI({ to, subject, html, text });
    }

    throw new Error('Email service not configured. Set EMAIL_SERVICE=gmail');
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL}/ResetPassword?token=${resetToken}`;
  
  const subject = 'Password Reset Request - AI Power Tours';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || 'there'},</p>
          
          <p>We received a request to reset your password for your AI Power Tours account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in <strong>10 minutes</strong></li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>
          
          <p>If you need help, contact us at ${process.env.EMAIL_SUPPORT || 'support@aipowertours.com'}</p>
          
          <p>Best regards,<br><strong>AI Power Tours Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Power Tours. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Password Reset Request - AI Power Tours

Hi ${userName || 'there'},

We received a request to reset your password for your AI Power Tours account.

Click this link to reset your password:
${resetUrl}

⚠️ Important:
- This link will expire in 10 minutes
- If you didn't request this, please ignore this email
- Your password won't change until you create a new one

If you need help, contact us at ${process.env.EMAIL_SUPPORT || 'support@aipowertours.com'}

Best regards,
AI Power Tours Team

© ${new Date().getFullYear()} AI Power Tours. All rights reserved.
  `;

  return sendEmail({ to: email, subject, html, text });
};

// Send welcome email
export const sendWelcomeEmail = async (email, userName) => {
  const subject = 'Welcome to AI Power Tours! 🎉';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Welcome to AI Power Tours!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Welcome aboard! We're excited to help you plan your next adventure with the power of AI.</p>
          
          <h3>🎯 What you can do:</h3>
          
          <div class="feature">
            <strong>🤖 AI Trip Planning</strong><br>
            Let our AI create personalized itineraries based on your preferences
          </div>
          
          <div class="feature">
            <strong>🏨 Smart Hotel Search</strong><br>
            Find the perfect accommodation with real-time pricing and availability
          </div>
          
          <div class="feature">
            <strong>✈️ Flight & Transport</strong><br>
            Compare flights, buses, and trains all in one place
          </div>
          
          <div class="feature">
            <strong>📦 Package Deals</strong><br>
            Discover curated travel packages at amazing prices
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/Dashboard" class="button">Start Planning Your Trip</a>
          </div>
          
          <p>Need help getting started? Check out our <a href="${process.env.FRONTEND_URL}/AIAssistant">AI Assistant</a>!</p>
          
          <p>Happy travels! 🌍<br><strong>AI Power Tours Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Power Tours. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (email, userName, bookingDetails) => {
  const subject = `Booking Confirmed - ${bookingDetails.type} #${bookingDetails.bookingId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Great news! Your booking has been confirmed.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span><strong>Booking ID:</strong></span>
              <span>#${bookingDetails.bookingId}</span>
            </div>
            <div class="detail-row">
              <span><strong>Type:</strong></span>
              <span>${bookingDetails.type}</span>
            </div>
            <div class="detail-row">
              <span><strong>Amount:</strong></span>
              <span>$${bookingDetails.amount}</span>
            </div>
            <div class="detail-row">
              <span><strong>Status:</strong></span>
              <span style="color: #22c55e; font-weight: bold;">CONFIRMED</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/Dashboard" class="button">View My Bookings</a>
          </div>
          
          <p>We've sent all the details to your email. Have a wonderful trip!</p>
          
          <p>Safe travels! ✈️<br><strong>AI Power Tours Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Power Tours. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email, userName) => {
  const loginUrl = `${process.env.FRONTEND_URL}/Login`;
  
  const subject = 'Password Reset Successful - AI Power Tours';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .success-box { background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
        .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Reset Successful!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || 'there'},</p>
          
          <div class="success-box">
            <strong>🎉 Great news!</strong>
            <p>Your password has been successfully reset for your AI Power Tours account.</p>
          </div>
          
          <p>You can now log in with your new password.</p>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login Now</a>
          </div>
          
          <div class="warning-box">
            <strong>⚠️ Didn't reset your password?</strong>
            <p>If you didn't make this change, please contact us immediately at ${process.env.EMAIL_SUPPORT || 'support@aipowertours.com'}</p>
          </div>
          
          <p>Best regards,<br><strong>AI Power Tours Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Power Tours. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Password Reset Successful - AI Power Tours

Hi ${userName || 'there'},

Great news! Your password has been successfully reset for your AI Power Tours account.

You can now log in with your new password: ${loginUrl}

Didn't reset your password?
If you didn't make this change, please contact us immediately at ${process.env.EMAIL_SUPPORT || 'support@aipowertours.com'}

Best regards,
AI Power Tours Team

© ${new Date().getFullYear()} AI Power Tours. All rights reserved.
  `;

  return sendEmail({ to: email, subject, html, text });
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail
};
