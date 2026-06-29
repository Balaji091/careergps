import React, { useEffect, useRef, useState } from 'react';

const GoogleSignInButton = ({ disabled = false, onError, onSuccess, text = 'continue_with' }) => {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    let cancelled = false;
    let attempts = 0;

    const renderButton = () => {
      if (cancelled) return;

      if (!window.google?.accounts?.id) {
        attempts += 1;
        if (attempts < 30) {
          window.setTimeout(renderButton, 100);
        } else {
          onError?.('Google sign-in could not load. Check your network and Google client ID.');
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) {
            onError?.('Google did not return a sign-in credential.');
            return;
          }
          await onSuccess(response.credential);
        },
      });

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text,
        width: Math.min(buttonRef.current.offsetWidth || 384, 400),
      });
      setReady(true);
    };

    renderButton();

    return () => {
      cancelled = true;
    };
  }, [clientId, onError, onSuccess, text]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 text-sm font-bold text-on-surface-variant opacity-70"
      >
        <span className="material-symbols-outlined text-[18px]">settings</span>
        Configure Google Sign-In
      </button>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div ref={buttonRef} className="flex min-h-11 w-full justify-center" />
      {!ready && (
        <div className="flex h-11 w-full items-center justify-center rounded-xl border border-outline-variant bg-white text-xs font-bold text-on-surface-variant">
          Loading Google sign-in...
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
