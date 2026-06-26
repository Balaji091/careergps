import React from 'react';

const ActiveSubjectsSection = ({ navigate, subjects }) => (
  <section className="space-y-4">
    <div className="flex justify-between items-end flex-wrap gap-2">
      <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">Active Subjects</h2>
      <span onClick={() => navigate('/roadmap')} className="font-label-md text-label-md text-primary hover:underline cursor-pointer font-bold">View All Pathways</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {subjects.length > 0 ? subjects.map((subject) => {
        const categoryColor = subject.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-primary/10 text-primary';
        return (
          <div key={subject._id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold group-hover:text-primary transition-colors">{subject.name}</h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">{subject.estimatedTime || '10 days'} estimated</span>
                </div>
                <span className={`${categoryColor} px-2 py-1 rounded text-[10px] font-bold uppercase`}>{subject.difficulty || 'Core'}</span>
              </div>
              <div className="mt-auto pt-6">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">{subject.progress}% Completed</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mb-6 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${subject.progress}%` }} />
                </div>
                <button
                  onClick={() => navigate(`/subject/${subject._id}`)}
                  className="w-full py-3 bg-primary text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 duration-100 ease-in-out cursor-pointer shadow-md"
                >
                  Resume Study
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                </button>
              </div>
            </div>
          </div>
        );
      }) : (
        <p className="col-span-full text-center text-sm text-on-surface-variant italic py-6">No subjects generated in your learning pathway yet. Access your curriculum roadmap to get started!</p>
      )}
    </div>
  </section>
);

export default ActiveSubjectsSection;
