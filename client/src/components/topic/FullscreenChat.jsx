import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const TOOLS_MENU = [
  { id: 'flashcards', icon: 'style', label: 'Flash Cards', color: 'text-amber-600 bg-amber-50' },
  { id: 'summary', icon: 'summarize', label: 'Summary', color: 'text-indigo-600 bg-indigo-50' },
  { id: 'notes', icon: 'edit_note', label: 'Generate Notes', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'concept', icon: 'lightbulb', label: 'Core Concept', color: 'text-primary bg-primary/10' },
  { id: 'interview', icon: 'record_voice_over', label: 'Interview Tip', color: 'text-violet-600 bg-violet-50' },
  { id: 'quiz', icon: 'quiz', label: 'Quick Quiz', color: 'text-rose-600 bg-rose-50' },
];

const FullscreenChat = ({
  messages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  setShowFullscreenChat,
  renderMarkdown,
  onToolSelect
}) => {
  const [showTools, setShowTools] = useState(false);

  const handleToolClick = (toolId) => {
    setShowTools(false);
    if (onToolSelect) {
      onToolSelect(toolId);
    } else {
      const toolLabels = { flashcards: 'Generate flash cards for this topic', summary: 'Summarize this topic', notes: 'Generate study notes', concept: 'Explain the core concept', interview: 'Give me an interview tip', quiz: 'Give me a quick quiz question' };
      setChatInput(toolLabels[toolId] || '');
    }
  };

  // Use createPortal to render directly on document.body — escapes any parent stacking context
  return createPortal(
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-white flex flex-col overflow-hidden animate-in fade-in duration-300"
      style={{ zIndex: 99999 }}
    >
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 sm:px-6 md:px-10 border-b border-outline-variant/20 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">forum</span>
          <h3 className="font-bold text-sm sm:text-lg text-on-surface">AI Tutoring Session</h3>
        </div>
        <button 
          onClick={() => setShowFullscreenChat(false)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </header>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-5 max-w-4xl mx-auto w-full custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 text-white ${
              msg.sender === 'ai' ? 'bg-primary' : 'bg-secondary'
            }`}>
              <span className="material-symbols-outlined text-base sm:text-xl">
                {msg.sender === 'ai' ? 'smart_toy' : 'person'}
              </span>
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface-variant">
                {msg.sender === 'ai' ? 'AI Career Tutor' : 'You'}
              </p>
              <div className="text-sm sm:text-base text-on-surface leading-relaxed">
                {msg.sender === 'ai' ? renderMarkdown(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area — always visible at bottom */}
      <div className="shrink-0 border-t border-outline-variant/20 bg-white relative">
        
        {/* Tools popup menu */}
        {showTools && (
          <div className="absolute bottom-full left-0 right-0 p-3 bg-white border-t border-outline-variant/15 shadow-lg animate-in slide-in-from-bottom-4 duration-200">
            <div className="max-w-4xl mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2.5 px-1">AI Tools</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TOOLS_MENU.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-outline-variant/15 hover:shadow-md transition-all active:scale-95 cursor-pointer ${tool.color}`}
                  >
                    <span className="material-symbols-outlined text-lg">{tool.icon}</span>
                    <span className="text-[10px] font-bold leading-tight text-center">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-3 pb-4">
          <form 
            onSubmit={handleChatSubmit} 
            className="max-w-4xl mx-auto flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-2 py-1 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all"
          >
            {/* Tools toggle button (Gemini spark icon) */}
            <button
              type="button"
              onClick={() => setShowTools(!showTools)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
                showTools 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`}
              title="AI Tools"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {showTools ? 'close' : 'auto_awesome'}
              </span>
            </button>

            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm py-2.5 text-on-surface min-w-0" 
              placeholder="Ask anything..."
              onFocus={() => setShowTools(false)}
            />

            <button 
              type="submit"
              className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-xl transition-all hover:bg-primary-container active:scale-95 shadow-md shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg font-bold">arrow_upward</span>
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FullscreenChat;
