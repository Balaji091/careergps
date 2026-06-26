import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import OnboardingRole from './pages/OnboardingRole';
import OnboardingTimeline from './pages/OnboardingTimeline';
import OnboardingHours from './pages/OnboardingHours';
import OnboardingLoading from './pages/OnboardingLoading';
import Layout from './components/Layout';
import Roadmap from './pages/Roadmap';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Subject from './pages/Subject';
import Topic from './pages/Topic';
import Planner from './pages/Planner';
import Insights from './pages/Insights';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/onboarding/role" element={<ProtectedRoute><OnboardingRole /></ProtectedRoute>} />
        <Route path="/onboarding/timeline" element={<ProtectedRoute><OnboardingTimeline /></ProtectedRoute>} />
        <Route path="/onboarding/hours" element={<ProtectedRoute><OnboardingHours /></ProtectedRoute>} />
        <Route path="/onboarding/loading" element={<ProtectedRoute><OnboardingLoading /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Layout><Roadmap /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        <Route path="/subject/:subjectId" element={<ProtectedRoute><Layout><Subject /></Layout></ProtectedRoute>} />
        <Route path="/topic/:topicId" element={<ProtectedRoute><Layout><Topic /></Layout></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><Layout><Planner /></Layout></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Layout><Insights /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
