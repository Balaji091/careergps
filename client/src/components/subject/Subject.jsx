import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import SubjectProgress from './SubjectProgress';
import SubjectCurriculum from './SubjectCurriculum';
import SubjectChat from './SubjectChat';
import CompassLoader from '../../components/CompassLoader';

const Subject = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  // LinkedIn post sharing state: 'idle', 'posting', 'posted'
  const [linkedinState, setLinkedinState] = useState('idle');

  // Accordion open/close state (tracks open ids)
  const [openAccordionIds, setOpenAccordionIds] = useState([]);

  // AI chat drawer state
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchSubjectData = async (showSyncSpinner = false) => {
    try {
      if (showSyncSpinner) setLoading(true);
      const res = await api.get(`/roadmap/subject/${subjectId}`);
      setSubject(res.data.subject);
      setTopics(res.data.topics || []);
      
      if (res.data.topics && res.data.topics.length > 0 && openAccordionIds.length === 0) {
        setOpenAccordionIds([res.data.topics[0]._id]);
      }
      
      if (messages.length === 0) {
        setMessages([
          { sender: 'ai', text: `Hi! I am your Career GPS learning copilot. Ask me anything about ${res.data.subject?.name || 'this subject'}.` }
        ]);
      }
    } catch (err) {
      console.error('Error loading subject details:', err);
      setError(err.response?.data?.message || 'Failed to load subject details.');
    } finally {
      if (showSyncSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchSubjectData(true);
    }
  }, [subjectId]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLinkedInPost = async () => {
    setLinkedinState('posting');
    try {
      await api.post('/linkedin', {
        content: `I'm excited to share that I've just mastered ${subject?.name || 'Advanced System Architecture'} on Career GPS! 🚀 Ready to apply these insights to our next big scale-up! #CareerGPS #LearningJourney`
      });
      setLinkedinState('posted');
      triggerToast('Post shared to LinkedIn successfully! 🚀');
      setTimeout(() => {
        setLinkedinState('idle');
      }, 3000);
    } catch (err) {
      console.error('LinkedIn share failed:', err);
      triggerToast('LinkedIn share failed. Try again.');
      setLinkedinState('idle');
    }
  };

  const toggleAccordion = (id) => {
    setOpenAccordionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    try {
      const activeTopicId = openAccordionIds[0] || topics[0]?._id;
      const res = await api.post(`/roadmap/topic/${activeTopicId}/chat`, { message: userText });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response || res.data.reply }]);
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting right now. Let's try again in a bit!" }]);
    }
  };

  const askPredefined = async (question) => {
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    try {
      const activeTopicId = openAccordionIds[0] || topics[0]?._id;
      const res = await api.post(`/roadmap/topic/${activeTopicId}/chat`, { message: question });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response || res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting right now. Let's try again in a bit!" }]);
    }
  };

  if (loading) {
    return <CompassLoader />;
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Subject not found</h2>
        <Link to="/roadmap" className="text-primary hover:underline">Back to Roadmap</Link>
      </div>
    );
  }

  const completedCount = topics.filter(t => t.status === 'completed').length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;
  const totalHours = topics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const resumeTopic = topics.find(t => t.status === 'in_progress') || topics.find(t => t.status === 'not_started') || topics[0];

  const coreHours = Number((totalHours * 0.60).toFixed(1));
  const quizHours = Number((totalHours * 0.20).toFixed(1));
  const revisionHours = Number((totalHours * 0.20).toFixed(1));
  const allCompleted = topics.length > 0 && topics.every(t => t.status === 'completed');

  const curriculum = topics.map((t, idx) => {
    const isLocked = idx > 0 && topics[idx - 1].status !== 'completed';
    return {
      id: t._id,
      title: t.name,
      duration: `${t.estimatedHours || 4} hours`,
      type: t.difficulty || 'Intermediate',
      status: isLocked ? 'locked' : (t.status === 'in_progress' ? 'in-progress' : (t.status === 'completed' ? 'completed' : 'not-started')),
    };
  });

  return (
    <div className="fade-in max-w-7xl mx-auto space-y-gutter relative select-none">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-primary text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined">stars</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Header Info Block */}
      <section className="mb-8 p-6 md:p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-16 -translate-y-16 pointer-events-none"></div>
        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm">
            <Link to="/roadmap" className="hover:text-primary transition-colors">Pathways</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary font-medium">{subject.name}</span>
          </div>

          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight tracking-tight">
            {subject.name}
          </h2>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-on-surface-variant text-body-sm font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">schedule</span>
              <span className="font-label-md">{subject.estimatedTime || '10 days'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">signal_cellular_alt</span>
              <span className="font-label-md">Difficulty: {user?.profile?.experienceLevel || 'Intermediate'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span className="font-label-md">Certification Available</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            if (resumeTopic) {
              navigate(`/topic/${resumeTopic._id}`);
            } else {
              triggerToast('No topics to resume!');
            }
          }}
          className="flex items-center justify-center gap-2 px-6 h-[44px] bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 shrink-0 z-10"
        >
          <span className="material-symbols-outlined">play_circle</span>
          Resume Learning
        </button>
      </section>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Progress & stats */}
        <div className="lg:col-span-4">
          <SubjectProgress
            progressPercent={progressPercent}
            completedCount={completedCount}
            topics={topics}
            totalHours={totalHours}
            user={user}
            subject={subject}
            handleLinkedInPost={handleLinkedInPost}
            linkedinState={linkedinState}
            allCompleted={allCompleted}
          />
        </div>

        {/* Right Column: Curriculum accordions */}
        <div className="lg:col-span-8">
          <SubjectCurriculum
            curriculum={curriculum}
            openAccordionIds={openAccordionIds}
            toggleAccordion={toggleAccordion}
            fetchSubjectData={fetchSubjectData}
            navigate={navigate}
          />
        </div>
      </div>

      {/* AI Chat Drawer Button / Window */}
      <SubjectChat
        showChat={showChat}
        setShowChat={setShowChat}
        messages={messages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleChatSubmit={handleChatSubmit}
        askPredefined={askPredefined}
      />
    </div>
  );
};

export default Subject;
