import crypto from 'crypto';

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email, user, token) => {
  const verificationUrl = `${BASE_URL}/verify-email/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - GospelHub</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0A0A0A; color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #FACC15; font-size: 32px; margin: 0;">Gospel<span style="color: #FACC15;">Hub</span></h1>
        </div>
        
        <div style="background-color: #0f0f0f; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">Verify Your Email Address</h2>
          
          <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Hi ${user.name},
          </p>
          
          <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Thank you for joining GospelHub! Please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #FACC15, #FDE047); color: #000; padding: 16px 40px; border-radius: 30px; font-weight: 700; font-size: 16px; text-decoration: none;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #737373; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            This link will expire in 24 hours. If you didn't create an account with GospelHub, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #737373; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} GospelHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email Address - GospelHub
    
    Hi ${user.name},
    
    Thank you for joining GospelHub! Please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This link will expire in 24 hours. If you didn't create an account with GospelHub, please ignore this email.
  `;

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'nexoratech40@gmail.com',
        pass: 'qiuokodkngzuwati'
      }
    });

    await transporter.sendMail({
      from: '"GospelHub" <nexoratech40@gmail.com>',
      to: email,
      subject: 'Verify Your Email - GospelHub',
      text: text,
      html: html
    });
    
    console.log(`✓ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('✗ Failed to send email:', error.message);
    
    console.log('===========================================');
    console.log('EMAIL VERIFICATION (Fallback - Check console)');
    console.log('===========================================');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your Email - GospelHub`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('===========================================');
    return false;
  }
};

export const sendPasswordResetEmail = async (email, user, token) => {
  const resetUrl = `${BASE_URL}/reset-password/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - GospelHub</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #0A0A0A; color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #FACC15; font-size: 32px; margin: 0;">Gospel<span style="color: #FACC15;">Hub</span></h1>
        </div>
        
        <div style="background-color: #0f0f0f; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">Reset Your Password</h2>
          
          <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Hi ${user.name},
          </p>
          
          <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #FACC15, #FDE047); color: #000; padding: 16px 40px; border-radius: 30px; font-weight: 700; font-size: 16px; text-decoration: none;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #737373; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'nexoratech40@gmail.com',
        pass: 'qiuokodkngzuwati'
      }
    });

    await transporter.sendMail({
      from: '"GospelHub" <nexoratech40@gmail.com>',
      to: email,
      subject: 'Reset Your Password - GospelHub',
      text: `Reset your password: ${resetUrl}`,
      html: html
    });
    
    console.log(`✓ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('✗ Failed to send password reset email:', error.message);
    return false;
  }
};
