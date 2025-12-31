
import React, { useState, useEffect } from 'react';
import Chatbot from './components/Chatbot';
import { BotIcon } from './components/Icons';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Notify parent (Webflow) when chat state changes
  useEffect(() => {
    const message = isOpen ? 'chat-opened' : 'chat-closed';
    window.parent.postMessage(message, '*');
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed inset-0 pointer-events-none font-sans overflow-hidden">
      
      {/* Widget Container - Bottom Left */}
      <div 
        className={`fixed bottom-24 left-6 w-[95vw] md:w-[400px] h-[600px] max-h-[85vh] shadow-2xl rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] transform origin-bottom-left pointer-events-auto ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-12 pointer-events-none'
        }`}
      >
        <Chatbot onClose={() => setIsOpen(false)} />
      </div>

      {/* Launcher Button & Prompt */}
      <div className="fixed bottom-6 left-6 flex items-center gap-4 pointer-events-auto">
         {/* Launcher Button */}
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-[#1E2D78] hover:bg-[#141f5a] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95"
          aria-label={isOpen ? "Close Chat" : "Open Chat"}
        >
          {isOpen ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
             </svg>
          ) : (
            <BotIcon className="w-8 h-8" />
          )}
        </button>

        {/* "Need Help?" Text Bubble */}
        {!isOpen && (
            <div 
                className="cursor-pointer bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-500 hover:-translate-y-1 animate-bounce"
                onClick={() => setIsOpen(true)}
                style={{ animationDuration: '3s' }}
            >
                <p className="font-bold text-sm whitespace-nowrap">Need help?</p>
                {/* Triangle */}
                <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-white dark:border-r-slate-800 border-b-[8px] border-b-transparent"></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
