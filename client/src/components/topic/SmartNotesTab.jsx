import React from 'react';

const SmartNotesTab = ({
  notes,
  setNotes,
  isNotesPreview,
  setIsNotesPreview,
  handleSaveNotes,
  savingNotes,
  handleRestoreAutosave,
  handleNotesAI,
  renderMarkdown
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-200 h-full">
      {/* Note Editor Area */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-on-surface font-bold">My Study Notes</h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setIsNotesPreview(!isNotesPreview)}
              className="px-3.5 h-9 bg-surface-container-high hover:bg-primary/10 text-on-surface-variant hover:text-primary rounded-lg transition-colors font-label-md flex items-center gap-1.5 border border-outline-variant/30 text-xs font-bold cursor-pointer"
              title={isNotesPreview ? "Switch to Editor" : "Switch to Preview"}
            >
              <span className="material-symbols-outlined text-[16px]">{isNotesPreview ? 'edit' : 'visibility'}</span>
              <span>{isNotesPreview ? 'Edit' : 'Preview'}</span>
            </button>
            <button 
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant disabled:opacity-40 cursor-pointer"
              title="Save notes"
            >
              <span className="material-symbols-outlined">{savingNotes ? 'sync' : 'save'}</span>
            </button>
            <button 
              onClick={handleRestoreAutosave}
              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant cursor-pointer"
              title="Restore last saved"
            >
              <span className="material-symbols-outlined">history</span>
            </button>
          </div>
        </div>
        {isNotesPreview ? (
          <div className="flex-1 w-full min-h-[300px] p-6 bg-white border border-outline-variant/20 rounded-xl shadow-sm overflow-y-auto max-h-[500px] prose prose-sm leading-relaxed">
            {notes.trim() ? (
              renderMarkdown(notes)
            ) : (
              <p className="text-on-surface-variant/40 italic text-sm">No notes written yet. Switch to Editor to start writing!</p>
            )}
          </div>
        ) : (
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 w-full min-h-[300px] p-6 bg-white border border-outline-variant/20 rounded-xl shadow-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/10 resize-none font-body-md" 
            placeholder="Start typing your topic notes here (Markdown supported!)..."
          ></textarea>
        )}
      </div>

      {/* Notes AI Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
        <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-primary mb-3">
            <span className="material-symbols-outlined text-[20px]">magic_button</span>
            <span className="font-label-md font-bold text-primary">AI Notes Companion</span>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => handleNotesAI('flashcards')}
              className="w-full bg-white text-on-surface px-4 py-3 rounded-lg shadow-sm border border-outline-variant/30 flex items-center gap-3 hover:bg-primary/5 transition-all text-sm font-label-md font-bold text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">flash_on</span>
              <span>Generate Flashcards</span>
            </button>
            
            <button 
              onClick={() => handleNotesAI('summary')}
              className="w-full bg-white text-on-surface px-4 py-3 rounded-lg shadow-sm border border-outline-variant/30 flex items-center gap-3 hover:bg-primary/5 transition-all text-sm font-label-md font-bold text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">summarize</span>
              <span>Summarize Notes</span>
            </button>
            
            <button 
              onClick={() => handleNotesAI('revision')}
              className="w-full bg-white text-on-surface px-4 py-3 rounded-lg shadow-sm border border-outline-variant/30 flex items-center gap-3 hover:bg-primary/5 transition-all text-sm font-label-md font-bold text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">event_note</span>
              <span>Revision Plan</span>
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Recent Insights</span>
          <div className="mt-3 space-y-3">
            <div className="text-xs text-on-surface-variant border-l-2 border-primary/30 pl-3 py-1 leading-normal">
              Write down system diagrams and hardware configs to review later.
            </div>
            <div className="text-xs text-on-surface-variant border-l-2 border-primary/30 pl-3 py-1 leading-normal">
              Focus on trade-offs and bottleneck identification in your notes.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SmartNotesTab;
