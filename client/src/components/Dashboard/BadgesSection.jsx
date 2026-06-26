import React from 'react';

const BadgesSection = ({ badgeItems, onSelectCertificate }) => (
  <section className="space-y-4">
    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Certifications & Badges</h2>
    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
      {badgeItems.map((badge, idx) => (
        <div
          key={idx}
          onClick={() => badge.isCertificate && onSelectCertificate(badge)}
          className={`flex-none w-48 bg-white border border-outline-variant/30 rounded-xl p-4 flex flex-col items-center text-center shadow-sm transition-all hover:scale-[1.03] duration-200 ${
            badge.isCertificate ? 'cursor-pointer border-amber-300 bg-amber-50/10 hover:border-amber-400' : ''
          } ${!badge.active ? 'opacity-60' : ''}`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner ${badge.color}`}>
            <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface mb-1 font-bold">{badge.name}</span>
          <span className="text-[10px] text-on-surface-variant uppercase font-black">{badge.earned}</span>
          {badge.isCertificate && <span className="text-[10px] text-amber-700 font-bold hover:underline mt-2">View Certificate</span>}
        </div>
      ))}
    </div>
  </section>
);

export default BadgesSection;
