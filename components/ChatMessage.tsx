import React from 'react';
import { Message, Sender, ButtonInfo } from '../types';
import { BotIcon, UserIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  onButtonClick: (button: ButtonInfo) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onButtonClick }) => {
  const isBot = message.sender === Sender.Bot;

  return (
    <div className={`flex items-end gap-2 my-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1E2D78] text-white flex items-center justify-center">
          <BotIcon className="w-5 h-5" />
        </div>
      )}
      <div className={`max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${
          isBot
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
            : 'bg-[#1E2D78] text-white rounded-br-none'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        {message.buttons && message.buttons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.buttons.map((button, index) => (
               button.type === 'redirect' ? (
                <a
                  key={index}
                  href={button.payload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium text-[#1E2D78] dark:text-indigo-400 bg-indigo-100 dark:bg-slate-800 rounded-full hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  {button.label}
                </a>
              ) : (
                <button
                    key={index}
                    onClick={() => onButtonClick(button)}
                    className="px-4 py-2 text-sm font-medium text-[#1E2D78] dark:text-indigo-400 bg-indigo-100 dark:bg-slate-800 rounded-full hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                    {button.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>
      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;