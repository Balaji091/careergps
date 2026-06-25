import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

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

  // Mock Interview State
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewConfidence, setInterviewConfidence] = useState(3);
  const [interviewStatus, setInterviewStatus] = useState('idle'); // idle, evaluating, evaluated
  const [interviewEvaluation, setInterviewEvaluation] = useState(null);

  // Smart Notes State
  const [notes, setNotes] = useState('');
  const [originalNotes, setOriginalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [isNotesPreview, setIsNotesPreview] = useState(true);

  // Visual Load Balancer Simulator State (Practice Board)
  const [lbAlgo, setLbAlgo] = useState('round-robin');
  const [servers, setServers] = useState([
    { name: 'Server A', connections: 2, capacity: 10, healthy: true },
    { name: 'Server B', connections: 5, capacity: 10, healthy: true },
    { name: 'Server C', connections: 1, capacity: 10, healthy: true }
  ]);
  const [simulatedRequests, setSimulatedRequests] = useState([]);
  const [activeNodeIndex, setActiveNodeIndex] = useState(null);

  // API Gateway Simulator State
  const [gwRoute, setGwRoute] = useState('/users');
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [gwLogs, setGwLogs] = useState([]);
  const [gwActiveNode, setGwActiveNode] = useState(null); // 'gateway', 'rate-limiter', 'service', 'block'
  const [gwRequestCount, setGwRequestCount] = useState(0);
  const [gwServiceTarget, setGwServiceTarget] = useState(null); // 'user-service', 'order-service', 'auth-service'

  // DB Indexing Simulator State
  const [indexEnabled, setIndexEnabled] = useState(false);
  const [dbRunning, setDbRunning] = useState(false);
  const [dbScanIndex, setDbScanIndex] = useState(-1);
  const [dbResults, setDbResults] = useState(null); // { executionTime, rowsScanned, found }

  // Microservices Chaos Simulator State
  const [dbHealthy, setDbHealthy] = useState(true);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [msActiveNode, setMsActiveNode] = useState(null); // 'client', 'gateway', 'cache', 'app', 'db'
  const [msLogs, setMsLogs] = useState([]);
  const [msStatus, setMsStatus] = useState('idle'); // 'idle', 'running', 'success', 'failed'

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

        // Fetch Interview Questions
        const resInterview = await api.get(`/interview/topic/${topicId}`);
        setInterviewQuestions(resInterview.data || []);
        if (resInterview.data && resInterview.data.length > 0) {
          setInterviewAnswer(resInterview.data[0].answer || '');
          setInterviewConfidence(resInterview.data[0].confidence || 3);
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

  const handleSimulateRequest = () => {
    let targetIndex = 0;
    if (lbAlgo === 'round-robin') {
      const lastIndex = simulatedRequests.length > 0 ? simulatedRequests[simulatedRequests.length - 1].serverIndex : -1;
      targetIndex = (lastIndex + 1) % servers.length;
    } else if (lbAlgo === 'least-connections') {
      let minVal = Infinity;
      servers.forEach((s, idx) => {
        if (s.connections < minVal) {
          minVal = s.connections;
          targetIndex = idx;
        }
      });
    } else {
      targetIndex = Math.floor(Math.random() * servers.length);
    }

    setActiveNodeIndex(targetIndex);
    setSimulatedRequests(prev => [...prev, { id: Date.now(), serverIndex: targetIndex }]);
    
    setServers(prev => prev.map((s, idx) => {
      if (idx === targetIndex) {
        return { ...s, connections: Math.min(s.capacity, s.connections + 1) };
      }
      return s;
    }));

    setTimeout(() => {
      setActiveNodeIndex(null);
    }, 500);
  };

  const handleResetSimulator = () => {
    setServers([
      { name: 'Server A', connections: 2, capacity: 10, healthy: true },
      { name: 'Server B', connections: 4, capacity: 10, healthy: true },
      { name: 'Server C', connections: 1, capacity: 10, healthy: true }
    ]);
    setSimulatedRequests([]);
    triggerToast('Simulator statistics reset.');
  };

  const handleSimulateSpike = () => {
    triggerToast('Simulating traffic burst (10 requests)...');
    let counter = 0;
    const interval = setInterval(() => {
      handleSimulateRequest();
      counter++;
      if (counter >= 10) clearInterval(interval);
    }, 200);
  };

  // API Gateway Routing & Rate Limiter Request Handler
  const handleGwRequest = () => {
    setGwActiveNode('gateway');
    setGwServiceTarget(null);
    setGwRequestCount(prev => {
      const nextCount = prev + 1;
      const now = new Date().toLocaleTimeString();
      
      setTimeout(() => {
        setGwActiveNode('rate-limiter');
        
        setTimeout(() => {
          // If rate limit is enabled, block every fourth request
          const limitExceeded = rateLimitEnabled && (nextCount % 4 === 0); 
          
          if (limitExceeded) {
            setGwActiveNode('block');
            setGwLogs(prevLogs => [`[${now}] ❌ BLOCKED: Rate limit exceeded (429 Too Many Requests) on ${gwRoute}`, ...prevLogs.slice(0, 8)]);
            triggerToast('429 Too Many Requests (Rate Limited!) 🛑');
          } else {
            let target = '';
            let serviceName = '';
            if (gwRoute === '/users') {
              target = 'user-service';
              serviceName = 'User Service';
            } else if (gwRoute === '/orders') {
              target = 'order-service';
              serviceName = 'Order Service';
            } else if (gwRoute === '/auth') {
              target = 'auth-service';
              serviceName = 'Auth Service';
            } else {
              target = 'block';
            }
            
            if (target === 'block') {
              setGwActiveNode('block');
              setGwLogs(prevLogs => [`[${now}] ⚠️ ROUTING FAILURE: Route ${gwRoute} not found (404 Not Found)`, ...prevLogs.slice(0, 8)]);
              triggerToast('404 Route Not Found ⚠️');
            } else {
              setGwActiveNode('service');
              setGwServiceTarget(target);
              setGwLogs(prevLogs => [`[${now}] 🟢 SUCCESS: Routed ${gwRoute} -> ${serviceName} (200 OK)`, ...prevLogs.slice(0, 8)]);
              triggerToast('200 OK: Routed successfully! 🟢');
            }
          }
        }, 600);
      }, 400);

      return nextCount;
    });
  };

  // DB Indexing and Search Query Handler
  const handleRunDbQuery = () => {
    if (dbRunning) return;
    setDbRunning(true);
    setDbScanIndex(-1);
    setDbResults(null);

    const targetId = 847; // Target User at row index 847
    
    if (indexEnabled) {
      // Simulate binary search steps through index
      let steps = [];
      let low = 0;
      let high = 1000;
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        steps.push(mid);
        if (mid === targetId) break;
        if (mid < targetId) low = mid + 1;
        else high = mid - 1;
      }
      
      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          setDbScanIndex(steps[stepIdx]);
          stepIdx++;
        } else {
          clearInterval(interval);
          setDbResults({
            executionTime: '0.03 ms',
            rowsScanned: steps.length,
            found: true
          });
          setDbRunning(false);
          triggerToast('Query completed using Index Seek! ⚡');
        }
      }, 180);
    } else {
      // Sequential table scan
      let currentScan = 0;
      const interval = setInterval(() => {
        if (currentScan < targetId) {
          setDbScanIndex(currentScan);
          currentScan += 43; // Step size to keep visualization readable
        } else {
          setDbScanIndex(targetId);
          clearInterval(interval);
          setDbResults({
            executionTime: '8.47 ms',
            rowsScanned: targetId,
            found: true
          });
          setDbRunning(false);
          triggerToast('Query completed using Full Table Scan! 🐢');
        }
      }, 60);
    }
  };

  // Chaos Monkey Resilience Request Handler
  const handleTriggerMsRequest = () => {
    if (msStatus === 'running') return;
    setMsStatus('running');
    setMsActiveNode('client');
    const now = new Date().toLocaleTimeString();
    
    setTimeout(() => {
      setMsActiveNode('gateway');
      
      setTimeout(() => {
        if (cacheEnabled) {
          setMsActiveNode('cache');
          setTimeout(() => {
            setMsStatus('success');
            setMsActiveNode(null);
            setMsLogs(prev => [`[${now}] ⚡ CACHE HIT: Retrieved from Redis Cache (Response: 200 OK in 2ms)`, ...prev.slice(0, 8)]);
            triggerToast('Cache Hit! Lightning-fast retrieval ⚡');
          }, 600);
        } else {
          setMsActiveNode('app');
          
          setTimeout(() => {
            if (dbHealthy) {
              setMsActiveNode('db');
              setTimeout(() => {
                setMsStatus('success');
                setMsActiveNode(null);
                setMsLogs(prev => [`[${now}] 🟢 SUCCESS: Fetched from DB (Response: 200 OK in 85ms)`, ...prev.slice(0, 8)]);
                triggerToast('Success: Fetched from Database! 🟢');
              }, 600);
            } else {
              setMsStatus('failed');
              setMsActiveNode(null);
              setMsLogs(prev => [`[${now}] ❌ DATABASE OUTAGE: Failed to connect to DB (Response: 500 Internal Server Error)`, ...prev.slice(0, 8)]);
              triggerToast('Error: Database is down! ❌');
            }
          }, 600);
        }
      }, 600);
    }, 400);
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
      // Save answer to database
      await api.put(`/interview/answer/${activeQuestion._id}`, {
        answer: interviewAnswer,
        confidence: interviewConfidence
      });
      
      // Perform AI simulation evaluation response
      setTimeout(() => {
        setInterviewStatus('evaluated');
        setInterviewEvaluation({
          score: 80 + Math.floor(Math.random() * 16),
          verdict: 'Strong Technical Depth',
          strengths: 'Excellent conceptual breakdown and mention of practical constraints.',
          gaps: 'Consider adding edge case recovery strategies.'
        });
        triggerToast('Evaluation completed successfully!');
        reloadUserProfile(); // Sync gamification XP updates
      }, 1200);
    } catch (err) {
      console.error(err);
      setInterviewStatus('idle');
      triggerToast('Failed to save answer.');
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
    const score = quizQuestions.reduce((acc, q, idx) => acc + (quizAnswers[idx] === q.correctIndex ? 1 : 0), 0);
    setQuizScore(score);
    setQuizSubmitted(true);
    setQuizCompleted(true);
    
    try {
      await api.post(`/roadmap/topic/${topicId}/quiz/submit`, { score });
      triggerToast(`Quiz completed! Score: ${score}/5`);
      
      // Auto complete topic if score >= 3
      if (score >= 3) {
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
    }
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
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
      </div>
    );
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
            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm">
              <Link to="/roadmap" className="hover:text-primary transition-colors">Pathways</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <Link to={`/subject/${topic?.subject}`} className="hover:text-primary transition-colors">Subject Workspace</Link>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-primary font-medium">{topic?.name}</span>
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
            { id: 'practice', label: 'Practice Board' },
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

          {/* TAB 3: PRACTICE BOARD */}
          {activeTab === 'practice' && (
            <PracticeBoardTab
              topic={topic}
              lbAlgo={lbAlgo}
              setLbAlgo={setLbAlgo}
              servers={servers}
              activeNodeIndex={activeNodeIndex}
              handleSimulateRequest={handleSimulateRequest}
              handleSimulateSpike={handleSimulateSpike}
              handleResetSimulator={handleResetSimulator}
              gwRoute={gwRoute}
              setGwRoute={setGwRoute}
              rateLimitEnabled={rateLimitEnabled}
              setRateLimitEnabled={setRateLimitEnabled}
              gwActiveNode={gwActiveNode}
              gwServiceTarget={gwServiceTarget}
              handleGwRequest={handleGwRequest}
              gwLogs={gwLogs}
              indexEnabled={indexEnabled}
              setIndexEnabled={setIndexEnabled}
              dbRunning={dbRunning}
              dbScanIndex={dbScanIndex}
              dbResults={dbResults}
              handleRunDbQuery={handleRunDbQuery}
              dbHealthy={dbHealthy}
              setDbHealthy={setDbHealthy}
              cacheEnabled={cacheEnabled}
              setCacheEnabled={setCacheEnabled}
              msActiveNode={msActiveNode}
              msLogs={msLogs}
              msStatus={msStatus}
              handleTriggerMsRequest={handleTriggerMsRequest}
            />
          )}

          {/* TAB 4: QUIZ LAB */}
          {activeTab === 'quiz' && (
            <QuizLabTab
              quizQuestions={quizQuestions}
              quizCompleted={quizCompleted}
              quizSubmitted={quizSubmitted}
              quizScore={quizScore}
              currentQuizIndex={currentQuizIndex}
              setCurrentQuizIndex={setCurrentQuizIndex}
              selectedQuizOption={selectedQuizOption}
              handleSelectQuizOption={handleSelectQuizOption}
              handlePrevQuizQuestion={handlePrevQuizQuestion}
              handleNextQuizQuestion={handleNextQuizQuestion}
              handleSubmitQuiz={handleSubmitQuiz}
              quizAnswers={quizAnswers}
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
              interviewConfidence={interviewConfidence}
              setInterviewConfidence={setInterviewConfidence}
              handleMockSubmit={handleMockSubmit}
              interviewStatus={interviewStatus}
              interviewEvaluation={interviewEvaluation}
              reloadUserProfile={reloadUserProfile}
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
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border border-white/20"
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
        />
      )}
    </div>
  );
};

export default Topic;
