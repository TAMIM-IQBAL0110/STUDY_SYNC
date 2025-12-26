// utilities/verficationEmail.js
import dotenv from "dotenv";
dotenv.config();

import sgMail from "@sendgrid/mail";

// Initialize SendGrid
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
  console.log("✅ SendGrid initialized");
} else {
  console.error("❌ SENDGRID_API_KEY not set in environment variables");
}

const senderEmail = process.env.SENDER_EMAIL || "noreply@studysync.com";
console.log("📧 Sender Email:", senderEmail);

// Create and export function to generate verification email
export const createVerificationMail = (email, name, verificationCode, verifyLink) => ({
  to: email,
  from: senderEmail,
  subject: "Your StudySync Verification Code",
  html: `
    <h2>Hello ${name},</h2>
    <p>Your verification code is:</p>
    <h1 style="color: #2E86C1;">${verificationCode}</h1>
    <p>This code will expire in 15 minutes.</p>
    <p>Or click below to verify directly:</p>
    <a href="${verifyLink}" style="color: #2E86C1; text-decoration: none;">Verify Account</a>
  `,
});

// Send email helper function
export const sendEmail = async (mailOption) => {
  try {
    console.log("📧 Sending email to:", mailOption.to);
    const info = await sgMail.send(mailOption);
    console.log("✅ Email sent successfully");
    return { success: true, info };
  } catch (error) {
    console.error("❌ Error sending email:", error.message || error);
    if (error.response) {
      console.error("❌ SendGrid response:", error.response.body);
    }
    return { success: false, error };
  }
};