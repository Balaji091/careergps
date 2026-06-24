import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Revision from '../models/Revision.js';
import Task from '../models/Task.js';
import Streak from '../models/Streak.js';
import Analytics from '../models/Analytics.js';
import { generateRoadmap, generateLearnContent } from '../services/aiService.js';
import { addXP, updateStreakActivity, getLocalDateString } from '../services/gamificationService.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/career-gps';

const runVerification = async () => {
  console.log('--- STARTING DATABASE & AI FLOW VERIFICATION ---\n');
  
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('Database Connected Successfully.\n');

    // 1. Setup Test User
    console.log('1. Setting up Test User...');
    const testEmail = 'verify-test@careergps.com';
    await User.deleteMany({ email: testEmail });
    
    const user = await User.create({
      name: 'Verification Tester',
      email: testEmail,
      password: 'password123',
      isVerified: true,
    });
    
    // Create side models
    const streak = await Streak.create({ user: user._id });
    const analytics = await Analytics.create({ user: user._id });
    console.log(`Test user created with ID: ${user._id}\n`);

    // 2. Test Onboarding and Roadmap generation
    console.log('2. Testing Roadmap Generation (Fallback Mock mode)...');
    const role = 'Backend Developer';
    const level = 'Intermediate';
    const timeline = '6 Months';
    const dailyHours = 4;

    const aiData = await generateRoadmap(role, level, timeline, dailyHours);
    console.log(`Roadmap synthesized. Role: "${aiData.role}", Total subjects: ${aiData.subjects?.length}`);

    // Save test roadmap
    const roadmap = await Roadmap.create({
      user: user._id,
      role: aiData.role,
      estimatedDays: aiData.estimatedDays,
      difficulty: aiData.difficulty,
    });

    const subData = aiData.subjects[0];
    const subject = await Subject.create({
      roadmap: roadmap._id,
      user: user._id,
      name: subData.name,
      order: 1,
      estimatedTime: subData.estimatedTime,
    });

    const topData = subData.topics[0];
    const topic = await Topic.create({
      subject: subject._id,
      roadmap: roadmap._id,
      user: user._id,
      name: topData.name,
      estimatedHours: topData.estimatedHours,
      summary: topData.summary,
    });

    const revision = await Revision.create({
      user: user._id,
      subject: subject._id,
      topic: topic._id,
      status: 'Not Started',
    });

    console.log(`Saved Roadmap: ${roadmap._id}, Subject: "${subject.name}", Topic: "${topic.name}"\n`);

    // 3. Test learn content caching
    console.log('3. Testing Learn Content dynamic caching...');
    const learnContent = await generateLearnContent(topic.name, subject.name, level);
    topic.cachedLearnContent = learnContent;
    topic.isLearnGenerated = true;
    await topic.save();
    console.log('Cached explanation definition:', topic.cachedLearnContent.definition.substring(0, 70) + '...\n');

    // 4. Test topic completion and XP rewards
    console.log('4. Testing Topic completion & XP calculation...');
    const previousXP = user.xp;
    
    // Complete topic
    topic.status = 'completed';
    topic.progress = 100;
    await topic.save();

    await addXP(user._id, 20, 'Completed topic');
    await updateStreakActivity(user._id, topic.estimatedHours, 0, 1, 20);

    const updatedUser = await User.findById(user._id);
    console.log(`Previous XP: ${previousXP}, Updated XP: ${updatedUser.xp} (Level: ${updatedUser.level})`);
    
    const updatedStreak = await Streak.findOne({ user: user._id });
    console.log(`Current Streak: ${updatedStreak.currentStreak} day, History items: ${updatedStreak.history.length}\n`);

    // Clean up
    console.log('Cleaning up test documents...');
    await Promise.all([
      Streak.deleteOne({ user: user._id }),
      Analytics.deleteOne({ user: user._id }),
      Roadmap.deleteMany({ user: user._id }),
      Subject.deleteMany({ user: user._id }),
      Topic.deleteMany({ user: user._id }),
      Revision.deleteMany({ user: user._id }),
      User.deleteOne({ _id: user._id }),
    ]);

    console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\nVerification failed with error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runVerification();
