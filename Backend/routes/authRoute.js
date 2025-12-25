import express from 'express'
import { registerUser,verifyUser} from '../controllers/registrationController.js';
import { loginUser } from '../controllers/loginController.js';
import {getUserInfo, updateUserProfile, uploadProfileImage} from '../controllers/getUserController.js'
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'

const router = express.Router();


router.post('/register',registerUser);
router.post('/verify',verifyUser);
router.post('/login',loginUser);
router.get('/getUser',protect,getUserInfo);
router.put('/updateProfile',protect,updateUserProfile);
router.post('/uploadProfileImage',protect,upload.single('profileImage'),uploadProfileImage);

export default router;