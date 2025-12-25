import crypto from "crypto"
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

    //Send verification email
    const mailOption = createVerificationMail(email, name, code, verifyLink);
    const mailStatus = await sendEmail(mailOption);

    if (!mailStatus.success) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    return res.status(200).json({
      message: "Verification code sent! Please check your email.",
      verifyLink,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//verify register user
export const verifyUser = async (req, res) => {
    try{
        const {token} = req.query;
        const {code} = req.body;
        
        // Check token and code
        if (!token && !code) {
            return res.status(400).json({ message: "Token or code is required" });
        }

        // Find verification record
        let verification;
        if (token) {
            verification = await Verification.findOne({ token });
        } 
        else if (code) {
            verification = await Verification.findOne({ code });
        }

        if(!verification){
            return res.status(400).json({message:"Invalid or expired token"});
        }
        // If using code, double-check it matches
        if (code && verification.code !== code) {
            return res.status(400).json({ message: "Incorrect verification code" });
        }

        // Find temporary user
        const tempUser = await TempUser.findOne({email:verification.email});
        if (!tempUser) {
            return res.status(400).json({ message: "Temporary user not found or expired" });
        }

        // Now create user and store it in main collection
        await User.create({
            name:tempUser.name,
            email:tempUser.email,
            password: tempUser.password,
            isVerified:true,
        });

        // clean up temporary user
        await TempUser.deleteOne({email:tempUser.email});
        await Verification.deleteOne({_id:verification._id});
       
        res.status(200).json({message: "Email verified successfully!" });
    } catch(error){
        console.error("Error in verifyUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};