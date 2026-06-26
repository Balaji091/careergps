import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import RoadmapTimeline from './RoadmapTimeline';
import RoadmapDetailGrid from './RoadmapDetailGrid';
import CompassLoader from '../../components/CompassLoader';

const Roadmap = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get('/roadmap/active');
        if (res.data) {
          setSubjects(res.data.subjects || []);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error('Error fetching active roadmap:', err);
        setError(err.response?.data?.message || 'Failed to load active roadmap.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  if (loading) {
    return <CompassLoader />;
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
          <span className="material-symbols-outlined text-3xl">map</span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">No active roadmap found</h2>
          <p className="font-body-md text-on-surface-variant max-w-sm leading-relaxed">
            You haven't generated a career roadmap yet. Let's create a custom learning plan tailored to your goals.
          </p>
        </div>
        <button
          onClick={() => navigate('/onboarding/role')}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full shadow-lg hover:shadow-primary/20 hover:opacity-90 active:scale-95 transition-transform flex items-center gap-2"
        >
          <span className="material-symbols-outlined">explore</span>
          Start Onboarding Wizard
        </button>
      </div>
    );
  }

  const totalSubjects = subjects.length;
  const overallProgressPercent = totalSubjects > 0 
    ? Math.round((subjects.reduce((acc, s) => acc + (s.progress || 0), 0) / (totalSubjects * 100)) * 100) 
    : 0;

  const totalTopics = subjects.reduce((acc, s) => acc + (s.topicsCount || 0), 0);
  const completedTopics = subjects.reduce((acc, s) => acc + (s.completedCount || 0), 0);
  const dailyHours = user?.profile?.dailyStudyTime || localStorage.getItem('onboarding_dailyStudyTime') || 2;
  const experienceLevel = user?.profile?.experienceLevel || 'Intermediate';
  const targetRole = user?.profile?.targetRole || localStorage.getItem('onboarding_targetRole') || 'Senior Software Engineer';
  const targetTimeline = user?.profile?.targetTimeline || localStorage.getItem('onboarding_targetTimeline') || '6 Months';

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
          Syllabus Roadmap
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Your engineered path to technical mastery. Follow the sequence of technical topics and milestones.
        </p>
      </div>

      {/* Dynamic Roadmap Timeline Visualization Component */}
      <RoadmapTimeline subjects={subjects} />

      {/* Dynamic Detail Bento Grid Info Component */}
      <RoadmapDetailGrid
        overallProgressPercent={overallProgressPercent}
        completedTopics={completedTopics}
        totalTopics={totalTopics}
        dailyHours={dailyHours}
        experienceLevel={experienceLevel}
        targetRole={targetRole}
        targetTimeline={targetTimeline}
      />
    </div>
  );
};

export default Roadmap;
