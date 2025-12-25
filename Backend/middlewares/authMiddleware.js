import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if(!token){
        return res.status(401).json({message:"Not authorized , no token"});
    }

    try{
        // remove "Bearer" if present
        if(token.startsWith('Bearer ')){
            token = token.split(' ')[1];
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    }catch(error){
        // console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};