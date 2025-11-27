import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Headset, Minimize2 } from 'lucide-react';
import { APP_NAME } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Welcome to ${APP_NAME} Support! How can we help you earn more today?`,
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate Agent Reply
    setTimeout(() => {
      const responses = [
        "Our support team is reviewing your request.",
        "Please check the FAQ section for withdrawal limits.",
        "Your account is verified and secure.",
        "An agent will connect with you shortly."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const newAgentMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAgentMsg]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 active:scale-95 animate-in fade-in duration-300"
        >
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col max-h-[500px]">
          
          {/* Header */}
          <div className="bg-indigo-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white/10 p-1.5 rounded-full relative">
                <Headset size={18} />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-indigo-900"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm">Customer Support</h3>
                <p className="text-[10px] text-indigo-200">Typically replies in 2m</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 h-64">
            <div className="space-y-4">
              <div className="text-center text-[10px] text-gray-400 my-2">
                Today
              </div>
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} className={inputText.trim() ? "ml-0.5" : ""} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};