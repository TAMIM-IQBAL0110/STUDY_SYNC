// utilities/verficationEmail.js - Using Brevo for email delivery
import dotenv from "dotenv";
dotenv.config();

import SibApiV3Sdk from "brevo";

// Initialize Brevo
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
console.log("📧 BREVO_API_KEY loaded?", process.env.BREVO_API_KEY ? "Yes" : "NOT SET");

// Use the verified sender email from Brevo account
const senderEmail = process.env.BREVO_SENDER_EMAIL || "tamimiqbalacademic@gmail.com";
const senderName = "StudySync";
console.log("📧 Sender Email:", senderEmail);

// Create and export function to generate verification email
export const createVerificationMail = (email, name, verificationCode, verifyLink) => ({
  to: [{ email: email, name: name }],
  sender: { name: senderName, email: senderEmail },
  subject: "Your StudySync Verification Code",
  htmlContent: `
    <h2>Hello ${name},</h2>
    <p>Your verification code is:</p>
    <h1 style="color: #2E86C1;">${verificationCode}</h1>
    <p>This code will expire in 15 minutes.</p>
    <p>Or click below to verify directly:</p>
    <a href="${verifyLink}" style="color: #2E86C1; text-decoration: none;">Verify Account</a>
  `,
});

// Send email helper function using Brevo
export const sendEmail = async (mailOption) => {
  try {
    console.log("📧 Sending email to:", mailOption.to[0].email);
    console.log("📧 From:", mailOption.sender.email);
    console.log("📧 Subject:", mailOption.subject);
    
    const response = await apiInstance.sendTransacEmail(mailOption);
    
    console.log("✅ Email sent successfully:", response.messageId);
    return { success: true, info: response };
  } catch (error) {
    console.error("❌ Error sending email:", error.message || error);
    console.error("❌ Full error:", JSON.stringify(error, null, 2));
    return { success: false, error };
  }
};