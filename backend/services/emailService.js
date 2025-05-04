const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
});

const emailService = {
  async sendWelcomeEmail(user, verificationToken) {
    const verificationUrl = `${config.server.frontendUrl}/verify.html?token=${verificationToken}`;

    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: "Welcome to MARIN - Verify Your Email",
      html: `
        <h1>Welcome to MARIN</h1>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>MARIN Team</p>
      `,
    };

    return transporter.sendMail(mailOptions);
  },
};

module.exports = emailService;
