// server/routes/user.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/me
 * Return current user's profile (no passwordHash).
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-passwordHash -__v'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/users/me
 * Update profile fields: name, phone, city, profilePic.
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, phone, city, profilePic } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -__v');

    res.json({ user });
  } catch (err) {
    console.error('PUT /me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/users/password
 * Change password: needs currentPassword + newPassword.
 */
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'currentPassword and newPassword are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('PUT /password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
