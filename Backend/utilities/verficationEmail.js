// utilities/verficationEmail.js
import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("📧 RESEND_API_KEY loaded?", process.env.RESEND_API_KEY ? "Yes" : "NOT SET");

const senderEmail = "tamimiqbalacademic@gmail.com";
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

// Send email helper function using Resend
export const sendEmail = async (mailOption) => {
  try {
    console.log("📧 Sending email to:", mailOption.to);
    console.log("📧 From:", mailOption.from);
    console.log("📧 Subject:", mailOption.subject);
    
    const response = await resend.emails.send(mailOption);
    
    if (response.error) {
      console.error("❌ Error sending email:", response.error.message);
      return { success: false, error: response.error };
    }
    
    console.log("✅ Email sent successfully:", response.data.id);
    return { success: true, info: response.data };
  } catch (error) {
    console.error("❌ Error sending email:", error.message || error);
    console.error("❌ Full error:", JSON.stringify(error, null, 2));
    return { success: false, error };
  }
};