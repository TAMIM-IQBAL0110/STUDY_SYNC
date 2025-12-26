// utilities/verficationEmail.js - Using Brevo for email delivery
import dotenv from "dotenv";
dotenv.config();

import SibApiV3Sdk from "sib-api-v3-sdk";

// Initialize Brevo
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = process.env.BREVO_KEY;
console.log("📧 BREVO_KEY loaded?", apiKey ? "Yes (length: " + apiKey.length + ")" : "NOT SET");
if (!apiKey) {
  console.error("❌ CRITICAL: BREVO_KEY is not set! Email sending will fail!");
}
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = apiKey;

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
    const keyLoaded = process.env.BREVO_KEY;
    console.log("📧 Brevo API Key set:", keyLoaded ? "Yes (length: " + keyLoaded.length + ")" : "NO");
    console.log("📧 API Key first 20 chars:", keyLoaded ? keyLoaded.substring(0, 20) : "NOT SET");
    console.log("📧 API Key last 10 chars:", keyLoaded ? keyLoaded.substring(keyLoaded.length - 10) : "NOT SET");
    
    const response = await apiInstance.sendTransacEmail(mailOption);
    
    console.log("✅ Email sent successfully!");
    console.log("✅ Message ID:", response?.messageId);
    return { success: true, info: response };
  } catch (error) {
    console.error("❌ Error sending email:", error.message || error);
    console.error("❌ Status code:", error.response?.statusCode);
    console.error("❌ Error body:", error.response?.body);
    console.error("❌ Full error details:", JSON.stringify(error, null, 2));
    return { success: false, error };
  }
};