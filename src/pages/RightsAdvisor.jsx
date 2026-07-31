// src/pages/RightsAdvisor.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  CornerDownRight, 
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { sendChatMessage, chatQuickReplies } from "../services/api";

export default function RightsAdvisor() {
  const location = useLocation();
  const chatBottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your GigShield Rights Advisor. I can help you analyze underpayments, understand your labor rights, and draft complaints for support. What can I do for you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Handle incoming redirect queries (e.g. from LogJob underpayment result)
  useEffect(() => {
    if (location.state?.query) {
      handleSend(location.state.query);
      // Clear state to prevent loop on component reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSend = async (textToSend) => {
    const msgText = textToSend || inputText;
    if (!msgText.trim()) return;

    // Clear input
    setInputText("");

    // Add User Message
    const userMsg = {
      id: `msg_${Date.now()}_user`,
      sender: "user",
      text: msgText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const response = await sendChatMessage(msgText);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_err`,
        sender: "bot",
        text: "Sorry, I had trouble reaching the AI brain. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Rights Advisor</h2>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold">AI Companion Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div 
              key={msg.id} 
              className={`flex gap-2.5 max-w-[85%] ${
                isBot ? "self-start mr-auto" : "self-end ml-auto flex-row-reverse"
              }`}
            >
              {/* Profile image bubble */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                isBot 
                  ? "bg-brand-purple/15 text-brand-lightpurple border border-brand-purple/25" 
                  : "bg-brand-border/80 text-gray-300 border border-brand-border"
              }`}>
                {isBot ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Text Bubble */}
              <div className="space-y-1">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isBot 
                    ? "bg-brand-card border border-brand-border text-gray-200 rounded-tl-sm" 
                    : "bg-brand-purple text-white rounded-tr-sm font-semibold shadow-md shadow-brand-purple/10"
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
                <span className={`block text-[9px] text-gray-500 font-bold ${
                  isBot ? "text-left" : "text-right"
                }`}>
                  {time}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-2.5 max-w-[80%] self-start mr-auto">
            <div className="w-8 h-8 rounded-xl bg-brand-purple/15 border border-brand-purple/25 flex items-center justify-center text-brand-lightpurple">
              <Bot size={14} />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-brand-card border border-brand-border text-xs flex items-center gap-1 py-4">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Chip Responses */}
      <div className="py-2 border-t border-brand-border/40 space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide px-1 flex items-center gap-1">
          <HelpCircle size={10} /> Suggested Questions
        </p>
        <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none snap-x">
          {chatQuickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className="snap-center shrink-0 px-3 py-1.5 rounded-full bg-brand-card border border-brand-border hover:border-brand-purple text-[11px] font-bold text-gray-300 hover:text-white cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="flex gap-2 items-center bg-brand-card p-1.5 rounded-2xl border border-brand-border">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask GigShield AI about your rights..."
          className="flex-1 bg-transparent border-0 px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:ring-0"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
            inputText.trim() 
              ? "bg-brand-purple hover:bg-brand-darkpurple text-white shadow-md shadow-brand-purple/20" 
              : "bg-brand-border/60 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Send size={14} />
        </button>
      </div>

    </div>
  );
}
