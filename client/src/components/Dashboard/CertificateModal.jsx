import React from 'react';

const CertificateModal = ({ certificate, onClose, user }) => {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-on-surface/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 relative animate-in zoom-in-95 duration-300">
        <div className="bg-[#fdfcfa] border-[16px] border-double border-amber-800/20 m-4 rounded-xl flex flex-col justify-between p-8 text-center relative z-10 shadow-inner">
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800/30" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-800/30" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-800/30" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800/30" />
          <button onClick={onClose} className="absolute top-6 right-6 material-symbols-outlined text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-all cursor-pointer z-50">
            close
          </button>
          <div className="space-y-2 mt-4">
            <span className="font-label-sm text-label-sm text-amber-800 tracking-widest font-black uppercase block">Career GPS Pathway Certification</span>
            <h3 className="font-serif text-3xl md:text-4xl text-amber-900 font-bold tracking-wide italic">Certificate of Completion</h3>
          </div>
          <div className="my-6 space-y-4">
            <p className="font-serif text-sm md:text-base text-on-surface-variant italic">This certifies that</p>
            <h4 className="font-sans text-2xl md:text-3xl text-on-surface font-extrabold tracking-wide uppercase border-b border-amber-800/10 pb-2 max-w-md mx-auto">
              {user?.name || 'User'}
            </h4>
            <p className="font-serif text-sm md:text-base text-on-surface-variant leading-relaxed italic max-w-lg mx-auto">
              has successfully completed all subject modules and met the target criteria for the professional learning curriculum of
            </p>
            <h5 className="font-sans text-xl md:text-2xl text-primary font-bold tracking-wide">{certificate.name.replace('Certificate: ', '')}</h5>
          </div>
          <div className="flex justify-between items-end mt-4 px-6 gap-6">
            <div className="text-left">
              <div className="w-28 border-b border-amber-800/30 pb-1 text-center font-mono text-xs text-on-surface-variant">{certificate.earned.replace('Earned ', '')}</div>
              <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mt-1 text-center">Date Issued</span>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-20">
                <span className="material-symbols-outlined text-amber-900 text-3xl font-black">workspace_premium</span>
              </div>
              <div className="absolute w-20 h-20 bg-amber-500/20 rounded-full animate-ping z-10" />
            </div>
            <div className="text-right">
              <div className="w-28 border-b border-amber-800/30 pb-1 text-center font-serif text-xs text-amber-900 italic">AI Coach</div>
              <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mt-1 text-center">Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
