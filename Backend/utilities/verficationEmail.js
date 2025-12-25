
// utilits/verficationEmail.js
import dotenv from "dotenv";
dotenv.config();  // ensures env variables are loaded


import nodemailer from "nodemailer";

// // 🔹 Debug: check env variables
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS loaded?", process.env.EMAIL_PASS ? "Yes" : "No");


// configure nodemailer transporter and export it
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
    const info = await transporter.sendMail(mailOption);
    return { success: true, info };
  } catch (error) {
    console.log("Error sending email:", error);
    return { success: false, error };
  }
};