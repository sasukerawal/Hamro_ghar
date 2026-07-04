// server/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Helper: Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Generate Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name = '', email = '', password = '' } = req.body;
  console.log(`[REGISTER] Attempting registration for: ${email}`);

  try {
    if (!name.trim() || !email.trim() || !password) {
      console.log(`[REGISTER] Missing fields for: ${email}`);
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    console.log(`[REGISTER] Checking if user exists: ${emailLower}`);
    const exists = await User.findOne({ email: emailLower });
    if (exists) {
      console.log(`[REGISTER] User already exists: ${emailLower}`);
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    const newUser = new User({
      name: name.trim(),
      email: emailLower,
      passwordHash,
      verificationCode,
      isVerified: false,
    });

    console.log(`[REGISTER] Saving new user to DB: ${emailLower}`);
    await newUser.save();

    return res.status(201).json({
      message: 'Account created. Use the code below to verify your account.',
      email: emailLower,
      requiresVerification: true,
      code: verificationCode,
    });

  } catch (err) {
    console.error('[REGISTER] Error:', err.message);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
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

    // Automatically log them in after verification
    const token = generateToken(user);

    return res.json({
      message: 'Email verified successfully!',
      token,
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

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+verificationCode');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User is already verified' });

    // Generate new code or reuse old one if it exists
    const newCode = generateCode();
    user.verificationCode = newCode;
    await user.save();

    return res.json({ message: 'Here is your new code.', code: newCode });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to resend code' });
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

    const token = generateToken(user);

    return res.json({
      token,
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
  // Frontend will clear localStorage
  return res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.token;

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
    // No account: don't reveal that, and there's no code to show.
    if (!user) return res.json({ message: 'If an account exists, a code was generated.' });

    const code = generateCode();
    const hash = await bcrypt.hash(code, 8);

    user.resetToken = hash;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return res.json({ message: 'Here is your reset code.', code });
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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.cookies?.token;

    if (!token) return res.status(401).json({ error: 'No token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'User not found or not verified' });
    }

    // Issue a fresh 7-day token
    const newToken = generateToken(user);

    return res.json({
      ok: true,
      token: newToken,
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
