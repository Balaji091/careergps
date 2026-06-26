import React from 'react';

const ToastAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 right-6 bg-primary text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2 border border-outline-variant/30">
      <span className="material-symbols-outlined">stars</span>
      <span className="font-label-md text-label-md">{message}</span>
    </div>
  );
};

export default ToastAlert;
