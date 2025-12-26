import express from 'express'
import { registerUser,verifyUser} from '../controllers/registrationController.js';
import { loginUser } from '../controllers/loginController.js';
import {getUserInfo, updateUserProfile, uploadProfileImage} from '../controllers/getUserController.js'
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'
import { transporter, createVerificationMail } from '../utilities/verficationEmail.js'
import mongoose from 'mongoose'

const router = express.Router();


router.post('/register',registerUser);
router.post('/verify',verifyUser);
router.post('/login',loginUser);
router.get('/getUser',protect,getUserInfo);
router.put('/updateProfile',protect,updateUserProfile);
router.post('/uploadProfileImage',protect,upload.single('profileImage'),uploadProfileImage);

// Test email endpoint (for debugging, remove in production)
router.get('/test-email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        console.log('🧪 Testing email to:', email);
        
        const mailOption = createVerificationMail(
            email,
            'Test User',
            '123456',
            'https://studysynch.netlify.app/verify?token=test&email=' + email
        );
        
        const info = await transporter.sendMail(mailOption);
        console.log('✅ Test email sent:', info.response);
        
        res.status(200).json({ 
            success: true,
            message: 'Test email sent successfully',
            response: info.response
        });
    } catch (error) {
        console.error('❌ Test email error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            code: error.code,
            message: 'Failed to send test email - check backend logs for details'
        });
    }
});

// Debug endpoint - get verification code (for testing only, remove in production)
router.get('/debug-code/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const Verification = mongoose.model('Verification');
        const verification = await Verification.findOne({ email });
        if (!verification) {
            return res.status(404).json({ message: 'No verification record found' });
        }
        res.status(200).json({ 
            email: verification.email,
            code: verification.code,
            token: verification.token.substring(0, 20) + '...',
            message: 'Debug endpoint - remove in production'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;