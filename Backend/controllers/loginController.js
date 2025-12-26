import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// generate JWT token 
const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"1h",
    });
}

// login user
export const loginUser = async(req,res)=>{
    const {email,password} = req.body;
    
    if(!email || !password){
        return res.status(400).json({success: false, message:'Email and password are required'});
    }
    
    try{
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            console.warn('⚠️ Database connection state:', mongoose.connection.readyState);
            // Try to reconnect
            if (mongoose.connection.readyState === 0) {
                console.log('🔄 Attempting to reconnect...');
                // Wait a bit for reconnection
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            if (mongoose.connection.readyState !== 1) {
                return res.status(503).json({success: false, message: 'Database temporarily unavailable. Please try again.'});
            }
        }
        
        // check if user exist
        const user = await User.findOne({ email }).select('+password'); 
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        // Success
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token: generateToken(user._id),
        });
    }catch(error){
        console.error('❌ Login Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error logging in user',
            error: error.message,
        });
    }
}