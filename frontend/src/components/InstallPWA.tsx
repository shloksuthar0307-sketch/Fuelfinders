import { useEffect, useState } from 'react';
import { X, Fuel } from 'lucide-react';

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100 p-4 flex items-center gap-4 max-w-sm w-[90vw]">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
          <Fuel className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-sm">Install FuelFinder</h3>
          <p className="text-xs text-slate-500">Fast access from your home screen</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleInstallClick}
            className="bg-brand-blue hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-full text-sm transition-colors shadow-sm shadow-blue-500/20"
          >
            Install
          </button>
          <button 
            onClick={() => setShowBanner(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
