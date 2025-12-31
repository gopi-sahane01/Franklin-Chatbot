
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender, ChatState, ButtonInfo, PersistedState } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon, PhoneIcon, StarIcon } from './Icons';
import { getSympatheticResponse, getGreetingResponse, extractUserName } from '../services/geminiService';

const STORAGE_KEY = 'franklin_smiles_chat_v1';

interface ChatbotProps {
  onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  // Initialize with empty, but we'll fill it in the first useEffect
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState>(ChatState.INITIAL);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [reviewCount, setReviewCount] = useState(0);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Load state or start fresh
  useEffect(() => {
    if (isInitialized.current) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: PersistedState = JSON.parse(saved);
        // Only restore if data is less than 24 hours old
        if (Date.now() - parsed.lastUpdated < 86400000 && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          setChatState(parsed.chatState);
          setUserName(parsed.userName);
          isInitialized.current = true;
          return;
        }
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }

    // Default first message if no valid history
    setMessages([{
      id: 'init',
      sender: Sender.Bot,
      text: "Hello! I'm the Franklin Bright Smiles virtual assistant. How can I help you with your dental care today?",
      buttons: [
        { label: 'Cosmetic Dentistry', payload: 'cosmetic', type: 'service' },
        { label: 'General Dentistry', payload: 'general', type: 'service' },
      ]
    }]);
    isInitialized.current = true;
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (!isInitialized.current || messages.length === 0) return;
    
    const stateToSave: PersistedState = {
      messages,
      chatState,
      userName,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [messages, chatState, userName]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Review count animation
  useEffect(() => {
    let start = 0;
    const end = 1005;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
            setReviewCount(end);
            clearInterval(timer);
        } else {
            setReviewCount(Math.floor(start));
        }
    }, 16);
    return () => clearInterval(timer);
  }, []);

  const addMessage = useCallback((sender: Sender, text: string, buttons?: ButtonInfo[]) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), sender, text, buttons }]);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if(e) e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    addMessage(Sender.User, userMessage);
    setUserInput('');
    setIsLoading(true);

    // Try to extract name if we don't have it
    if (!userName) {
        const detectedName = await extractUserName(userMessage);
        if (detectedName) setUserName(detectedName);
    }

    // Contextual logic: If they greet us again or it's the start
    if (chatState === ChatState.INITIAL || messages.length < 3) {
      const historySnippet = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
      const botGreeting = await getGreetingResponse(userMessage, historySnippet, userName);
      
      addMessage(Sender.Bot, botGreeting, [
        { label: 'Cosmetic Dentistry', payload: 'cosmetic', type: 'service' },
        { label: 'General Dentistry', payload: 'general', type: 'service' },
      ]);
      setChatState(ChatState.GREETED);
    } else {
      const botResponse = await getSympatheticResponse(userMessage);
      addMessage(Sender.Bot, botResponse, [
        { label: 'Book Appointment', payload: 'https://www.centaurportal.com/d4w/org-3404/extended_search?location=3930&sourceID=&randomNumber=428da415c42d72a6ac2653e76d73cd2349aed9079f5261eadaa055eedff383e8&shortVer=true', type: 'redirect' },
        { label: 'Oral Health Facts', payload: 'https://teeth.org.au/factsheets', type: 'redirect' },
      ]);
      setChatState(ChatState.AWAITING_ISSUE);
    }
    setIsLoading(false);
  };

  const handleButtonClick = (button: ButtonInfo) => {
    if (button.type === 'service') {
      addMessage(Sender.User, button.label);
      setIsLoading(true);
      setTimeout(() => {
        if (button.payload === 'cosmetic') {
          addMessage(Sender.Bot, "That's wonderful. Cosmetic dentistry is our specialty. Are you interested in whitening, veneers, or perhaps a full smile makeover?", [
            { label: 'Book Appointment', payload: 'https://www.centaurportal.com/d4w/org-3404/extended_search?location=3930&sourceID=&randomNumber=428da415c42d72a6ac2653e76d73cd2349aed9079f5261eadaa055eedff383e8&shortVer=true', type: 'redirect' },
          ]);
        } else {
          addMessage(Sender.Bot, "For general care, we provide check-ups, cleanings, and emergency work. Would you like to check our availability?", [
            { label: 'View Available Times', payload: 'https://www.centaurportal.com/d4w/org-3404/extended_search?location=3930&sourceID=&randomNumber=428da415c42d72a6ac2653e76d73cd2349aed9079f5261eadaa055eedff383e8&shortVer=true', type: 'redirect' },
          ]);
        }
        setIsLoading(false);
        setChatState(ChatState.SERVICE_SELECTED);
      }, 800);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear conversation history?")) {
        localStorage.removeItem(STORAGE_KEY);
        setUserName(undefined);
        setChatState(ChatState.INITIAL);
        setMessages([{
            id: 'init-reset',
            sender: Sender.Bot,
            text: "History cleared! How can I help you today?",
            buttons: [
                { label: 'Cosmetic Dentistry', payload: 'cosmetic', type: 'service' },
                { label: 'General Dentistry', payload: 'general', type: 'service' },
            ]
        }]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-800 shadow-2xl rounded-t-2xl md:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 relative bg-[#1E2D78] text-white flex flex-col items-center">
        <h2 className="text-lg font-bold leading-tight">Franklin Bright Smiles</h2>
        <div className="flex items-center gap-2 mt-1">
            <div className="flex text-yellow-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-3.5 h-3.5" />
                ))}
            </div>
            <span className="text-xs opacity-90 font-medium">5.0 ({reviewCount.toLocaleString()})</span>
        </div>
        
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <button onClick={clearChat} className="p-1 hover:bg-white/10 rounded transition" title="Clear Chat">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>
            {onClose && (
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onButtonClick={handleButtonClick} />
        ))}
        {isLoading && (
          <div className="flex justify-start my-2">
            <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask us anything..."
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1E2D78] text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-10 h-10 bg-[#1E2D78] text-white rounded-full flex items-center justify-center hover:bg-[#141f5a] disabled:opacity-50 transition"
            disabled={isLoading || !userInput.trim()}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
