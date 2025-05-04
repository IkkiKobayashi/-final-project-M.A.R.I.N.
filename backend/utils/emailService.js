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

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${config.server.frontendUrl}/verify/${token}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h1>Welcome to MARIN</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
