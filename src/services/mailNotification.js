const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const mailConfigurations = {
      from: `Jasz & Co <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };
    transporter.sendMail(mailConfigurations, function (error, info) {
      if (error) return reject(error);
      return resolve(info);
    });
  });
};

module.exports = {

  welcomeMail: async (user) => {
    try {
      console.log("Sending welcome email to:", user.email);

      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; border: 1px solid #ddd;">
          <div style="text-align: center;">
            <h2 style="color: #127300;">Welcome to Jasz & Co!</h2>
            <p style="color: #555; font-size: 15px;">We're excited to have you join us!</p>
          </div>

          <p>Dear ${user.name} ,</p>

          <p>Thank you for creating your account with <strong>Jasz & Co</strong>. We’re happy to be your trusted place for quality and service.</p>

          <p><strong>Your registered email:</strong> ${user.email}</p>

          <div style="background-color: #e9f8ec; padding: 15px; border-left: 4px solid #127300; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0;">Explore a seamless shopping experience with us!</p>
          </div>

          <p>If you need any help, feel free to contact our team.</p>

          <p style="margin-top: 25px;">Warm regards,<br/><strong style="color: #127300;">The Jasz & Co Team</strong></p>

          <div style="margin-top: 40px; font-size: 12px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </div>`;

      await sendMail(user.email, "Welcome to Jasz & Co!", html);
    } catch (err) {
      console.error("Error sending welcome email:", err);
      throw new Error("Failed to send welcome email");
    }
  },

  sendOTPmail: async ({ email, code }) => {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #127300; text-align: center;">Verify Your Email</h2>
          <p>Hello,</p>
          <p>Welcome to <strong>Jasz & Co</strong>!</p>
          <p>Your one-time password (OTP) is: <strong>${code}</strong></p>
          <p>This code will expire in 5 minutes.</p>
          <p>Thanks,<br/><strong style="color: #127300;">The Jasz & Co Team</strong></p>
        </div>
      </div>`;

      return await sendMail(email, "Your OTP Code - Jasz & Co", html);
    } catch (err) {
      console.error(err);
      throw new Error("Could not send OTP mail");
    }
  },

  passwordChange: async ({ email }) => {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #127300;">Password Changed</h2>
          <p>Hello ${email},</p>
          <p>Your password was recently changed.</p>
          <p>If this wasn’t you, please contact our support team immediately.</p>
          <p style="margin-top: 25px;">Regards,<br/><strong style="color: #127300;">The Jasz & Co Team</strong></p>
        </div>
      </div>`;

      return await sendMail(email, "Password Change Notification - Jasz & Co", html);
    } catch (err) {
      throw new Error("Could not send password change mail");
    }
  },

  orderDelivered: async ({ email, orderId }) => {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #127300;">Your Order Has Been Delivered</h2>
          <p>Hello,</p>
          <p>Your order with Order ID: <strong>${orderId}</strong> has been successfully delivered.</p>

          <div style="background-color: #e9f8ec; padding: 15px; border-left: 4px solid #127300; border-radius: 5px;">
            <p><strong>Need Help?</strong></p>
            <ul>
              <li>If you find any issue with your order, please email us within <strong>24 hours</strong>.</li>
              <li>Attach any relevant photos or videos to speed up the resolution.</li>
              <li><strong>Note:</strong> We do not accept returns for perishable items.</li>
            </ul>
          </div>

          <p style="margin-top: 25px;">Thank you for shopping with us!</p>
          <p><strong style="color: #127300;">Jasz & Co Team</strong></p>
        </div>
      </div>`;

      return await sendMail(email, `Order Delivered - ID: ${orderId}`, html);
    } catch (err) {
      console.error("Error sending delivery email:", err);
      throw new Error("Could not send delivery notification");
    }
  }

};
