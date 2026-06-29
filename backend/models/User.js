import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshToken: String,
  
  profile: {
    targetRole: { type: String, default: '' },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', ''], default: '' },
    targetTimeline: { type: String, default: '' }, // e.g. "3 Months", "6 Months", "12 Months"
    dailyStudyTime: { type: Number, default: 1 }, // in hours
    githubLink: { type: String, default: '' },
    linkedinLink: { type: String, default: '' },
    avatar: { type: String, default: '' },
    autoScheduleRevision: { type: Boolean, default: true },
  },
  
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
