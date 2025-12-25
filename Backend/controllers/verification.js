import User from '../models/user.js'
import Verification from '../models/verification.js'
import TempUser from '../models/tempUserSchem.js'

// Verify email and create permanent user
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query
    const { code } = req.body

    // Check token or code
    if (!token && !code) {
      return res.status(400).json({ message: 'Token or code is required' })
    }

    // Find verification record
    let verification
    if (token) {
      verification = await Verification.findOne({ token })
    } else if (code) {
      verification = await Verification.findOne({ code })
    }

    if (!verification) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    // If using code, double-check it matches
    if (code && verification.code !== code) {
      return res.status(400).json({ message: 'Incorrect verification code' })
    }

    // Find temporary user
    const tempUser = await TempUser.findOne({ email: verification.email })
    if (!tempUser) {
      return res.status(400).json({ message: 'Temporary user not found or expired' })
    }

    // Create permanent user
    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true
    })

    // Delete temporary user and verification record
    await TempUser.deleteOne({ email: verification.email })
    await Verification.deleteOne({ _id: verification._id })

    res.status(200).json({
      message: 'User verified successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    })
  } catch (error) {
    console.error('Error in verifyEmail:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Resend verification code
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Check if temporary user exists
    const tempUser = await TempUser.findOne({ email })
    if (!tempUser) {
      return res.status(400).json({ message: 'No registration found for this email' })
    }

    // Check if permanent user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already verified' })
    }

    // Generate new verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Update verification record
    await Verification.findOneAndUpdate(
      { email },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    )

    res.status(200).json({
      message: 'Verification code sent successfully',
      email
    })
  } catch (error) {
    console.error('Error in resendVerificationCode:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
