import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  BookOpen, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  Play,
  Circle
} from 'lucide-react';

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedLessons, setExpandedLessons] = useState({});

  useEffect(() => {
    if (topics && topics.length > 0) {
      const initialExpanded = {};
      topics.forEach(t => {
        const lName = t.lessonName || 'General Fundamentals';
        initialExpanded[lName] = true;
      });
      setExpandedLessons(initialExpanded);
    }
  }, [topics]);

  const toggleLesson = (lName) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lName]: !prev[lName]
    }));
  };

  const fetchSubjectData = async () => {
    try {
      const res = await api.get(`/roadmap/subject/${subjectId}`);
      setSubject(res.data.subject);
      setTopics(res.data.topics);
    } catch (err) {
      showToast('Error loading subject details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectData();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <h3 className="font-bold text-sm text-[#111827]">Subject not found</h3>
        <Link to="/roadmap" className="text-[#2563EB] hover:underline text-xs mt-2 inline-block">Back to Roadmap</Link>
      </div>
    );
  }

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || t.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const totalTopics = topics.length;
  const completedCount = topics.filter(t => t.status === 'completed').length;
  const inProgressCount = topics.filter(t => t.status === 'in_progress').length;

  const groupedLessons = {};
  filteredTopics.forEach(t => {
    const lName = t.lessonName || 'General Fundamentals';
    if (!groupedLessons[lName]) {
      groupedLessons[lName] = [];
    }
    groupedLessons[lName].push(t);
  });

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <Link to="/roadmap" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#2563EB] transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Back to syllabus</span>
      </Link>

      {/* Progress Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#2563EB] uppercase bg-blue-50 px-2 py-0.5 rounded">Subject Module</span>
          <h2 className="text-xl font-extrabold text-[#111827] mt-1">{subject.name}</h2>
          <p className="text-xs text-[#6B7280]">
            Estimated duration: <strong className="text-[#111827]">{subject.estimatedTime}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-6 text-center">
          <div>
            <span className="text-lg font-bold text-[#111827] block">{totalTopics}</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Total Topics</span>
          </div>
          <div className="border-l pl-6 border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#22C55E] block">{completedCount}</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Completed</span>
          </div>
          <div className="border-l pl-6 border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#2563EB] block">{inProgressCount}</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">In Progress</span>
          </div>
        </div>
      </div>

      {/* Sticky Filters Toolbar */}
      <div className="sticky top-0 bg-[#F8FAFC] py-2 z-20 border-b border-[#E5E7EB] flex flex-col sm:flex-row gap-3 justify-between items-stretch">
        
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6B7280] pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search topic syllabus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-[#E5E7EB] rounded-lg outline-none bg-white text-xs text-[#111827] focus:border-[#2563EB] shadow-sm transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 border border-[#E5E7EB] rounded-lg bg-white text-xs font-semibold text-[#6B7280] outline-none focus:border-[#2563EB] shadow-sm cursor-pointer"
            >
              <option value="All">All Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 border border-[#E5E7EB] rounded-lg bg-white text-xs font-semibold text-[#6B7280] outline-none focus:border-[#2563EB] shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Lessons & Topics Accordion list */}
      {filteredTopics.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center text-xs text-[#6B7280]">
          No topics matched your search parameters.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedLessons).map((lName) => {
            const lessonTopics = groupedLessons[lName];
            const lessonTotal = lessonTopics.length;
            const lessonCompleted = lessonTopics.filter(t => t.status === 'completed').length;
            const lessonProgress = Math.round((lessonCompleted / lessonTotal) * 100);
            const isExpanded = !!expandedLessons[lName];

            return (
              <div 
                key={lName} 
                className="border border-[#E5E7EB] rounded-xl bg-white shadow-sm overflow-hidden"
              >
                {/* Lesson Header Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleLesson(lName)}
                  className="w-full text-left px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-[#F8FAFC] transition-colors cursor-pointer bg-white border-b border-gray-50"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-[#2563EB] uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                      Lesson Module
                    </span>
                    <h3 className="font-bold text-sm text-[#111827] mt-1">
                      {lName}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-semibold text-[#6B7280] w-full sm:w-auto justify-between sm:justify-end">
                    <span>📚 {lessonCompleted} / {lessonTotal} Topics</span>
                    <div className="w-20 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden shrink-0">
                      <div 
                        className="h-full bg-[#2563EB] transition-all duration-300" 
                        style={{ width: `${lessonProgress}%` }} 
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-[#111827]">{lessonProgress}%</span>
                  </div>
                </button>

                {/* Topics List (Lecture style, expanded or collapsed) */}
                {isExpanded && (
                  <div className="divide-y divide-[#E5E7EB] bg-white">
                    {lessonTopics.map((topic, tIdx) => {
                      const isCompleted = topic.status === 'completed';
                      const isInProgress = topic.status === 'in_progress';
                      const completionPercent = isCompleted ? 100 : isInProgress ? 50 : 0;

                      return (
                        <div
                          key={topic._id}
                          onClick={() => navigate(`/topic/${topic._id}`)}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer gap-3 group"
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            {/* Checkmark Status indicator */}
                            <div className="shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle className="w-4.5 h-4.5 text-[#22C55E]" />
                              ) : isInProgress ? (
                                <Play className="w-4.5 h-4.5 text-[#2563EB] fill-blue-50" />
                              ) : (
                                <Circle className="w-4.5 h-4.5 text-gray-300" />
                              )}
                            </div>

                            {/* Text details */}
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                                  Topic {tIdx + 1}
                                </span>
                                <h4 className="font-bold text-xs text-[#111827] group-hover:text-[#2563EB] transition-colors truncate">
                                  {topic.name}
                                </h4>
                              </div>
                              <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-1">
                                {topic.summary || 'Click to explore learning objectives, flashcards, notes and mock interview questions.'}
                              </p>
                            </div>
                          </div>

                          {/* Indicators Row */}
                          <div className="flex items-center space-x-3 shrink-0 text-[10px] text-[#6B7280] w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                            <span className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                              topic.difficulty === 'Beginner' ? 'bg-green-50 text-[#22C55E]' :
                              topic.difficulty === 'Intermediate' ? 'bg-amber-50 text-[#F59E0B]' : 'bg-red-50 text-[#EF4444]'
                            }`}>
                              {topic.difficulty}
                            </span>
                            
                            <span className="font-medium shrink-0">⏱️ {topic.estimatedHours} Hours</span>
                            
                            <span className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                              isCompleted ? 'bg-green-50 text-[#22C55E]' :
                              isInProgress ? 'bg-blue-50 text-[#2563EB]' : 'bg-gray-100 text-[#6B7280]'
                            }`}>
                              {completionPercent}% Completed
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
};

export default SubjectDetail;
