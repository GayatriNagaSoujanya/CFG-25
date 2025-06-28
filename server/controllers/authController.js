import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

const otpStore = new Map();
const verifiedEmails = new Set();
const otpTimers = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function isValidPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
}

function generateOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);

  if (otpTimers.has(email)) clearTimeout(otpTimers.get(email));
  const timeout = setTimeout(() => {
    otpStore.delete(email);
    otpTimers.delete(email);
  }, 5 * 60 * 1000);

  otpTimers.set(email, timeout);
  return otp;
}

export const sendOtp = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const otp = generateOtp(email);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is: <b>${otp}</b></p>`,
    });
    console.log(`✅ OTP for ${email}: ${otp}`);
    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const resendOtp = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateOtp(email);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Resent OTP Code',
      html: `<p>Your new OTP is: <b>${otp}</b></p>`,
    });
    console.log(`🔄 Resent OTP for ${email}: ${otp}`);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

export const verifyOtp = (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const otp = req.body.otp;
  const storedOtp = otpStore.get(email);
  console.log(`🔍 Verifying OTP for ${email}. Stored: ${storedOtp}, Entered: ${otp}`);

  if (!storedOtp) {
    console.warn(`⚠️ No OTP stored for ${email}`);
    return res.status(400).json({ message: 'OTP expired or not sent' });
  }

  if (storedOtp === otp) {
    otpStore.delete(email);
    if (otpTimers.has(email)) clearTimeout(otpTimers.get(email));
    otpTimers.delete(email);
    verifiedEmails.add(email);
    return res.json({ success: true, message: 'OTP verified' });
  }
  return res.status(401).json({ message: 'Invalid OTP' });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!verifiedEmails.has(normalizedEmail)) {
      return res.status(400).json({ message: 'Email not verified with OTP' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with an uppercase letter, number, and special character.',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, email: normalizedEmail, password: hashed });

    verifiedEmails.delete(normalizedEmail);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('❌ Error in register:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', token });
};

export const forgetPassword = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = generateOtp(email);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password OTP',
      html: `<p>Your password reset OTP is: <b>${otp}</b></p>`
    });
    console.log(`🔐 Sent password reset OTP to ${email}: ${otp}`);
    res.json({ success: true, message: 'OTP sent for password reset' });
  } catch (err) {
    console.error('❌ Error sending password reset OTP:', err);
    res.status(500).json({ message: 'Failed to send reset OTP' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!otpStore.has(normalizedEmail)) {
    return res.status(400).json({ message: 'OTP expired or not sent' });
  }
  if (otpStore.get(normalizedEmail) !== otp) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters with an uppercase letter, number, and special character.',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword });

  otpStore.delete(normalizedEmail);
  if (otpTimers.has(normalizedEmail)) clearTimeout(otpTimers.get(normalizedEmail));
  otpTimers.delete(normalizedEmail);

  res.json({ success: true, message: 'Password reset successful' });
};
