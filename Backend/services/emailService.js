const nodemailer = require('nodemailer');
/* Email Service
 * Handles sending emails using Nodemailer and Gmail SMTP via environment variables
 */
class EmailService {
  constructor() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    this.smtpUser = smtpUser;
    this.isConfigured = Boolean(smtpUser && smtpPass);

    if (!this.isConfigured) {
      this.transporter = null;
      console.warn('[EmailService] SMTP is not configured. Set SMTP_USER and SMTP_PASS to enable email sending.');
      return;
    }

    const transportConfig = smtpHost
      ? {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }
      : {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      };

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async sendEmail(to, subject, message, inReplyTo = null) {
    try {
      if (!this.isConfigured || !this.transporter) {
        return {
          success: false,
          code: 'EMAIL_NOT_CONFIGURED',
          error: 'Email service is not configured. Set SMTP_USER and SMTP_PASS.',
        };
      }

      if (!to || !subject || !message) {
        return {
          success: false,
          code: 'EMAIL_INVALID_PAYLOAD',
          error: 'Missing required fields: to, subject, message',
        };
      }

      console.log(`[EmailService] 📧 Sending email to: ${to}`);
      console.log(`[EmailService] 📝 Subject: ${subject}`);

      const mailOptions = {
        from: this.smtpUser || 'no-reply@example.com',
        to: to,
        subject: subject,
        text: message
      };

      if (inReplyTo) {
        mailOptions.inReplyTo = inReplyTo;
        mailOptions.references = [inReplyTo];
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully to ${to}, Message ID: ${info.messageId}`);

      return { success: true, messageId: info.messageId, code: 'EMAIL_SENT' };
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
      return { success: false, code: 'EMAIL_SEND_FAILED', error: error.message };
    }
  }
}

module.exports = new EmailService();