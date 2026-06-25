import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Droplet } from 'lucide-react';

const responses: Record<string, string> = {
  "hello": "Hi there! I am BloodBot. How can I help you save a life today?",
  "hi": "Hi there! I am BloodBot. How can I help you save a life today?",
  "who are you": "I am BloodBot, your AI assistant for all things related to BloodBridge and blood donation.",
  "am i eligible to donate": "Generally, if you are 18-65 years old, weigh at least 50kg, and are in good health, you can donate blood! Did you get a tattoo recently?",
  "tattoo": "If you got a tattoo recently, you must wait 6 months before donating blood to ensure safety.",
  "where can i donate": "You can check the 'Schedule' or 'Blood Drives' section on your dashboard to find the nearest drive!",
  "does it hurt": "Not really! You will feel a small pinch when the needle is inserted, but the actual donation process is painless.",
  "how long does it take": "The entire process from registration to resting afterwards takes about 45 minutes. The actual blood draw takes only 8-10 minutes.",
  "default": "I'm still learning! Could you rephrase that? Or you can ask me about eligibility, where to donate, or the donation process.",
};

const BloodBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'bot'|'user', text: string}[]>([
    { sender: 'bot', text: 'Hi! I am BloodBot. Ask me anything about blood donation!' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput("");

    // Simple bot logic
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let botResponse = responses.default;
      
      for (const [key, value] of Object.entries(responses)) {
        if (lower.includes(key) && key !== "default") {
          botResponse = value;
          break;
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-50 transition-colors ${
          isOpen ? 'bg-slate-200 text-slate-500 scale-0 opacity-0 pointer-events-none' : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-red-600"></span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-red-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Droplet className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">BloodBot</h3>
                  <p className="text-red-200 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-red-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === 'user' ? 'bg-slate-200' : 'bg-red-100'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-slate-800 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="flex-1 bg-slate-100 text-slate-900 text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BloodBot;
