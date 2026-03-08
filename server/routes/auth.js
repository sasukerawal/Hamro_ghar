// server/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

// --- Email Transporter Setup ---
// Use environment variables for security.
// For Gmail, use an App Password if 2FA is enabled.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Issue Cookie
const issueCookie = (res, user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name = '', email = '', password = '' } = req.body;

    if (!name.trim() || !email.trim() || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      // If user exists but is NOT verified, we can overwrite/resend code (optional logic)
      // For simplicity, just return error if email is taken.
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    const newUser = new User({
      name: name.trim(),
      email: emailLower,
      passwordHash,
      verificationCode, // Store code
      isVerified: false, // Default false
    });

    await newUser.save();

    // Send Verification Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailLower,
      subject: 'HamroGhar - Verify your account',
      text: `Your verification code is: ${verificationCode}`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
               <h2>Welcome to HamroGhar!</h2>
               <p>Please verify your account using the code below:</p>
               <h1 style="color: #2563EB; letter-spacing: 5px;">${verificationCode}</h1>
               <p>This code will expire in 24 hours.</p>
             </div>`,
    };

    await transporter.sendMail(mailOptions);

    // Return success but DO NOT log them in yet.
    // Frontend should move to the verification step.
    return res.status(201).json({
      message: 'Account created. Please verify your email.',
      email: emailLower,
      requiresVerification: true, // Signal frontend to show verify screen
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find user and include the hidden verificationCode field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+verificationCode');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Verification successful
    user.isVerified = true;
    user.verificationCode = undefined; // Clear the code
    await user.save();

    // Automatically log them in after verification?
    // Or just return success and make them login manually.
    // Let's auto-login for better UX.
    issueCookie(res, user);

    return res.json({
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Verify Password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // 🛑 Check if Verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email first.', 
        requiresVerification: true, // Signal frontend
        email: user.email 
      });
    }

    issueCookie(res, user);

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'No token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Double check user still exists and is verified
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email = '' } = req.body;
    if (!email.trim()) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If an account exists, a code was sent.' });

    const code = generateCode();
    const hash = await bcrypt.hash(code, 8);

    user.resetToken = hash;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'HamroGhar – Password Reset Code',
      html: `<div style="font-family:sans-serif;padding:24px;max-width:420px">
        <h2 style="color:#1e293b">Reset your password</h2>
        <p>Use the code below to reset your HamroGhar password. It expires in <strong>1 hour</strong>.</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563EB;padding:16px 0">${code}</div>
        <p style="color:#64748b;font-size:12px">If you did not request this, you can safely ignore this email.</p>
      </div>`,
    });

    return res.json({ message: 'If an account exists, a code was sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email = '', code = '', newPassword = '' } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+resetToken +resetTokenExpiry');

    if (!user || !user.resetToken || !user.resetTokenExpiry)
      return res.status(400).json({ error: 'Invalid or expired code' });

    if (user.resetTokenExpiry < new Date())
      return res.status(400).json({ error: 'Code has expired. Please request a new one.' });

    const match = await bcrypt.compare(code, user.resetToken);
    if (!match) return res.status(400).json({ error: 'Invalid code' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/refresh
// Silently refreshes the JWT if it's still valid — extends session by 7 more days.
// Call this on app load / periodically so users aren't logged out mid-session.
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'No token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'User not found or not verified' });
    }

    // Issue a fresh 7-day token
    issueCookie(res, user);

    return res.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    // Token verification failed (expired or tampered)
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
});

export default router;