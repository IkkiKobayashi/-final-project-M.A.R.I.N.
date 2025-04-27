const nodemailer = require("nodemailer");
const config = require("../config/config");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
    });
  }

  async sendWelcomeEmail(user, tempPassword) {
    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: "Welcome to MARIN - Your Account Details",
      html: `
        <h1>Welcome to MARIN</h1>
        <p>Hello ${user.name},</p>
        <p>Your account has been created successfully. Here are your login details:</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
        <p>Best regards,<br>MARIN Team</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.server.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: "MARIN - Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>MARIN Team</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendLowStockAlert(store, products) {
    const mailOptions = {
      from: config.email.from,
      to: store.manager.email,
      subject: "MARIN - Low Stock Alert",
      html: `
        <h1>Low Stock Alert</h1>
        <p>Hello ${store.manager.name},</p>
        <p>The following products are running low on stock:</p>
        <ul>
          ${products
            .map(
              (p) => `
            <li>
              ${p.name} - Current stock: ${p.quantity}
              (Below threshold: ${p.threshold})
            </li>
          `
            )
            .join("")}
        </ul>
        <p>Please review and restock as needed.</p>
        <p>Best regards,<br>MARIN Team</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendExpiryAlert(store, products) {
    const mailOptions = {
      from: config.email.from,
      to: store.manager.email,
      subject: "MARIN - Product Expiry Alert",
      html: `
        <h1>Product Expiry Alert</h1>
        <p>Hello ${store.manager.name},</p>
        <p>The following products are nearing their expiry date:</p>
        <ul>
          ${products
            .map(
              (p) => `
            <li>
              ${p.name} - Expires on: ${new Date(
                p.expiryDate
              ).toLocaleDateString()}
              (${p.quantity} units)
            </li>
          `
            )
            .join("")}
        </ul>
        <p>Please take necessary action.</p>
        <p>Best regards,<br>MARIN Team</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendSupportTicketNotification(ticket, type) {
    const subject =
      type === "new"
        ? "New Support Ticket Created"
        : type === "update"
        ? "Support Ticket Updated"
        : "Support Ticket Resolved";

    const mailOptions = {
      from: config.email.from,
      to: ticket.createdBy.email,
      subject: `MARIN - ${subject}`,
      html: `
        <h1>${subject}</h1>
        <p>Hello ${ticket.createdBy.name},</p>
        ${
          type === "new"
            ? "<p>Your support ticket has been created successfully.</p>"
            : type === "update"
            ? "<p>Your support ticket has been updated.</p>"
            : "<p>Your support ticket has been resolved.</p>"
        }
        <p><strong>Ticket Details:</strong></p>
        <ul>
          <li>Ticket ID: ${ticket._id}</li>
          <li>Subject: ${ticket.subject}</li>
          <li>Status: ${ticket.status}</li>
          ${
            ticket.assignedTo
              ? `<li>Assigned To: ${ticket.assignedTo.name}</li>`
              : ""
          }
        </ul>
        <p>You can view the ticket details in your support dashboard.</p>
        <p>Best regards,<br>MARIN Team</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
