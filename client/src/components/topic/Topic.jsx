import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import CompassLoader from '../../components/CompassLoader';

// Import local subcomponents
import TutorSidebar from './TutorSidebar';
import FullscreenChat from './FullscreenChat';
import LearnTab from './LearnTab';
import SmartNotesTab from './SmartNotesTab';
import PracticeBoardTab from './PracticeBoardTab';
import QuizLabTab from './QuizLabTab';
import RevisionDeckTab from './RevisionDeckTab';
import MockInterviewTab from './MockInterviewTab';

// Global Markdown Parsing Helpers
const parseInline = (text) => {
  if (!text) return '';
  const parts = [];
  let index = 0;
  
  // Match bold **text** or inline `code`
  const regex = /(\*\*|`)(.*?)\1/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > index) {
      parts.push(text.substring(index, match.index));
    }
    
    const delimiter = match[1];
    const content = match[2];
    
    if (delimiter === '**') {
      parts.push(<strong key={`bold-${match.index}`} className="font-bold text-on-surface">{content}</strong>);
    } else if (delimiter === '`') {
      parts.push(<code key={`code-${match.index}`} className="bg-surface-container-high px-1.5 py-0.5 rounded font-mono text-sm text-error">{content}</code>);
    }
    
    index = regex.lastIndex;
  }
  
  if (index < text.length) {
    parts.push(text.substring(index));
  }
  
  return parts.length > 0 ? parts : text;
};

const renderMarkdown = (text) => {
  if (!text) return null;

  // Split content by code blocks first
  const blocks = [];
  let remainingText = text;
  
  while (remainingText.includes('```')) {
    const startIdx = remainingText.indexOf('```');
    const endIdx = remainingText.indexOf('```', startIdx + 3);
    
    if (endIdx !== -1) {
      // Push text before code block
      const before = remainingText.substring(0, startIdx);
      if (before) blocks.push({ type: 'text', content: before });
      
      // Extract code block content
      const codeWithLang = remainingText.substring(startIdx + 3, endIdx);
      const firstNewline = codeWithLang.indexOf('\n');
      let lang = '';
      let code = codeWithLang;
      if (firstNewline !== -1) {
        lang = codeWithLang.substring(0, firstNewline).trim();
        code = codeWithLang.substring(firstNewline + 1);
      }
      blocks.push({ type: 'code', lang, content: code });
      
      remainingText = remainingText.substring(endIdx + 3);
    } else {
      break;
    }
  }
  
  if (remainingText) {
    blocks.push({ type: 'text', content: remainingText });
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIdx) => {
        if (block.type === 'code') {
          return (
            <div key={`code-block-${blockIdx}`} className="bg-slate-900 text-slate-100 p-5 rounded-lg font-mono text-sm overflow-x-auto border-l-4 border-primary my-3">
              {block.lang && (
                <div className="text-slate-400 font-sans uppercase text-[10px] tracking-widest font-bold mb-1.5">
                  {block.lang}
                </div>
              )}
              <pre className="text-emerald-400 whitespace-pre">{block.content.trim()}</pre>
            </div>
          );
        }

        // Process text lines
        const lines = block.content.split('\n');
        const listItems = [];
        const numListItems = [];
        const renderedElements = [];
        
        const flushList = (key) => {
          if (listItems.length > 0) {
            renderedElements.push(
              <ul key={key} className="list-disc pl-5 space-y-1 my-1">
                {listItems.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-body-md text-on-surface-variant leading-relaxed">
                    {parseInline(item)}
                  </li>
                ))}
              </ul>
            );
            listItems.length = 0;
          }
          if (numListItems.length > 0) {
            renderedElements.push(
              <ol key={`ol-${key}`} className="list-decimal pl-5 space-y-1 my-1">
                {numListItems.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-body-md text-on-surface-variant leading-relaxed">
                    {parseInline(item)}
                  </li>
                ))}
              </ol>
            );
            numListItems.length = 0;
          }
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          if (trimmed.startsWith('#### ')) {
            flushList(`list-${blockIdx}-${i}`);
            renderedElements.push(
              <h5 key={`h5-${blockIdx}-${i}`} className="font-bold text-on-surface mt-3 mb-1.5 leading-tight text-sm uppercase tracking-wide">
                {parseInline(trimmed.slice(5))}
              </h5>
            );
          } else if (trimmed.startsWith('### ')) {
            flushList(`list-${blockIdx}-${i}`);
            renderedElements.push(
              <h4 key={`h4-${blockIdx}-${i}`} className="font-bold text-on-surface mt-4 mb-1.5 leading-tight">
                {parseInline(trimmed.slice(4))}
              </h4>
            );
          } else if (trimmed.startsWith('## ')) {
            flushList(`list-${blockIdx}-${i}`);
            renderedElements.push(
              <h3 key={`h3-${blockIdx}-${i}`} className="font-bold text-on-surface mt-5 mb-2 leading-tight">
                {parseInline(trimmed.slice(3))}
              </h3>
            );
          } else if (trimmed.startsWith('# ')) {
            flushList(`list-${blockIdx}-${i}`);
            renderedElements.push(
              <h2 key={`h2-${blockIdx}-${i}`} className="font-extrabold text-on-surface mt-6 mb-3 leading-tight">
                {parseInline(trimmed.slice(2))}
              </h2>
            );
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            flushList(`list-num-${blockIdx}-${i}`);
            listItems.push(trimmed.slice(2));
          } else if (/^\d+\.\s/.test(trimmed)) {
            flushList(`list-disc-${blockIdx}-${i}`);
            const match = trimmed.match(/^\d+\.\s(.*)/);
            numListItems.push(match[1]);
          } else if (!trimmed) {
            flushList(`list-${blockIdx}-${i}`);
          } else {
            flushList(`list-${blockIdx}-${i}`);
            renderedElements.push(
              <p key={`p-${blockIdx}-${i}`} className="text-body-md text-on-surface-variant leading-relaxed mb-2">
                {parseInline(line)}
              </p>
            );
          }
        }
        
        flushList(`list-final-${blockIdx}`);
        return <div key={`block-${blockIdx}`}>{renderedElements}</div>;
      })}
    </div>
  );
};

const Topic = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { reloadUserProfile } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [learnContent, setLearnContent] = useState(null);

  const [activeTab, setActiveTab] = useState('learn');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // LinkedIn Modal State
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [linkedinDraft, setLinkedinDraft] = useState('');

  // AI Tutor Chat State
  const [showFullscreenChat, setShowFullscreenChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [showQuizAnswers, setShowQuizAnswers] = useState(false);
  const [quizAttemptPage, setQuizAttemptPage] = useState(1);

  // Mock Interview State
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewStatus, setInterviewStatus] = useState('idle'); // idle, evaluating, evaluated
  const [interviewEvaluation, setInterviewEvaluation] = useState(null);

  // Smart Notes State
  const [notes, setNotes] = useState('');
  const [originalNotes, setOriginalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [isNotesPreview, setIsNotesPreview] = useState(true);

  // Dynamic Concept Lab State
  const [practiceBoard, setPracticeBoard] = useState(null);
  const [practiceBoardLoading, setPracticeBoardLoading] = useState(false);

  // Flashcards Deck State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        setLoading(true);
        // Fetch topic details
        const resTopic = await api.get(`/roadmap/topic/${topicId}`);
        setTopic(resTopic.data.topic);
        const fetchedContent = resTopic.data.note?.content || '';
        setNotes(fetchedContent);
        setOriginalNotes(fetchedContent);

        // Fetch learn content
        const resLearn = await api.get(`/roadmap/topic/${topicId}/learn`);
        setLearnContent(resLearn.data);

        // Fetch Quiz
        const resQuiz = await api.get(`/roadmap/topic/${topicId}/quiz`);
        setQuizQuestions(resQuiz.data || []);
        const resQuizAttempts = await api.get(`/roadmap/topic/${topicId}/quiz/attempts`);
        setQuizAttempts(resQuizAttempts.data || []);

        // Fetch Interview Questions
        const resInterview = await api.get(`/interview/topic/${topicId}`);
        setInterviewQuestions(resInterview.data || []);
        if (resInterview.data && resInterview.data.length > 0) {
          setInterviewAnswer(resInterview.data[0].answer || '');
          const savedEvaluation = resInterview.data[0].evaluation;
          const hasSavedEvaluation = typeof savedEvaluation?.score === 'number';
          setInterviewEvaluation(hasSavedEvaluation ? savedEvaluation : null);
          setInterviewStatus(hasSavedEvaluation ? 'evaluated' : 'idle');
        }

        setPracticeBoardLoading(true);
        try {
          const resPractice = await api.get(`/roadmap/topic/${topicId}/practice`);
          setPracticeBoard(resPractice.data);
        } catch (practiceErr) {
          console.error('Failed to load practice board:', practiceErr);
          setPracticeBoard(null);
        } finally {
          setPracticeBoardLoading(false);
        }

        setMessages([
          { sender: 'ai', text: `Hi! I'm your Career GPS Tutor. Need help understanding ${resTopic.data.topic?.name || 'this topic'}?` }
        ]);

        // Auto-set status to in_progress on load
        if (resTopic.data.topic?.status === 'not_started') {
          await api.put(`/roadmap/topic/${topicId}/progress`, {
            progress: 10,
            status: 'in_progress'
          });
        }
      } catch (err) {
        console.error('Failed to load topic workspace:', err);
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchTopicData();
    }
  }, [topicId]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    triggerToast('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const generateLinkedInPost = () => {
    if (notes && notes.trim().length > 10) {
      // Clean up markdown headers, bold symbols, etc., from notes to make it look nice in post
      const cleanNotes = notes
        .replace(/[#*`_-]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .slice(0, 3) // Take the first few key points
        .join('\n• ');
        
      return `Excited to share my latest learnings on "${topic?.name || 'this topic'}"! 🚀\n\nHere are some of my key takeaways and personal study notes:\n• ${cleanNotes}\n\nContinuing my learning journey on Career GPS! #SystemDesign #CareerGPS #SoftwareEngineering #LearningDaily`;
    }
    
    return `Excited to share that I've just completed the "${topic?.name || 'Load Balancing'}" module on Career GPS! 🚀 Diving deep into system design trade-offs and implementation details. #SystemDesign #CareerGPS #LearningJourney`;
  };

  const handleOpenLinkedInModal = () => {
    setLinkedinDraft(generateLinkedInPost());
    setShowLinkedInModal(true);
  };

  const handleCopyPost = () => {
    navigator.clipboard.writeText(linkedinDraft);
    setCopiedPost(true);
    triggerToast('LinkedIn post draft copied!');
    setTimeout(() => {
      setCopiedPost(false);
      setShowLinkedInModal(false);
    }, 1500);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const res = await api.post(`/roadmap/topic/${topicId}/chat`, { message: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response || res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: "Trouble connecting to AI Tutor. Try again." }]);
    }
  };

  const askChatTip = async (tipType) => {
    const text = tipType === 'concept' 
      ? `Explain the core concept of ${topic?.name || 'this topic'}.` 
      : `Give me a system design interview question for ${topic?.name || 'this topic'}.`;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    try {
      const res = await api.post(`/roadmap/topic/${topicId}/chat`, { message: text });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response || res.data.reply }]);
    } catch (err) {
      console.error(err);
    }
  };

  // Handler for Gemini-style tools menu in FullscreenChat
  const handleToolSelect = (toolId) => {
    // Tab-switching tools: close chat and switch tab
    const tabMap = { flashcards: 'revision', notes: 'notes', quiz: 'quiz' };
    if (tabMap[toolId]) {
      setShowFullscreenChat(false);
      setActiveTab(tabMap[toolId]);
      return;
    }
    // Chat-based tools: send as AI chat message
    const prompts = {
      summary: `Give me a concise summary of ${topic?.name || 'this topic'}.`,
      concept: `Explain the core concept of ${topic?.name || 'this topic'}.`,
      interview: `Give me a system design interview question for ${topic?.name || 'this topic'}.`
    };
    const text = prompts[toolId];
    if (text) {
      setMessages(prev => [...prev, { sender: 'user', text }]);
      api.post(`/roadmap/topic/${topicId}/chat`, { message: text })
        .then(res => setMessages(prev => [...prev, { sender: 'ai', text: res.data.response || res.data.reply }]))
        .catch(err => console.error(err));
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/notes/topic/${topicId}`, { content: notes });
      triggerToast('Notes saved successfully!');
      setOriginalNotes(notes);
      
      // Auto complete check: if notes are long enough (>= 100 chars) and topic is not completed
      if (notes.trim().length >= 100 && topic?.status !== 'completed') {
        await api.put(`/roadmap/topic/${topicId}/progress`, {
          progress: 100,
          status: 'completed'
        });
        setTopic(prev => ({ ...prev, status: 'completed', progress: 100 }));
        triggerToast('Topic completed via Smart Notes! 🚀');
        reloadUserProfile();
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRestoreAutosave = () => {
    setNotes(originalNotes);
    triggerToast('Restored last saved notes!');
  };

  const handleNotesAI = async (actionType) => {
    try {
      triggerToast('AI Co-Pilot analyzing notes...');
      const res = await api.post(`/notes/topic/${topicId}/ai`, {
        type: actionType,
        content: notes
      });
      if (res.data.aiSuggestedContent) {
        const updatedNotes = notes + `\n\n[AI recommendations]:\n${res.data.aiSuggestedContent}`;
        setNotes(updatedNotes);
        setOriginalNotes(updatedNotes);
        triggerToast('AI recommendations added!');
        
        // Auto-switch to Preview mode to render the markdown automatically!
        setIsNotesPreview(true);

        // Auto-save to database
        setSavingNotes(true);
        try {
          await api.put(`/notes/topic/${topicId}`, { content: updatedNotes });
          triggerToast('AI notes auto-saved to database! 💾');
          
          // Auto complete check: if notes are long enough (>= 100 chars) and topic is not completed
          if (updatedNotes.trim().length >= 100 && topic?.status !== 'completed') {
            await api.put(`/roadmap/topic/${topicId}/progress`, {
              progress: 100,
              status: 'completed'
            });
            setTopic(prev => ({ ...prev, status: 'completed', progress: 100 }));
            triggerToast('Topic completed via Smart Notes! 🚀');
            reloadUserProfile();
          }
        } catch (saveErr) {
          console.error('Failed to auto-save generated notes:', saveErr);
          triggerToast('Failed to auto-save to database.');
        } finally {
          setSavingNotes(false);
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast('AI analysis failed.');
    }
  };

  const handleMockSubmit = async (e) => {
    e.preventDefault();
    if (!interviewAnswer.trim()) {
      triggerToast('Please type an answer first!');
      return;
    }

    const activeQuestion = interviewQuestions[currentQuestionIndex];
    if (!activeQuestion) return;

    setInterviewStatus('evaluating');
    try {
      const res = await api.put(`/interview/answer/${activeQuestion._id}`, {
        answer: interviewAnswer,
      });

      const updatedAnswer = res.data.qAnswer;
      setInterviewQuestions(prev => prev.map(q => (
        q._id === updatedAnswer._id ? updatedAnswer : q
      )));
      setInterviewEvaluation(res.data.evaluation);
      setInterviewStatus('evaluated');
      triggerToast('Evaluation completed successfully!');
      reloadUserProfile();
    } catch (err) {
      console.error(err);
      setInterviewStatus('idle');
      triggerToast('Failed to evaluate answer.');
    }
  };

  const handleSelectQuizOption = (idx) => {
    setSelectedQuizOption(idx);
    setQuizAnswers(prev => ({ ...prev, [currentQuizIndex]: idx }));
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      const prevAnswer = quizAnswers[currentQuizIndex + 1];
      setSelectedQuizOption(prevAnswer !== undefined ? prevAnswer : null);
    }
  };

  const handlePrevQuizQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
      const prevAnswer = quizAnswers[currentQuizIndex - 1];
      setSelectedQuizOption(prevAnswer !== undefined ? prevAnswer : null);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const res = await api.post(`/roadmap/topic/${topicId}/quiz/submit`, { answers: quizAnswers });
      setQuizScore(res.data.score);
      setQuizPassed(res.data.passed);
      setQuizSubmitted(true);
      setQuizCompleted(true);
      setQuizAttempts(prev => [res.data.attempt, ...prev]);
      setQuizAttemptPage(1);
      triggerToast(`Quiz completed! Score: ${res.data.score}/${res.data.totalQuestions}`);
      
      if (res.data.passed) {
        await api.put(`/roadmap/topic/${topicId}/progress`, {
          progress: 100,
          status: 'completed'
        });
        setTopic(prev => ({ ...prev, status: 'completed', progress: 100 }));
        triggerToast('Topic completed successfully! 🚀');
      }
      reloadUserProfile(); // Update XP
    } catch (err) {
      console.error(err);
      triggerToast('Failed to submit quiz.');
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizCompleted(false);
    setQuizScore(0);
    setQuizPassed(false);
    setShowQuizAnswers(false);
  };

  const flashcardsDeck = learnContent?.keyTakeaways && learnContent.keyTakeaways.length > 0
    ? learnContent.keyTakeaways.map((takeaway, idx) => ({
        q: `Key Concept ${idx + 1}: What is critical regarding ${topic?.name || 'this topic'}?`,
        a: takeaway
      }))
    : [
        {
          q: `Core definition of ${topic?.name || 'this topic'}?`,
          a: learnContent?.definition || topic?.summary || 'Review lessons and check smart notes.'
        }
      ];

  if (loading) {
    return <CompassLoader />;
  }

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-6 bg-background">
        <h2 className="font-headline-md text-headline-md text-on-surface">Topic not found</h2>
        <Link to="/roadmap" className="text-primary hover:underline">Back to Roadmap</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] bg-background relative select-none">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-primary text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined">stars</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* LEFT CONTENT WORKSPACE */}
      <section className="w-full lg:w-[65%] p-4 md:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto">
        
        {/* Breadcrumb & Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs md:font-label-sm text-on-surface-variant">
              <Link to="/roadmap" className="hover:text-primary transition-colors">Pathways</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <Link to={`/subject/${topic?.subject}`} className="hover:text-primary transition-colors">
                {topic?.lessonName || 'Subject Workspace'}
              </Link>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-headline-lg text-on-surface font-bold tracking-tight leading-tight">
              {topic?.name}
            </h2>
          </div>

          <button 
            onClick={handleOpenLinkedInModal}
            className="flex items-center gap-2 px-3 sm:px-4 h-9 sm:h-10 bg-surface-container-high text-primary hover:bg-primary/10 rounded-lg transition-all text-xs sm:text-sm md:text-label-md border border-outline-variant/30 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span className="hidden sm:inline">LinkedIn Update Draft</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-outline-variant/30 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'learn', label: 'Learn' },
            { id: 'notes', label: 'Smart Notes' },
            { id: 'practice', label: 'Concept Lab' },
            { id: 'quiz', label: 'Quiz Lab' },
            { id: 'revision', label: 'Revision Deck' },
            { id: 'mock', label: 'Mock Interview' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsFlipped(false); // Reset flashcard flip
              }}
              className={`px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm md:text-label-md font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* WORKSPACE PAGES (TABS CONTENT) */}
        <div className="flex-1 min-h-[300px]">
          
          {/* TAB 1: LEARN */}
          {activeTab === 'learn' && (
            <LearnTab
              learnContent={learnContent}
              topic={topic}
              copied={copied}
              handleCopyCode={handleCopyCode}
              renderMarkdown={renderMarkdown}
              parseInline={parseInline}
            />
          )}

          {/* TAB 2: SMART NOTES */}
          {activeTab === 'notes' && (
            <SmartNotesTab
              notes={notes}
              setNotes={setNotes}
              isNotesPreview={isNotesPreview}
              setIsNotesPreview={setIsNotesPreview}
              handleSaveNotes={handleSaveNotes}
              savingNotes={savingNotes}
              handleRestoreAutosave={handleRestoreAutosave}
              handleNotesAI={handleNotesAI}
              renderMarkdown={renderMarkdown}
            />
          )}

          {/* TAB 3: CONCEPT LAB */}
          {activeTab === 'practice' && (
            <PracticeBoardTab
              topic={topic}
              practiceBoard={practiceBoard}
              practiceBoardLoading={practiceBoardLoading}
            />
          )}

          {/* TAB 4: QUIZ LAB */}
          {activeTab === 'quiz' && (
            <QuizLabTab
              quizQuestions={quizQuestions}
              quizCompleted={quizCompleted}
              quizSubmitted={quizSubmitted}
              quizScore={quizScore}
              quizPassed={quizPassed}
              currentQuizIndex={currentQuizIndex}
              selectedQuizOption={selectedQuizOption}
              handleSelectQuizOption={handleSelectQuizOption}
              handlePrevQuizQuestion={handlePrevQuizQuestion}
              handleNextQuizQuestion={handleNextQuizQuestion}
              handleSubmitQuiz={handleSubmitQuiz}
              handleRetryQuiz={handleRetryQuiz}
              quizAnswers={quizAnswers}
              showQuizAnswers={showQuizAnswers}
              setShowQuizAnswers={setShowQuizAnswers}
              quizAttempts={quizAttempts}
              quizAttemptPage={quizAttemptPage}
              setQuizAttemptPage={setQuizAttemptPage}
            />
          )}

          {/* TAB 5: REVISION DECK */}
          {activeTab === 'revision' && (
            <RevisionDeckTab
              flashcardsDeck={flashcardsDeck}
              currentCardIndex={currentCardIndex}
              setCurrentCardIndex={setCurrentCardIndex}
              isFlipped={isFlipped}
              setIsFlipped={setIsFlipped}
              parseInline={parseInline}
            />
          )}

          {/* TAB 6: MOCK INTERVIEW */}
          {activeTab === 'mock' && (
            <MockInterviewTab
              interviewQuestions={interviewQuestions}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              interviewAnswer={interviewAnswer}
              setInterviewAnswer={setInterviewAnswer}
              handleMockSubmit={handleMockSubmit}
              interviewStatus={interviewStatus}
              interviewEvaluation={interviewEvaluation}
              setInterviewEvaluation={setInterviewEvaluation}
              setInterviewStatus={setInterviewStatus}
            />
          )}

        </div>
      </section>

      {/* RIGHT PANE: AI TUTOR SIDEBAR */}
      <TutorSidebar
        messages={messages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleChatSubmit={handleChatSubmit}
        askChatTip={askChatTip}
        topicName={topic?.name}
        setShowFullscreenChat={setShowFullscreenChat}
        renderMarkdown={renderMarkdown}
      />

      {/* Mobile Floating AI Tutor Button */}
      <button 
        onClick={() => setShowFullscreenChat(true)}
        className="lg:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 md:bottom-6 md:right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] border border-white/20"
        title="Chat with AI Tutor"
      >
        <span className="material-symbols-outlined text-2xl animate-pulse">forum</span>
      </button>

      {/* LinkedIn Post Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-primary text-white">
              <h3 className="font-headline-md flex items-center gap-2 font-bold text-lg">
                <span className="material-symbols-outlined text-white">share</span>
                LinkedIn Post Draft
              </h3>
              <button 
                className="material-symbols-outlined hover:bg-primary-container p-1 rounded-full transition-all text-white cursor-pointer" 
                onClick={() => setShowLinkedInModal(false)}
              >
                close
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tweak and copy your personalized post draft generated from your notes and learning takeaways.
              </p>
              
              <textarea
                value={linkedinDraft}
                onChange={(e) => setLinkedinDraft(e.target.value)}
                className="w-full h-48 bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm focus:outline-none focus:border-primary font-body-md leading-relaxed resize-none"
                placeholder="LinkedIn draft content..."
              />
              
              <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20">
                <button 
                  type="button"
                  onClick={() => setShowLinkedInModal(false)}
                  className="px-5 py-2.5 border border-outline-variant/30 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleCopyPost}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <span>{copiedPost ? 'Copied! ✔' : 'Copy Post Draft'}</span>
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMMERSIVE CHAT OVERLAY */}
      {showFullscreenChat && (
        <FullscreenChat
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleChatSubmit={handleChatSubmit}
          setShowFullscreenChat={setShowFullscreenChat}
          renderMarkdown={renderMarkdown}
          onToolSelect={handleToolSelect}
        />
      )}
    </div>
  );
};

export default Topic;
