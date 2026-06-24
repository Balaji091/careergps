import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Streak from '../models/Streak.js';
import Analytics from '../models/Analytics.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

// JWT Generation
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Short-lived access token
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // Long-lived refresh token
  });
};

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      isVerified: true, // Bypass verification for now
      verificationToken,
      verificationTokenExpires,
    });

    // Create related models
    await Streak.create({ user: user._id });
    await Analytics.create({ user: user._id });

    // Bypass verification email sending for now
    /*
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.error(`Email delivery failed on registration: ${emailErr.message}`);
      return res.status(201).json({
        message: 'Registration successful, but verification email could not be sent. Please contact support.',
      });
    }
    */

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email address before logging in' });
      }

      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      // Set cookie options
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        xp: user.xp,
        level: user.level,
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res) => {
  const cookiesToken = req.cookies.refreshToken;
  const bodyToken = req.body.refreshToken;
  const refreshToken = cookiesToken || bodyToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token mapping' });
    }

    const accessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Token refresh failed, please re-authenticate' });
  }
};

// Forgot Password Request
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save();

    // Bypass SMTP password reset email sending for now
    /*
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailErr) {
      console.error(`Email delivery failed on password reset: ${emailErr.message}`);
      return res.status(500).json({
        message: 'Failed to send password reset email. Please try again later.',
      });
    }
    */

    res.json({
      message: 'Password reset link has been simulated. Check response.',
      resetToken, // return token directly for bypass
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password Execution
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    try {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    } catch (e) {
      // ignore
    }
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  const { name, targetRole, experienceLevel, targetTimeline, dailyStudyTime, githubLink, linkedinLink, autoScheduleRevision } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    
    // Update profile fields
    user.profile.targetRole = targetRole !== undefined ? targetRole : user.profile.targetRole;
    user.profile.experienceLevel = experienceLevel !== undefined ? experienceLevel : user.profile.experienceLevel;
    user.profile.targetTimeline = targetTimeline !== undefined ? targetTimeline : user.profile.targetTimeline;
    user.profile.dailyStudyTime = dailyStudyTime !== undefined ? Number(dailyStudyTime) : user.profile.dailyStudyTime;
    user.profile.githubLink = githubLink !== undefined ? githubLink : user.profile.githubLink;
    user.profile.linkedinLink = linkedinLink !== undefined ? linkedinLink : user.profile.linkedinLink;
    user.profile.autoScheduleRevision = autoScheduleRevision !== undefined ? Boolean(autoScheduleRevision) : user.profile.autoScheduleRevision;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      xp: user.xp,
      level: user.level,
      message: 'Profile updated successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
