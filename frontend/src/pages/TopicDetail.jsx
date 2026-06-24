import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import {
  ChevronLeft,
  BookOpen,
  Book,
  FileText,
  HelpCircle,
  Clock,
  Sparkles,
  Share2,
  ListTodo,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  Copy,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';

const parseMarkdown = (md) => {
  if (!md) return '';
  
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```(?:javascript|js|json|html|css|python|bash)?([\s\S]*?)```/g, '<pre class="bg-gray-50 border border-[#E5E7EB] rounded-md p-3.5 my-3.5 font-mono text-xs overflow-x-auto text-gray-800">$1</pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-[#2563EB]">$1</code>');

  html = html.replace(/^###### (.*$)/gim, '<h6 class="text-[10px] font-bold text-gray-400 uppercase mt-3 mb-1">$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5 class="text-xs font-bold text-[#111827] mt-3 mb-1.5">$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xs font-bold text-gray-400 uppercase mt-3 mb-1">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-[#111827] mt-3 mb-1.5">$1</h5>');
  html = html.replace(/^## (.*$)/gim, '<h4 class="text-sm font-bold mt-4 mb-2 text-[#111827] border-b border-gray-100 pb-1">$1</h4>');
  html = html.replace(/^# (.*$)/gim, '<h3 class="text-base font-bold mt-5 mb-2 text-[#111827] border-b border-gray-200 pb-2">$1</h3>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc my-1 text-gray-600 text-xs">$1</li>');

  html = html.split('\n\n').map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<li') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
      return p;
    }
    return `<p class="my-2 leading-relaxed text-gray-600 text-xs sm:text-sm">${p}</p>`;
  }).join('\n');

  html = html.replace(/\n/g, '<br />');
  return html;
};

const RenderChatMessage = ({ msg, topicId, reloadUserProfile, showToast }) => {
  const [quizState, setQuizState] = useState({
    hasQuiz: false,
    quizData: null,
    cleanedText: msg.text,
  });

  useEffect(() => {
    const match = msg.text.match(/:::quiz\s*([\s\S]*?)\s*:::/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1].trim());
        const textBefore = msg.text.replace(/:::quiz\s*([\s\S]*?)\s*:::/, '').trim();
        setQuizState({
          hasQuiz: true,
          quizData: parsed,
          cleanedText: textBefore,
        });
      } catch (err) {
        console.error('Failed to parse quiz JSON:', err);
      }
    } else {
      setQuizState({
        hasQuiz: false,
        quizData: null,
        cleanedText: msg.text,
      });
    }
  }, [msg.text]);

  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmitQuiz = async () => {
    if (selectedOption === null) return;
    const correct = selectedOption === quizState.quizData.correctIndex;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      try {
        const res = await api.post(`/roadmap/topic/${topicId}/quiz/reward`);
        showToast(`Correct! +${res.data.xpGained || 5} XP awarded.`, 'success');
        reloadUserProfile();
      } catch (err) {
        console.error('Failed to award quiz reward:', err);
      }
    } else {
      showToast('Incorrect answer. Check the explanation!', 'info');
    }
  };

  return (
    <div className={`flex items-start space-x-3 w-full ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
      {msg.sender === 'user' ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#2563EB] text-white shadow-sm">
          U
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-sm">
          AI
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%] space-y-1 flex-1">
        <span className="text-[9px] font-bold text-gray-400 uppercase">
          {msg.sender === 'user' ? 'You' : 'CGPS Tutor'}
        </span>
        <div
          className={`p-3 rounded-xl leading-relaxed text-xs sm:text-sm ${
            msg.sender === 'user'
              ? 'bg-[#2563EB] text-white font-medium shadow-sm'
              : 'bg-slate-50 border border-slate-100 text-[#111827] shadow-sm'
          }`}
          dangerouslySetInnerHTML={{
            __html: parseMarkdown(quizState.cleanedText)
          }}
        />

        {msg.sender === 'ai' && quizState.hasQuiz && quizState.quizData && (
          <div className="mt-2 bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-sm w-full space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <span className="text-[9px] font-bold text-[#2563EB] uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                🎯 Interactive Concept Check
              </span>
              {submitted && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isCorrect ? 'bg-green-50 text-[#22C55E]' : 'bg-red-50 text-[#EF4444]'
                }`}>
                  {isCorrect ? 'Correct +5 XP' : 'Incorrect'}
                </span>
              )}
            </div>
            
            <h4 className="text-xs font-semibold text-[#111827] leading-normal">
              {quizState.quizData.question}
            </h4>

            <div className="space-y-1.5">
              {quizState.quizData.options?.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrectOpt = optIdx === quizState.quizData.correctIndex;
                
                let optStyle = 'border-[#E5E7EB] hover:border-gray-300 bg-gray-50/30';
                if (submitted) {
                  if (isCorrectOpt) {
                    optStyle = 'border-[#22C55E] bg-green-50/20 text-[#22C55E] font-semibold';
                  } else if (isSelected) {
                    optStyle = 'border-[#EF4444] bg-red-50/20 text-[#EF4444] font-semibold';
                  } else {
                    optStyle = 'border-[#E5E7EB] opacity-50 bg-gray-50/10';
                  }
                } else if (isSelected) {
                  optStyle = 'border-[#2563EB] bg-blue-50/10 text-[#2563EB] font-semibold';
                }

                return (
                  <button
                    key={optIdx}
                    disabled={submitted}
                    onClick={() => setSelectedOption(optIdx)}
                    className={`w-full text-left p-2.5 border rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {isSelected && !submitted && <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full" />}
                  </button>
                );
              })}
            </div>

            {!submitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitQuiz}
                className="w-full py-1.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-2.5 text-xs text-[#6B7280]">
                <strong className="text-[#111827] block text-[10px] uppercase tracking-wider mb-0.5">Explanation</strong>
                {quizState.quizData.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TopicDetail = () => {
  const { topicId } = useParams();
  const { showToast, roadmap, triggerReload } = useContext(AppContext);
  const { user, reloadUserProfile } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  
  // Tab states
  const [activeTab, setActiveTab] = useState('overview');

  // Learn tab states
  const [learnContent, setLearnContent] = useState(null);
  const [loadingLearn, setLoadingLearn] = useState(false);

  // Notes states
  const [note, setNote] = useState(null);
  const [loadingAINote, setLoadingAINote] = useState(false);
  const [aiNoteSuggestion, setAiNoteSuggestion] = useState('');

  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizXP, setQuizXP] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  // Interview preparation states
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [answersInput, setAnswersInput] = useState({});
  const [confidenceRatings, setConfidenceRatings] = useState({});

  // Spaced repetition revision states
  const [revision, setRevision] = useState(null);
  const [loadingRevision, setLoadingRevision] = useState(false);

  // LinkedIn post states
  const [linkedinPost, setLinkedinPost] = useState('');
  const [loadingLinkedin, setLoadingLinkedin] = useState(false);
  const [linkedinType, setLinkedinType] = useState('learning_post');

  // Chatbot states
  const [tutorMessages, setTutorMessages] = useState([
    { sender: 'ai', text: "Hello! I am your AI Topic Tutor. As you study this topic, feel free to ask me to explain concepts, give code examples, list common gotchas, or run a quick assessment check!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatBottomRef = useRef(null);
  const [isTutorMaximized, setIsTutorMaximized] = useState(false);
  const modalChatBottomRef = useRef(null);

  const activeRecallTips = {
    overview: "Welcome to this concept study! Inspect the summary and objectives to set your learning goals, and update your status dropdown above when you make progress.",
    learn: "Lock in memory by summarizing the concept in your own words. Use my AI helper tools to generate study guides, summaries, or flashcards!",
    notes: "Review dynamic explanations, write personal notes, and draft code snippets here. CGPS autosaves your notes dynamically.",
    quiz: "Test your knowledge. Aim for 5/5 to earn full XP! Check explanations to learn the core mechanisms.",
    interview: "Technical interviewers frequently ask these questions. Try drafting your responses to practice articulating your technical thoughts!",
    revision: "Spaced repetition intervals are scientifically proven to maximize recall. Log your revision session to keep your retention high!",
    linkedin: "Share your learning journey! Explaining concepts to your network is a great way to solidify understanding and build your developer profile."
  };

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const res = await api.get(`/roadmap/topic/${topicId}`);
        setTopic(res.data.topic);
        setNote(res.data.note);
        setRevision(res.data.revision);

        if (res.data.answers && Array.isArray(res.data.answers)) {
          const inputs = {};
          const ratings = {};
          res.data.answers.forEach((q) => {
            inputs[q._id] = q.answer || '';
            ratings[q._id] = q.confidence || 3;
          });
          setAnswersInput(inputs);
          setConfidenceRatings(ratings);
        }
      } catch (err) {
        showToast('Error loading topic details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [topicId]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (modalChatBottomRef.current) {
      modalChatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages, sendingMessage, isTutorMaximized]);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMessage) return;

    const userText = chatInput;
    setTutorMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setSendingMessage(true);

    try {
      const res = await api.post(`/roadmap/topic/${topicId}/chat`, { message: userText });
      setTutorMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      showToast('Failed to get response', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLoadLearn = async () => {
    if (learnContent) return;
    setLoadingLearn(true);
    try {
      const res = await api.get(`/roadmap/topic/${topicId}/learn`);
      setLearnContent(res.data);
    } catch (err) {
      showToast('Failed to load study guide', 'error');
    } finally {
      setLoadingLearn(false);
    }
  };

  const handleLoadQuestions = async () => {
    if (questions.length > 0) return;
    setLoadingQuestions(true);
    try {
      const res = await api.get(`/interview/topic/${topicId}`);
      setQuestions(res.data);
      
      const inputs = {};
      const ratings = {};
      res.data.forEach((q) => {
        inputs[q._id] = q.answer || '';
        ratings[q._id] = q.confidence || 3;
      });
      setAnswersInput(inputs);
      setConfidenceRatings(ratings);
    } catch (err) {
      showToast('Failed to load interview questions', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSaveAnswer = async (questionId) => {
    try {
      const res = await api.post(`/interview/answer/${questionId}`, {
        answer: answersInput[questionId] || '',
        confidence: Number(confidenceRatings[questionId] || 3),
      });
      showToast('Answer response saved successfully!', 'success');
      if (res.data.xpGained > 0) {
        showToast(`+${res.data.xpGained} XP awarded!`, 'success');
      }
      reloadUserProfile();
      triggerReload();
    } catch (err) {
      showToast('Failed to save answer', 'error');
    }
  };

  const handleLoadQuiz = async () => {
    if (quizQuestions.length > 0) return;
    setLoadingQuiz(true);
    try {
      const res = await api.get(`/roadmap/topic/${topicId}/quiz`);
      setQuizQuestions(res.data);
    } catch (err) {
      showToast('Failed to load quiz', 'error');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSubmitTopicQuiz = async () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      showToast('Please answer all quiz questions before submitting.', 'warning');
      return;
    }

    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    try {
      const res = await api.post(`/roadmap/topic/${topicId}/quiz/submit`, { score });
      setQuizScore(score);
      setQuizXP(res.data.xpGained);
      setQuizSubmitted(true);
      showToast(`Quiz completed! You scored ${score}/${quizQuestions.length}. +${res.data.xpGained} XP awarded.`, 'success');
      reloadUserProfile();
    } catch (err) {
      showToast('Failed to submit quiz score', 'error');
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizXP(0);
    setCurrentQuizIndex(0);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'learn') handleLoadLearn();
    if (tab === 'interview') handleLoadQuestions();
    if (tab === 'quiz') handleLoadQuiz();
  };

  const handleStatusChange = async (newStatus) => {
    const nextProgress = newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0;
    try {
      const res = await api.put(`/roadmap/topic/${topicId}/progress`, {
        status: newStatus,
        progress: nextProgress,
      });
      setTopic(prev => ({ ...prev, status: newStatus, progress: nextProgress }));
      if (res.data.xpGained > 0) {
        showToast(`Topic Completed! +25 XP awarded.`, 'success');
      } else {
        showToast('Topic progress updated', 'success');
      }
      reloadUserProfile();
      triggerReload();
    } catch (err) {
      showToast('Failed to update progress', 'error');
    }
  };

  const handleSaveNote = async (content, tags) => {
    try {
      const res = await api.put(`/notes/topic/${topicId}`, { content, tags });
      setNote(res.data.note);
      triggerReload();
    } catch (err) {
      showToast('Failed to save note', 'error');
    }
  };

  const handlePinNoteToggle = async () => {
    try {
      const nextPinned = note ? !note.isPinned : true;
      const res = await api.put(`/notes/topic/${topicId}`, { isPinned: nextPinned });
      setNote(res.data.note);
      showToast(nextPinned ? 'Note pinned' : 'Note unpinned', 'success');
    } catch (err) {
      showToast('Failed to toggle pin', 'error');
    }
  };

  const handleAIAssistNote = async (action) => {
    setLoadingAINote(true);
    setAiNoteSuggestion('');
    try {
      const res = await api.post(`/notes/topic/${topicId}/ai`, {
        type: action,
        content: note?.content || '',
      });
      setAiNoteSuggestion(res.data.aiSuggestedContent);
      showToast('AI assistance generated suggestion successfully!', 'success');
    } catch (err) {
      showToast('AI assist note generation failed.', 'error');
    } finally {
      setLoadingAINote(false);
    }
  };

  const handleCompleteRevision = async () => {
    if (!revision) return;
    setLoadingRevision(true);
    try {
      const res = await api.put(`/revision/complete/${revision._id}`);
      setRevision(res.data.revision);
      showToast(res.data.message, 'success');
      if (res.data.xpGained > 0) {
        showToast(`+${res.data.xpGained} XP awarded!`, 'success');
      }
      reloadUserProfile();
      triggerReload();
    } catch (err) {
      showToast('Failed to log revision session', 'error');
    } finally {
      setLoadingRevision(false);
    }
  };

  const handleGenerateLinkedInPost = async () => {
    setLoadingLinkedin(true);
    setLinkedinPost('');
    try {
      const res = await api.post(`/linkedin`, {
        topicId,
        type: linkedinType,
        noteContent: note?.content || '',
      });
      setLinkedinPost(res.data.content);
      showToast('LinkedIn post draft generated successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate LinkedIn post', 'error');
    } finally {
      setLoadingLinkedin(false);
    }
  };

  const handleCopyPost = () => {
    navigator.clipboard.writeText(linkedinPost);
    showToast('LinkedIn post draft copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h3 className="font-bold text-sm text-[#111827]">Topic not found</h3>
      </div>
    );
  }

  const practiceLink = `https://mock-ai-frontend-gules.vercel.app/?role=${encodeURIComponent(
    user?.profile?.targetRole || 'developer'
  )}&subject=${encodeURIComponent(topic.subject?.name || '')}&topic=${encodeURIComponent(topic.name)}`;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      
      {/* Back button and title header */}
      <div className="shrink-0 space-y-4">
        <Link
          to={`/subject/${topic.subject}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to subject module</span>
        </Link>

        {/* Topic Title Board */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase bg-blue-50 px-2 py-0.5 rounded">Current Topic</span>
            <h2 className="text-base font-extrabold text-[#111827] mt-1">{topic.name}</h2>
            <div className="flex items-center space-x-3 text-xs text-[#6B7280]">
              <span>⏱️ {topic.estimatedHours} Hours</span>
              <span>•</span>
              <span>Level: {topic.difficulty}</span>
            </div>
          </div>

          {/* Progress dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-[#6B7280] uppercase">Status:</label>
            <select
              value={topic.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 border border-[#E5E7EB] rounded-lg bg-white text-xs font-bold text-[#111827] outline-none focus:border-[#2563EB] shadow-sm cursor-pointer"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Tabbed Content Container (col-span 8) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm lg:h-[580px]">
          {/* TABS HEADER CONTROL */}
          <div className="border-b border-[#E5E7EB] flex space-x-6 overflow-x-auto whitespace-nowrap scrollbar-none px-4 py-2.5 bg-white shrink-0">
            {[
              { id: 'overview', name: 'Overview', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'learn', name: 'Learn Explain', icon: <Book className="w-3.5 h-3.5" /> },
              { id: 'notes', name: 'Study Notes', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'quiz', name: 'Topic Quiz', icon: <HelpCircle className="w-3.5 h-3.5" /> },
              { id: 'interview', name: 'Interview prep', icon: <HelpCircle className="w-3.5 h-3.5" /> },
              { id: 'revision', name: 'Revision loops', icon: <ListTodo className="w-3.5 h-3.5" /> },
              { id: 'linkedin', name: 'LinkedIn updates', icon: <Share2 className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-1.5 pb-2 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Panel (Independent scroll viewport) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* Study Tip callout at top of each tab content area */}
            {activeRecallTips[activeTab] && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-[#6B7280] leading-relaxed font-semibold">
                <div className="flex items-center space-x-1.5 text-[#2563EB] font-bold mb-1 uppercase tracking-wider text-[9px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CGPS Companion Advice</span>
                </div>
                {activeRecallTips[activeTab]}
              </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-[#111827]">Topic Summary</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {topic.summary || 'Understand the core components and target workflows of this syllabus module.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <h3 className="font-semibold text-sm text-[#111827]">Learning Objectives</h3>
                  {topic.learningObjectives?.length === 0 ? (
                    <p className="text-xs text-gray-400">Objectives have not been customized.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {topic.learningObjectives?.map((obj, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-[#22C55E] shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <h3 className="font-semibold text-sm text-[#111827]">Prerequisites</h3>
                  {topic.prerequisites?.length === 0 ? (
                    <p className="text-xs text-gray-400">No strict prerequisites needed.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-[#6B7280] font-semibold">
                      {topic.prerequisites?.map((pre, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0"></span>
                          <span>{pre}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* LEARN TAB */}
            {activeTab === 'learn' && (
              <div className="space-y-4">
                {loadingLearn ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                    <p className="text-xs text-[#6B7280] font-semibold">Synthesizing topic explanations...</p>
                  </div>
                ) : learnContent ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Definition</h3>
                      <p className="text-xs font-semibold text-[#111827] bg-[#F8FAFC] border border-[#E5E7EB] p-3 rounded-lg leading-relaxed">
                        {learnContent.definition}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Detailed Concept Breakdown</h3>
                      <div
                        className="prose prose-sm max-w-none text-gray-600 leading-relaxed text-xs"
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdown(learnContent.detailedExplanation)
                        }}
                      />
                    </div>

                    <div className="border-t border-gray-100 pt-3 grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Use Cases</h3>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {learnContent.useCases?.map((use, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                              <span>{use}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Common Mistakes</h3>
                        <ul className="space-y-1 text-xs text-gray-600">
                          {learnContent.commonMistakes?.map((mis, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />
                              <span>{mis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-8">
                  <RichTextEditor
                    initialContent={note?.content || ''}
                    initialTags={note?.tags || []}
                    isPinned={note?.isPinned || false}
                    onSave={handleSaveNote}
                    onPinToggle={handlePinNoteToggle}
                  />
                </div>

                <div className="md:col-span-4 space-y-4">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-[#2563EB] uppercase border-b pb-1.5 border-gray-200">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Notes Helper</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'generate', name: 'Generate Notes' },
                        { id: 'revision', name: 'Generate Revision card' },
                        { id: 'summary', name: 'Generate Summary' },
                        { id: 'examples', name: 'Generate Code Examples' },
                        { id: 'flashcards', name: 'Generate Flashcards' },
                      ].map((act) => (
                        <button
                          key={act.id}
                          disabled={loadingAINote}
                          onClick={() => handleAIAssistNote(act.id)}
                          className="w-full text-left px-2.5 py-1.5 border border-[#E5E7EB] hover:border-[#2563EB] bg-white hover:bg-blue-50/10 text-xs font-semibold rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {act.name}
                        </button>
                      ))}
                    </div>

                    {loadingAINote && (
                      <div className="py-4 flex flex-col items-center justify-center space-y-1">
                        <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
                        <span className="text-[10px] text-gray-400">Compiling ideas...</span>
                      </div>
                    )}

                    {aiNoteSuggestion && (
                      <div className="border border-blue-100 rounded-lg p-2.5 bg-white space-y-2">
                        <div className="flex justify-between items-center text-[9px] text-[#6B7280] font-bold">
                          <span>AI RESULT PREVIEW</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiNoteSuggestion);
                              showToast('Suggestion copied to clipboard!', 'success');
                            }}
                            className="flex items-center space-x-1 hover:text-[#2563EB] cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={aiNoteSuggestion}
                          className="w-full h-32 text-xs font-mono p-2 border border-[#E5E7EB] bg-white outline-none resize-none rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
                  <h3 className="font-bold text-sm text-[#111827]">Topic Assessment Check</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Take this 5-question check to lock in conceptual details. Scoring 5/5 awards **+50 XP**!
                  </p>
                </div>

                {loadingQuiz ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                    <p className="text-xs text-[#6B7280]">Loading assessment questions...</p>
                  </div>
                ) : quizQuestions.length === 0 ? (
                  <div className="border border-[#E5E7EB] rounded-xl p-8 text-center space-y-3 bg-white">
                    <p className="text-xs text-[#6B7280]">Failed to load quiz. Try again.</p>
                    <button
                      onClick={handleLoadQuiz}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Load Quiz
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quizSubmitted && (
                      <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-[#111827]">
                            Score: <span className="text-[#2563EB]">{quizScore} / {quizQuestions.length}</span>
                          </h4>
                          <span className="text-[10px] text-[#22C55E] font-bold block">+{quizXP} XP gained</span>
                        </div>
                        <button
                          onClick={handleRetakeQuiz}
                          className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    )}

                    {(() => {
                      const q = quizQuestions[currentQuizIndex];
                      if (!q) return null;
                      const selectedOpt = quizAnswers[currentQuizIndex];
                      const isCorrect = selectedOpt === q.correctIndex;

                      return (
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                            <span className="text-[10px] font-bold text-gray-400">
                              Question {currentQuizIndex + 1} of {quizQuestions.length}
                            </span>
                            {quizSubmitted && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                isCorrect ? 'bg-green-50 text-[#22C55E]' : 'bg-red-50 text-[#EF4444]'
                              }`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-[#111827] leading-normal">{q.question}</h4>

                          <div className="grid sm:grid-cols-2 gap-2.5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedOpt === optIdx;
                              const isCorrectOpt = optIdx === q.correctIndex;

                              let btnStyle = 'border-[#E5E7EB] hover:border-gray-300 bg-gray-50/10';
                              if (quizSubmitted) {
                                if (isCorrectOpt) {
                                  btnStyle = 'border-[#22C55E] bg-green-50/20 text-[#22C55E] font-semibold';
                                } else if (isSelected) {
                                  btnStyle = 'border-[#EF4444] bg-red-50/20 text-[#EF4444] font-semibold';
                                } else {
                                  btnStyle = 'border-[#E5E7EB] opacity-50 bg-gray-50/5';
                                }
                              } else if (isSelected) {
                                btnStyle = 'border-[#2563EB] bg-blue-50/20 text-[#2563EB] font-semibold';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={quizSubmitted}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [currentQuizIndex]: optIdx })}
                                  className={`w-full text-left p-3 border rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && !quizSubmitted && <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full" />}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3 text-xs text-[#6B7280]">
                              <strong className="text-[#111827] block text-[9px] uppercase tracking-wider mb-0.5">Explanation</strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Controls */}
                    <div className="flex justify-between items-center bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-sm">
                      <div className="flex space-x-2">
                        <button
                          disabled={currentQuizIndex === 0}
                          onClick={() => setCurrentQuizIndex(prev => prev - 1)}
                          className="px-3.5 py-1.5 border border-[#E5E7EB] hover:bg-[#F8FAFC] disabled:opacity-50 text-xs font-semibold rounded-lg text-[#6B7280] cursor-pointer"
                        >
                          Previous
                        </button>
                        <button
                          disabled={currentQuizIndex === quizQuestions.length - 1}
                          onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                          className="px-3.5 py-1.5 border border-[#E5E7EB] hover:bg-[#F8FAFC] disabled:opacity-50 text-xs font-semibold rounded-lg text-[#6B7280] cursor-pointer"
                        >
                          Next
                        </button>
                      </div>

                      {!quizSubmitted ? (
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {Object.keys(quizAnswers).length} of {quizQuestions.length} Done
                          </span>
                          <button
                            onClick={handleSubmitTopicQuiz}
                            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Submit Quiz
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Review Mode</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INTERVIEW PREPARATION TAB */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#111827]">Practice Interview Questions</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Test your recall depth. Answering awards XP.</p>
                  </div>
                  
                  <a
                    href={practiceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    <span>Practice Board</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {loadingQuestions ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                    <p className="text-xs text-[#6B7280]">Compiling interview parameters...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, idx) => {
                      const isExpanded = expandedQuestion === q._id;
                      const isSubmitted = q.answer !== '';

                      return (
                        <div key={q._id} className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                          {/* Accordion header */}
                          <div
                            onClick={() => setExpandedQuestion(isExpanded ? null : q._id)}
                            className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSubmitted ? 'bg-green-50 text-[#22C55E]' : 'bg-gray-100 text-[#6B7280]'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-xs sm:text-sm text-[#111827] truncate">{q.question}</span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>

                          {/* Accordion Body */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1.5 border-t border-gray-100 space-y-3 bg-[#F8FAFC]">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-[#6B7280] uppercase">Write your explanation</label>
                                <textarea
                                  value={answersInput[q._id] || ''}
                                  onChange={(e) => setAnswersInput({ ...answersInput, [q._id]: e.target.value })}
                                  placeholder="Type your explanation answer..."
                                  className="w-full h-24 border border-[#E5E7EB] rounded-lg p-3 bg-white outline-none focus:border-[#2563EB] text-xs leading-relaxed text-[#111827]"
                                />
                              </div>

                              <div className="flex justify-between items-center border-t pt-2.5 border-gray-200">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-bold text-[#6B7280] uppercase">Confidence:</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((lvl) => (
                                      <button
                                        key={lvl}
                                        onClick={() => setConfidenceRatings({ ...confidenceRatings, [q._id]: lvl })}
                                        className={`w-6 h-6 text-[10px] font-bold rounded-lg cursor-pointer ${
                                          (confidenceRatings[q._id] || 3) >= lvl
                                            ? 'bg-[#2563EB] text-white'
                                            : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-100'
                                        }`}
                                      >
                                        {lvl}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleSaveAnswer(q._id)}
                                  className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                                >
                                  Save Answer
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* REVISION TAB */}
            {activeTab === 'revision' && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase bg-blue-50 px-2 py-0.5 rounded">Spaced Repetition Spacer</span>
                    <h3 className="text-sm font-bold text-[#111827] mt-1">Active Recall Loops</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm mx-auto">
                      Revising this topic at targeted intervals commits it to long-term memory.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 border border-gray-100 bg-[#F8FAFC] rounded-lg text-center">
                      <span className="text-[10px] text-[#6B7280] font-semibold uppercase">Revision Status</span>
                      <span className="text-xs font-bold text-[#111827] mt-0.5 block">
                        {revision?.status || 'Not Started'}
                      </span>
                    </div>

                    <div className="p-3 border border-gray-100 bg-[#F8FAFC] rounded-lg text-center">
                      <span className="text-[10px] text-[#6B7280] font-semibold uppercase">Next Due Date</span>
                      <span className="text-xs font-bold text-[#111827] mt-0.5 block">
                        {revision?.nextRevisionDate
                          ? new Date(revision.nextRevisionDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Revision Loop Intervals</h4>
                    <div className="flex justify-between items-center gap-1.5">
                      {['Day 1', 'Day 3', 'Day 7', 'Day 15', 'Day 30', 'Day 60'].map((day, idx) => {
                        const isPassed = (revision?.intervalStep || 0) > idx;
                        const isCurrent = (revision?.intervalStep || 0) === idx;

                        return (
                          <div key={day} className="flex-1 text-center space-y-1">
                            <div className={`h-1.5 rounded-full ${
                              isPassed ? 'bg-[#22C55E]' : isCurrent ? 'bg-[#2563EB] animate-pulse' : 'bg-gray-100'
                            }`} />
                            <span className="text-[8px] font-semibold text-[#6B7280]">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    disabled={loadingRevision || revision?.status === 'Mastered'}
                    onClick={handleCompleteRevision}
                    className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    {loadingRevision ? 'Logging...' : revision?.status === 'Mastered' ? 'Concept Mastered!' : 'Complete Revision Session'}
                  </button>
                </div>
              </div>
            )}

            {/* LINKEDIN TAB */}
            {activeTab === 'linkedin' && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3.5">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase bg-blue-50 px-2 py-0.5 rounded">Social Update Generator</span>
                    <h3 className="text-sm font-bold text-[#111827] mt-1">LinkedIn Post Drafts</h3>
                    <p className="text-xs text-[#6B7280]">Draft career network updates detailing what you learned</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={linkedinType}
                      onChange={(e) => setLinkedinType(e.target.value)}
                      className="flex-1 appearance-none pl-3 pr-8 py-2 border border-[#E5E7EB] rounded-lg bg-white text-xs font-semibold text-[#6B7280] outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="learning_post">Learning Post (Concept details)</option>
                      <option value="takeaways">Top 3 key takeaways</option>
                      <option value="summary">Concept executive summary</option>
                      <option value="career_update">Career milestone update</option>
                    </select>

                    <button
                      disabled={loadingLinkedin}
                      onClick={handleGenerateLinkedInPost}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
                    >
                      {loadingLinkedin ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  {linkedinPost && (
                    <div className="space-y-2 border-t pt-4 border-gray-100">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#6B7280]">
                        <span>POST PREVIEW (EDITABLE)</span>
                        <button
                          onClick={handleCopyPost}
                          className="flex items-center space-x-1 hover:text-[#2563EB] cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Draft</span>
                        </button>
                      </div>
                      <textarea
                        value={linkedinPost}
                        onChange={(e) => setLinkedinPost(e.target.value)}
                        className="w-full h-44 border border-[#E5E7EB] rounded-lg p-3 font-sans text-xs sm:text-sm leading-relaxed text-[#111827] outline-none focus:border-[#2563EB] bg-white resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Sticky AI Topic Tutor Chatbot (col-span 4) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col h-full justify-between overflow-hidden lg:h-[580px]">
          <div className="flex items-center justify-between border-b pb-2 border-gray-100 shrink-0">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-[#2563EB] uppercase">
              <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span>AI Topic Tutor Chatbot</span>
            </div>
            <button
              onClick={() => setIsTutorMaximized(true)}
              className="p-1 hover:bg-slate-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
              title="Expand Tutor"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Message History (Independent scroll viewport) */}
          <div className="flex-1 overflow-y-auto my-3 space-y-3.5 pr-1 scrollbar-none">
            {tutorMessages.map((msg, i) => (
              <RenderChatMessage
                key={i}
                msg={msg}
                topicId={topicId}
                reloadUserProfile={reloadUserProfile}
                showToast={showToast}
              />
            ))}
            
            {sendingMessage && (
              <div className="flex items-start space-x-3 w-full animate-pulse">
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-sm animate-pulse">
                  AI
                </div>
                <div className="flex flex-col flex-1 space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">CGPS Tutor</span>
                  <div className="bg-slate-50 border border-slate-100 text-gray-500 p-2.5 rounded-xl flex items-center space-x-1.5 text-xs shadow-sm w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Assistant Chip Options */}
          <div className="flex flex-wrap gap-1 border-t border-gray-100 pt-2 shrink-0">
            {[
              { label: '💡 Explain simply', text: 'Explain this topic in simple terms with a clear real-world analogy.' },
              { label: '💻 Code example', text: 'Provide a robust, commented production-ready code example of this concept.' },
              { label: '⚠️ Common gotchas', text: 'What are the most common gotchas or pitfalls that developers face with this topic?' },
              { label: '🎯 Quick quiz', text: 'Test my knowledge with a quick interactive multiple choice question!' }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={sendingMessage}
                onClick={async () => {
                  if (sendingMessage) return;
                  const userMsgText = chip.text;
                  setTutorMessages(prev => [...prev, { sender: 'user', text: chip.label }]);
                  setSendingMessage(true);
                  try {
                    const res = await api.post(`/roadmap/topic/${topicId}/chat`, { message: userMsgText });
                    setTutorMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
                  } catch (err) {
                    showToast('Failed to get AI tutor response', 'error');
                  } finally {
                    setSendingMessage(false);
                  }
                }}
                className="px-2 py-0.5 text-[9px] font-bold border border-[#E5E7EB] hover:border-[#2563EB] rounded-full bg-slate-50 text-gray-500 hover:text-[#2563EB] transition-colors cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendChatMessage} className="border-t border-gray-100 pt-2.5 flex gap-2 shrink-0">
            <input
              type="text"
              required
              placeholder="Ask a question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-xs text-[#111827] bg-[#F8FAFC] focus:bg-white"
            />
            <button
              type="submit"
              disabled={sendingMessage}
              className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>

      </div>

      {/* AI Tutor Full size Modal */}
      {isTutorMaximized && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl h-[85vh] max-h-[850px] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-[#E5E7EB] shrink-0">
              <div className="flex items-center space-x-2.5 text-xs font-bold text-[#2563EB] uppercase">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#111827] capitalize">AI Spaced Learning Tutor</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 normal-case">Expanded Workspace Mode</p>
                </div>
              </div>
              <button
                onClick={() => setIsTutorMaximized(false)}
                className="p-2 hover:bg-slate-100 hover:text-red-500 rounded-xl text-gray-400 transition-colors shrink-0"
                title="Minimize Tutor"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Message History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
              {tutorMessages.map((msg, i) => (
                <div key={i} className="max-w-4xl mx-auto">
                  <RenderChatMessage
                    msg={msg}
                    topicId={topicId}
                    reloadUserProfile={reloadUserProfile}
                    showToast={showToast}
                  />
                </div>
              ))}
              
              {sendingMessage && (
                <div className="max-w-4xl mx-auto flex items-start space-x-3 w-full animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-sm">
                    AI
                  </div>
                  <div className="flex flex-col flex-1 space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">CGPS Tutor</span>
                    <div className="bg-white border border-slate-200 text-gray-500 p-3.5 rounded-xl flex items-center space-x-2 text-xs shadow-sm w-fit">
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                      <span>CGPS Tutor is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={modalChatBottomRef} />
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-white border-t border-[#E5E7EB] p-4 space-y-3.5 shrink-0">
              {/* Chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: '💡 Explain simply', text: 'Explain this topic in simple terms with a clear real-world analogy.' },
                  { label: '💻 Code example', text: 'Provide a robust, commented production-ready code example of this concept.' },
                  { label: '⚠️ Common gotchas', text: 'What are the most common gotchas or pitfalls that developers face with this topic?' },
                  { label: '🎯 Quick quiz', text: 'Test my knowledge with a quick interactive multiple choice question!' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={sendingMessage}
                    onClick={async () => {
                      if (sendingMessage) return;
                      const userMsgText = chip.text;
                      setTutorMessages(prev => [...prev, { sender: 'user', text: chip.label }]);
                      setSendingMessage(true);
                      try {
                        const res = await api.post(`/roadmap/topic/${topicId}/chat`, { message: userMsgText });
                        setTutorMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
                      } catch (err) {
                        showToast('Failed to get AI tutor response', 'error');
                      } finally {
                        setSendingMessage(false);
                      }
                    }}
                    className="px-3 py-1 text-xs font-bold border border-[#E5E7EB] hover:border-[#2563EB] rounded-full bg-slate-50 text-gray-500 hover:text-[#2563EB] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Ask any technical question about this topic..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#2563EB] text-xs sm:text-sm text-[#111827] bg-[#F8FAFC] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicDetail;
