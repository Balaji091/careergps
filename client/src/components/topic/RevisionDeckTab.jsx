import React from 'react';

const RevisionDeckTab = ({
  flashcardsDeck,
  currentCardIndex,
  setCurrentCardIndex,
  isFlipped,
  setIsFlipped,
  parseInline
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-8 py-8">
        
        {/* 3D Flippable Flashcard */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-md h-64 cursor-pointer relative transition-all duration-500 transform"
          style={{ 
            perspective: '1000px',
          }}
        >
          <div 
            className={`w-full h-full duration-500 rounded-2xl shadow-xl border border-outline-variant/30 p-8 flex flex-col justify-between items-center text-center relative ${
              isFlipped ? 'bg-secondary-container/5 border-secondary/30' : 'bg-white'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isFlipped ? 'rotateY(180deg)' : 'none'
            }}
          >
            {/* Front Content */}
            <div 
              className="absolute inset-0 p-8 flex flex-col justify-between items-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm font-bold">
                {currentCardIndex + 1}/{flashcardsDeck.length}
              </span>
              <p className="font-headline-md text-headline-md font-bold text-on-surface leading-snug">
                {parseInline(flashcardsDeck[currentCardIndex]?.q)}
              </p>
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">flip</span>
                Click card to reveal answer
              </span>
            </div>

            {/* Back Content */}
            <div 
              className="absolute inset-0 p-8 flex flex-col justify-between items-center"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <span className="bg-emerald-50 text-[#10b981] border border-emerald-200 px-3 py-1 rounded-full font-label-sm font-bold">
                Answer Key
              </span>
              <p className="text-body-md text-on-surface leading-relaxed">
                {parseInline(flashcardsDeck[currentCardIndex]?.a)}
              </p>
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">flip</span>
                Click to flip back
              </span>
            </div>
          </div>
        </div>

        {/* Card Controls */}
        <div className="flex gap-4 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
              setCurrentCardIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentCardIndex === 0}
            className="p-3 bg-white border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          <span className="font-label-md text-on-surface font-semibold">
            {currentCardIndex + 1} / {flashcardsDeck.length}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
              setCurrentCardIndex(prev => Math.min(flashcardsDeck.length - 1, prev + 1));
            }}
            disabled={currentCardIndex === flashcardsDeck.length - 1}
            className="p-3 bg-white border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisionDeckTab;
