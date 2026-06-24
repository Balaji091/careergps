import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { CheckCircle2, Circle, Play, Loader2, ArrowRight } from 'lucide-react';

const Roadmap = () => {
  const { roadmap, loadingRoadmap, fetchActiveRoadmap } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  if (loadingRoadmap) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center max-w-md mx-auto space-y-4 shadow-sm mt-10">
        <h2 className="text-base font-bold text-[#111827]">No active roadmap found</h2>
        <p className="text-xs text-[#6B7280]">Go to Onboarding to build a syllabus plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Syllabus Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#2563EB] uppercase bg-blue-50 px-2 py-0.5 rounded">Career Goal Syllabus</span>
          <h2 className="text-xl font-extrabold text-[#111827] mt-1">{roadmap.roadmap?.role} Syllabus Plan</h2>
          <p className="text-xs text-[#6B7280]">
            Level: <strong className="text-[#111827]">{roadmap.roadmap?.difficulty}</strong> | 
            Timeline: <strong className="text-[#111827]">{roadmap.roadmap?.estimatedDays} Days</strong>
          </p>
        </div>
      </div>

      {/* Visually connected vertical flowchart list (Roadmap.sh style) */}
      <div className="relative border-l-2 border-[#E5E7EB] ml-5 pl-6 space-y-6">
        {roadmap.subjects?.map((subj, index) => {
          const isCompleted = subj.status === 'completed';
          const isInProgress = subj.status === 'in_progress';
          
          return (
            <div key={subj._id} className="relative group">
              {/* Connector Bullet badge node */}
              <span className={`absolute -left-[37px] top-3.5 w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-sm z-10 transition-colors ${
                isCompleted ? 'border-[#22C55E] text-[#22C55E] bg-green-50' : 
                isInProgress ? 'border-[#2563EB] text-[#2563EB] bg-blue-50' : 'border-[#E5E7EB] text-[#6B7280]'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white bg-[#22C55E] rounded-full" />
                ) : isInProgress ? (
                  <Play className="w-2.5 h-2.5 fill-current text-[#2563EB]" />
                ) : (
                  <span className="text-[10px] font-bold">{index + 1}</span>
                )}
              </span>

              {/* Clickable Card wrapper */}
              <div
                onClick={() => navigate(`/subject/${subj._id}`)}
                className="bg-white border border-[#E5E7EB] hover:border-[#2563EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-bold text-sm text-[#111827] group-hover:text-[#2563EB] transition-colors truncate">
                      {subj.name}
                    </h3>
                    <span className={`text-[8px] px-1.5 py-0.5 font-bold rounded uppercase shrink-0 ${
                      isCompleted ? 'bg-green-50 text-[#22C55E]' : 
                      isInProgress ? 'bg-blue-50 text-[#2563EB]' : 'bg-gray-100 text-[#6B7280]'
                    }`}>
                      {subj.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-[#6B7280]">
                    <span>⏳ {subj.estimatedTime}</span>
                    <span>•</span>
                    <span>📚 {subj.completedCount || 0} / {subj.topicsCount || 0} Topics Completed</span>
                  </div>
                </div>

                {/* Progress bar inside cards */}
                <div className="w-full sm:w-44 space-y-1 shrink-0">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-[#6B7280]">
                    <span>Subject progress</span>
                    <span>{subj.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-[#22C55E]' : 'bg-[#2563EB]'}`}
                      style={{ width: `${subj.progress || 0}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default Roadmap;
