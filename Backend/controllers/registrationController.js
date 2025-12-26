import crypto from "crypto"
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import Verification from "../models/verification.js";
import { createVerificationMail,sendEmail} from "../utilities/verficationEmail.js";
import TempUser from "../models/tempUserSchem.js";

// Register user
export const registerUser = async (req, res) => {
    try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already verified
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }


    // Store temporary user (not yet verified)
    await TempUser.findOneAndUpdate(
      { email },
      { name, email, password},
      { upsert: true, new: true }
    );

    //Generate secure token and 6-digit verification code
    const token = crypto.randomBytes(32).toString("hex");
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    //Clear previous verifications
    await Verification.deleteMany({ email });

    //Save verification entry
    await Verification.create({ email, token, code });

    //Build verification link
    const verifyLink = `${process.env.CLIENT_URL}/verify?token=${token}&email=${email}`;

    // Send verification email (wait for it to complete so we see errors)
    try {
      const mailOption = createVerificationMail(email, name, code, verifyLink);
      const emailResult = await sendEmail(mailOption);
      console.log("Email result:", emailResult);
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    // Respond immediately
    return res.status(200).json({
      success: true,
      message: "Registration successful! Verification code sent to your email.",
      verifyLink,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
//verify register user
export const verifyUser = async (req, res) => {
    try{
        const {token} = req.query;
        const {code, email} = req.body;
        
        console.log("🔍 Verification attempt:", { token: token ? token.substring(0, 10) + '...' : 'none', code, email });
        
        // Check token and code
        if (!token && !code) {
            return res.status(400).json({ success: false, message: "Token or code is required" });
        }

        // Find verification record
        let verification;
        if (token) {
            console.log("✓ Looking up by token");
            verification = await Verification.findOne({ token });
        } 
        else if (code) {
            console.log("✓ Looking up by code:", code);
            verification = await Verification.findOne({ code });
        }

        if(!verification){
            console.warn("❌ No verification record found");
            return res.status(400).json({success: false, message:"Invalid or expired verification code"});
        }
        
        console.log("✓ Verification record found for:", verification.email);
        
        // If using code, double-check it matches
        if (code && verification.code !== code) {
            console.warn("❌ Code mismatch. Expected:", verification.code, "Got:", code);
            return res.status(400).json({ success: false, message: "Incorrect verification code" });
        }

        // Find temporary user
        const tempUser = await TempUser.findOne({email:verification.email});
        if (!tempUser) {
            console.warn("❌ Temporary user not found for:", verification.email);
            return res.status(400).json({ success: false, message: "User registration expired. Please register again." });
        }

        console.log("✓ Creating verified user:", tempUser.email);
        
        // Now create user and store it in main collection
        const newUser = await User.create({
            name:tempUser.name,
            email:tempUser.email,
            password: tempUser.password,
            isVerified:true,
        });

        // clean up temporary user
        await TempUser.deleteOne({email:tempUser.email});
        await Verification.deleteOne({_id:verification._id});
       
        console.log("✅ User verified successfully:", tempUser.email);
        
        // Generate JWT token
        const jwtToken = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.status(200).json({
            success: true, 
            message: "Email verified successfully! You can now login.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            },
            token: jwtToken
        });
    } catch(error){
        console.error("❌ Verification error:", error.message);
        return res.status(500).json({success: false, message: "Verification failed", error: error.message});
    }
};