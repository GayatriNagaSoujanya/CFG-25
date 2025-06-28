import express from 'express';
import {
  sendOtp,
  verifyOtp,
  register,
  login,
  resendOtp,
  resetPassword,
  forgetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/resend-otp', resendOtp); // ✅ ADD THIS
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password',resetPassword);
router.post('/forget-password',forgetPassword)

export default router;
