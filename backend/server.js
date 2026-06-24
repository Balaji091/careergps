import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import revisionRoutes from './routes/revisionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import linkedinRoutes from './routes/linkedinRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load Config
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Base route for status check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Career GPS Backend API operational' });
});

// Custom Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
