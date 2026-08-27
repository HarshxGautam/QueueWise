import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot } from "lucide-react";

export default function AiChatbot({ activeTicket, onSendAiChat }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 **Hello! I'm your QueueWise Campus AI Assistant.** 😊🎓\n\nI can help you with live wait times, required documents for Placement Cell, IT Help Desk support, Academic Counseling, or Student Certificates. How can I assist you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const newMessages = [...messages, { sender: "user", text: query }];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    const reply = await onSendAiChat(query, activeTicket);

    setMessages([...newMessages, { sender: "ai", text: reply }]);
    setIsLoading(false);
  };

  // Expanded Campus-Specific Suggestion Chips
  const suggestionChips = [
    "How long is my wait time?",
    "What documents for Placement Cell?",
    "How does IT Help Desk support work?",
    "How to request an ID Card or Certificate?",
    "Academic Counseling guidance?",
    "How does Fast-Track Priority work?",
    "How will I be notified when called?",
    "Which counter handles my department?"
  ];

  // Helper to render formatted text with line breaks & bold formatting
  const formatMessageText = (text) => {
    return text.split("\n").map((line, i) => {
      // Parse bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={line === "" ? "h-2" : "min-h-[1rem]"}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("*") && part.endsWith("*")) {
              return <em key={pIdx} className="italic opacity-90">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 p-3 sm:px-4 sm:py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-indigo-400/30"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-xs font-bold hidden sm:inline">Ask Assistant</span>
      </button>

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] max-h-[calc(100vh-100px)] h-[510px] glass-panel rounded-2xl border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden animate-slide-up bg-white dark:bg-slate-900">
          
          {/* Header */}
          <div className="p-3.5 bg-indigo-600 text-white border-b border-indigo-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-white/20 text-white">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>QueueWise AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-indigo-100 opacity-90">Live Queue & Facility Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body with Custom Scrollbar */}
          <div className="flex-1 p-3.5 overflow-y-auto chatbot-messages space-y-3 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-heading rounded-tl-none shadow-xs"
                  }`}
                >
                  {formatMessageText(msg.text)}
                </div>

                {msg.sender === "user" && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                    You
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs py-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking & analyzing queue...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips (Horizontal Scroll) */}
          <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-900 border-t border-[var(--border-color)] flex gap-1.5 overflow-x-auto text-[10px] shrink-0 no-scrollbar">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-sub hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition shadow-2xs font-medium"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-[var(--border-color)] flex items-center space-x-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about wait time, documents, VIP..."
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
