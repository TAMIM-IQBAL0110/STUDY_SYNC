import User from '../models/user.js'
import bcrypt from 'bcrypt'

export const getUserInfo = async(req,res)=>{
    try{
        const user = await User.findById(req.user._id).select('-password');
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        res.status(200).json(user);
    }catch(error){
        res.status(500).json({
            message:"Error getting user info",
            error:error.message
        })
    }
}

export const updateUserProfile = async(req, res) => {
    try {
        const { email, currentPassword, newPassword, bio } = req.body
        const userId = req.user._id

        const user = await User.findById(userId).select('+password')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Update email if provided
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' })
            }
            user.email = email
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password)
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Current password is incorrect' })
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' })
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password)
            if (isSamePassword) {
                return res.status(400).json({ message: 'New password cannot be the same as current password' })
            }

            user.password = newPassword
        }

        // Update bio if provided
        if (bio !== undefined) {
            user.bio = bio
        }

        await user.save()
        const updatedUser = await User.findById(userId).select('-password')
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser })
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message })
    }
}

export const uploadProfileImage = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' })
        }

        const userId = req.user._id
        console.log("📸 Uploading image for user:", userId)
        console.log("📸 File info:", { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size })

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`
        user.profileImageUrl = imageUrl
        await user.save()

        console.log("✅ Image uploaded successfully:", imageUrl)
        res.status(200).json({ 
            message: 'Profile image uploaded successfully', 
            profileImageUrl: imageUrl,
            user: user
        })
    } catch (error) {
        console.error("❌ Error uploading image:", error.message)
        console.error("❌ Full error:", error)
        res.status(500).json({ message: 'Error uploading image', error: error.message })
    }
}