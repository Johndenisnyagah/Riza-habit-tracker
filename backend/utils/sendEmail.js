import nodemailer from "nodemailer";

/**
 * ============================================================================
 * EMAIL UTILITY
 * ============================================================================
 *
 * Purpose:
 * - Handles sending emails from the backend
 * - Supports SMTP configuration via environment variables
 * - Provides a console fallback for local testing without SMTP credentials
 *
 * Environment Variables:
 * - SMTP_HOST: The hostname of the SMTP server
 * - SMTP_PORT: The port of the SMTP server
 * - SMTP_USER: The username for SMTP authentication
 * - SMTP_PASS: The password for SMTP authentication
 * - FROM_EMAIL: The email address to appear in the "From" field
 */

const sendEmail = async (options) => {
  // Check if SMTP credentials are provided
  const useSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (useSMTP) {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.FROM_EMAIL || "Riza Habit Tracker <noreply@riza.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.email} via SMTP`);
  } else {
    // Fallback for local testing: log the email content to the terminal
    console.log("============================================================");
    console.log("📧 LOCAL EMAIL FALLBACK (SMTP not configured)");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    if (options.html) {
      console.log("--- HTML CONTENT ---");
      console.log(options.html);
    }
    console.log("============================================================");
  }
};

export default sendEmail;
