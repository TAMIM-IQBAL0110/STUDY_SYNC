import User from '../models/user.js'
import jwt from 'jsonwebtoken'

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
        return res.status(400).json({message:'All fields are required'});
    }
    try{
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
        console.error('Login Error:', error.message, error.stack);
        return res.status(500).json({
            success: false,
            message: 'Error logging in user',
            error: error.message,
        });
    }
}