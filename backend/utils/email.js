const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject,
    html,
  });
};

const otpEmailTemplate = (otp, type = 'verify') => {
  const title = type === 'verify' ? 'Email Verification' : 'Password Reset';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: #1a1a2e; padding: 30px; border-radius: 8px; text-align: center;">
        <h1 style="color: #e94560; margin: 0;">Pooja Enterprises</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
        <h2 style="color: #333;">${title}</h2>
        <p style="color: #666;">Your OTP code is:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #e94560;">${otp}</span>
        </div>
        <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
};

module.exports = { sendEmail, otpEmailTemplate };