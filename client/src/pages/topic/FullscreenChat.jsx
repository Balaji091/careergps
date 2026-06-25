import React from 'react';

const FullscreenChat = ({
  messages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  setShowFullscreenChat,
  renderMarkdown
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-300">
      <header className="h-16 flex items-center justify-between px-6 md:px-10 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">forum</span>
          <h3 className="font-headline-md text-headline-md text-lg font-bold">Immersive AI Tutoring Session</h3>
        </div>
        <button 
          onClick={() => setShowFullscreenChat(false)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant"
        >
          <span className="material-symbols-outlined">close_fullscreen</span>
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-4xl mx-auto w-full custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white ${
              msg.sender === 'ai' ? 'bg-primary' : 'bg-secondary'
            }`}>
              <span className="material-symbols-outlined">
                {msg.sender === 'ai' ? 'smart_toy' : 'person'}
              </span>
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-bold text-on-surface-variant">
                {msg.sender === 'ai' ? 'AI Career Tutor' : 'You (John Doe)'}
              </p>
              <div className="text-body-lg text-on-surface leading-relaxed">
                {msg.sender === 'ai' ? renderMarkdown(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 pb-8 sm:p-6 border-t border-outline-variant/20 bg-surface-container-lowest shrink-0">
        <form 
          onSubmit={handleChatSubmit} 
          className="max-w-4xl mx-auto flex gap-3"
        >
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-6 py-4 outline-none focus:border-primary text-body-lg" 
            placeholder="Continue the immersive session..."
          />
          <button 
            type="submit"
            className="px-6 bg-primary hover:bg-primary-container text-white rounded-2xl font-label-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <span>Send Message</span>
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default FullscreenChat;
