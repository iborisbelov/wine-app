import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types/wine';
import { AIAssistant } from './AIAssistant';
import { User } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
}

export function ChatInterface({ messages }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="bg-[#F7F5F4] rounded-3xl p-4 max-h-64 overflow-y-auto">
      <div className="space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                {message.sender === 'ai' ? (
                  <div className="w-8 h-8 scale-50 origin-center">
                    <AIAssistant />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-[#e8e6dd] flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
              <div
                className={`
                  px-4 py-2 rounded-2xl max-w-[80%]
                  ${message.sender === 'user' 
                    ? 'bg-gray-900 text-white rounded-tr-sm' 
                    : 'bg-[#f0efe8] text-gray-900 rounded-tl-sm'
                  }
                `}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}