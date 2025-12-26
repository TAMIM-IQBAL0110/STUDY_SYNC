
// utilits/verficationEmail.js
import dotenv from "dotenv";
dotenv.config();  // ensures env variables are loaded


import nodemailer from "nodemailer";

// 🔹 Debug: check env variables
console.log("📧 EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
console.log("📧 EMAIL_PASS loaded?", process.env.EMAIL_PASS ? "Yes (hidden)" : "NOT SET");


// configure nodemailer transporter and export it
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message || error);
  } else {
    console.log("✅ Email transporter ready");
  }
});

// Create and export function to generate verification email
export const createVerificationMail = (email, name, verificationCode,verifyLink) => ({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Your StudySync Verification Code",
  html: `
    <h2>Hello ${name},</h2>
    <p>Your verification code is:</p>
    <h1 style="color: #2E86C1;">${verificationCode}</h1>
    <p>This code will expire in 15 minutes.</p>
    <p>Or click below to verify directly:</p>
    <a href="${verifyLink}" style="color: #2E86C1;">Verify Account</a>
  `,
});

// Send email helper function
export const sendEmail = async (mailOption) => {
  try {
    console.log("📧 Sending email to:", mailOption.to);
    const info = await transporter.sendMail(mailOption);
    console.log("✅ Email sent successfully:", info.response);
    return { success: true, info };
  } catch (error) {
    console.error("❌ Error sending email:", error.message || error);
    return { success: false, error };
  }
};