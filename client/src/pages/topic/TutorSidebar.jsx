import React from 'react';

const TutorSidebar = ({
  messages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  askChatTip,
  topicName,
  setShowFullscreenChat,
  renderMarkdown
}) => {
  return (
    <aside className="hidden lg:flex lg:flex-1 bg-surface-container-low border-t lg:border-t-0 lg:border-l border-outline-variant/20 flex-col shrink-0 lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 lg:pr-8">
      
      {/* Tutor Header */}
      <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-white/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">forum</span>
          </div>
          <span className="font-headline-md text-headline-md text-sm font-bold text-on-surface">AI Career Tutor</span>
        </div>
        
        <button 
          onClick={() => setShowFullscreenChat(true)}
          className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_full</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30 h-[280px]">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            
            {/* Avatar */}
            {msg.sender === 'ai' ? (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[14px]">smart_toy</span>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 text-[10px] font-bold">
                JD
              </div>
            )}

            {/* Message text */}
            <div className={`p-3.5 rounded-xl text-sm leading-relaxed max-w-[85%] shadow-sm border ${
              msg.sender === 'user'
                ? 'bg-primary text-white rounded-tl-none border-primary'
                : 'bg-white text-on-surface rounded-tl-none border-outline-variant/15'
            }`}>
              {msg.sender === 'ai' ? renderMarkdown(msg.text) : msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion Chips & Form input container */}
      <div className="p-5 md:p-6 bg-primary/5 border-t border-primary/10 space-y-4 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => askChatTip('concept')}
            className="whitespace-nowrap px-3.5 py-1.5 bg-white hover:bg-primary/10 text-on-surface-variant hover:text-primary rounded-full text-xs font-bold border border-outline-variant/20 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Core Concept 💡
          </button>
          <button 
            onClick={() => askChatTip('interview')}
            className="whitespace-nowrap px-3.5 py-1.5 bg-white hover:bg-primary/10 text-on-surface-variant hover:text-primary rounded-full text-xs font-bold border border-outline-variant/20 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Interview Tip 🎯
          </button>
        </div>

        {/* Form input */}
        <form onSubmit={handleChatSubmit} className="relative">
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="w-full bg-white border border-primary/20 hover:border-primary/30 rounded-xl px-5 py-3.5 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm shadow-sm transition-all text-on-surface"
            placeholder={`Ask anything about ${topicName || 'this topic'}...`}
          />
          <button 
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-primary text-white rounded-lg transition-all hover:bg-primary-container active:scale-95 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] font-bold">arrow_upward</span>
          </button>
        </form>
      </div>
    </aside>
  );
};

export default TutorSidebar;
