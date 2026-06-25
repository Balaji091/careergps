import React from 'react';

const LearnTab = ({
  learnContent,
  topic,
  copied,
  handleCopyCode,
  renderMarkdown,
  parseInline
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-outline-variant/20 p-6 md:p-8 rounded-xl shadow-sm leading-relaxed">
        <div className="font-body-lg text-body-lg text-on-surface mb-6 font-semibold">
          {renderMarkdown(learnContent?.definition || topic?.summary)}
        </div>
        <div className="text-body-md text-on-surface-variant mb-6 leading-relaxed">
          {renderMarkdown(learnContent?.detailedExplanation)}
        </div>
        
        {learnContent?.realWorldExample && (
          <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <h4 className="font-bold text-primary mb-1">Real-World Case Study</h4>
            <div className="text-body-sm leading-relaxed">
              {renderMarkdown(learnContent.realWorldExample)}
            </div>
          </div>
        )}

        {learnContent?.useCases && learnContent.useCases.length > 0 && (
          <div className="mb-6">
            <h3 className="font-headline-md text-headline-md mb-3 text-on-surface">Standard Use Cases</h3>
            <ul className="space-y-3">
              {learnContent.useCases.map((uc, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                  <span className="text-body-md text-on-surface">{parseInline(uc)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {learnContent?.commonMistakes && learnContent.commonMistakes.length > 0 && (
          <div className="mb-6">
            <h3 className="font-headline-md text-headline-md mb-3 text-error">Common Engineering Pitfalls</h3>
            <ul className="space-y-3">
              {learnContent.commonMistakes.map((pit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                  <span className="text-body-md text-on-surface">{parseInline(pit)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reference code config box */}
        <div className="bg-slate-900 text-slate-100 p-6 rounded-lg font-mono text-sm overflow-x-auto border-l-4 border-primary">
          <div className="flex justify-between mb-3 text-slate-400 font-sans uppercase text-[10px] tracking-widest font-bold">
            <span>Reference Example</span>
            <button 
              onClick={() => handleCopyCode(`# Reference setup for ${topic?.name}\n# Focus on scaling, latency reduction and fault isolation.`)} 
              className="cursor-pointer hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded"
            >
              <span className="material-symbols-outlined text-xs">content_copy</span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-emerald-400">
            {`# Reference setup for ${topic?.name}\n# Focus on scaling, latency reduction and fault isolation.`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LearnTab;
