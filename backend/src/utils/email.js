const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  }
  await transporter.sendMail(mailOptions)
}

const sendOTPEmail = async (email, otp, name) => {
  await sendEmail({
    to: email,
    subject: 'Umsebenzi - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B3A6B; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Umsebenzi</h1>
          <p style="color: #F97316; margin: 5px 0;">Africa's Work Ecosystem</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1B3A6B;">Hello ${name},</h2>
          <p>Your email verification OTP is:</p>
          <div style="background: #1B3A6B; color: white; font-size: 36px; 
                      font-weight: bold; text-align: center; padding: 20px; 
                      border-radius: 10px; letter-spacing: 10px;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP expires in <strong>10 minutes</strong>.</p>
          <p style="color: #666;">If you did not request this, please ignore this email.</p>
        </div>
        <div style="background: #1B3A6B; padding: 15px; text-align: center;">
          <p style="color: #aaa; margin: 0; font-size: 12px;">
            © 2026 Umsebenzi. All rights reserved.
          </p>
        </div>
      </div>
    `,
  })
}

const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Umsebenzi!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B3A6B; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Umsebenzi</h1>
          <p style="color: #F97316; margin: 5px 0;">Africa's Work Ecosystem</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1B3A6B;">Welcome ${name}! 🎉</h2>
          <p>Your registration is complete. Your next step is to visit your nearest <strong>PostNet branch</strong> within <strong>5 business days</strong> to complete your fingerprint verification.</p>
          <div style="background: #fff; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>What to bring:</strong></p>
            <p style="margin: 5px 0;">✅ Your South African ID / Passport</p>
            <p style="margin: 5px 0;">✅ Your Umsebenzi reference number</p>
          </div>
          <p>Find your nearest PostNet at <a href="https://www.postnet.co.za">www.postnet.co.za</a></p>
        </div>
        <div style="background: #1B3A6B; padding: 15px; text-align: center;">
          <p style="color: #aaa; margin: 0; font-size: 12px;">
            © 2026 Umsebenzi. All rights reserved.
          </p>
        </div>
      </div>
    `,
  })
}

const sendPostNetReminderEmail = async (email, name, refNumber, daysLeft) => {
  await sendEmail({
    to: email,
    subject: `Reminder: ${daysLeft} days left to visit PostNet`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B3A6B; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Umsebenzi</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1B3A6B;">Hi ${name},</h2>
          <p>This is a reminder that you have <strong style="color: #F97316;">${daysLeft} days left</strong> to visit PostNet for your fingerprint verification.</p>
          <p>Reference Number: <strong>${refNumber}</strong></p>
          <p>Find your nearest PostNet at <a href="https://www.postnet.co.za">www.postnet.co.za</a></p>
        </div>
      </div>
    `,
  })
}

const sendApprovalEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: '🎉 Your Umsebenzi Account is Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B3A6B; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Umsebenzi</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #10B981;">Congratulations ${name}! ✅</h2>
          <p>Your account has been approved. You can now login and start using Umsebenzi.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/login" 
               style="background: #F97316; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              Login Now
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

const sendDeclineEmail = async (email, name, reason) => {
  await sendEmail({
    to: email,
    subject: 'Umsebenzi - Verification Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B3A6B; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Umsebenzi</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1B3A6B;">Hi ${name},</h2>
          <p>After reviewing your verification results, we are unable to approve your account at this time.</p>
          <div style="background: #fff; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>If you believe this is an error, contact us at 
             <a href="mailto:support@umsebenzi.co.za">support@umsebenzi.co.za</a>
          </p>
        </div>
      </div>
    `,
  })
}

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPostNetReminderEmail,
  sendApprovalEmail,
  sendDeclineEmail,
}
