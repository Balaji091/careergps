import React from 'react';

const SubjectChat = ({
  showChat,
  setShowChat,
  messages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  askPredefined
}) => {
  if (!showChat) {
    return (
      <button 
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        title="Chat with AI Tutor"
      >
        <span className="material-symbols-outlined text-2xl animate-pulse">forum</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[480px] bg-white border border-outline-variant/30 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/25 bg-surface-container flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-primary">
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="font-label-md font-bold text-sm">Subject AI Tutor</span>
        </div>
        <button 
          onClick={() => setShowChat(false)}
          className="p-1 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-lowest">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] border shadow-sm ${
              msg.sender === 'user'
                ? 'bg-primary text-white border-primary rounded-tr-none'
                : 'bg-white text-on-surface border-outline-variant/20 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Chips Suggestions */}
      <div className="p-3 bg-white border-t border-outline-variant/15 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <button 
          onClick={() => askPredefined("What are the most common interview questions for this subject?")}
          className="whitespace-nowrap px-2.5 py-1 bg-surface-container-high hover:bg-primary/15 text-on-surface-variant hover:text-primary rounded-full text-[10px] font-bold border border-outline-variant/20 transition-all shrink-0 cursor-pointer"
        >
          Interview Questions ❓
        </button>
        <button 
          onClick={() => askPredefined("Explain the hardest topic here in simple terms.")}
          className="whitespace-nowrap px-2.5 py-1 bg-surface-container-high hover:bg-primary/15 text-on-surface-variant hover:text-primary rounded-full text-[10px] font-bold border border-outline-variant/20 transition-all shrink-0 cursor-pointer"
        >
          Explain Hardest Topic 🧠
        </button>
      </div>

      {/* Form Input */}
      <div className="p-3 bg-surface-container-high border-t border-outline-variant/30 shrink-0">
        <form onSubmit={handleChatSubmit} className="relative">
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs shadow-sm transition-all"
            placeholder="Ask about this subject..."
          />
          <button 
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-primary text-white rounded-lg transition-all hover:bg-primary-container active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubjectChat;
