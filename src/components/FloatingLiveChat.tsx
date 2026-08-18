"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { fetchChatStateAction, postStudentChatMessageAction, postStaffChatMessageAction, postAdminChatMessageAction } from "@/app/chat/actions";

interface ChatMessage {
  sender: "student" | "bot" | "staff" | "admin" | "system";
  text: string;
  senderName?: string;
  staffName?: string;
  timestamp: string;
}

interface ChatState {
  mode: "bot" | "staff";
  messages: ChatMessage[];
  emergencyAlert: boolean;
}

interface FloatingLiveChatProps {
  complaintId: string;
  ticketContext?: any;
  userRole?: "student" | "staff" | "admin";
  userName?: string;
}

export default function FloatingLiveChat({ complaintId, ticketContext = {}, userRole = "student", userName }: FloatingLiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchChat = async () => {
    const res = await fetchChatStateAction(complaintId);
    if (res.success && res.state) {
      setChatState(res.state as ChatState);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChat();
      const interval = setInterval(fetchChat, 2500);
      return () => clearInterval(interval);
    }
  }, [isOpen, complaintId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatState?.messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText("");
    
    let senderType: "student" | "staff" | "admin" = "student";
    if (userRole === "admin") senderType = "admin";
    else if (userRole === "staff") senderType = "staff";
    
    // Optimistic update
    const newMessage: ChatMessage = {
      sender: senderType,
      text: textToSend,
      senderName: userName,
      timestamp: new Date().toISOString(),
    };
    
    setChatState((prev) => {
      if (!prev) return { mode: "bot", messages: [newMessage], emergencyAlert: false };
      return { ...prev, messages: [...prev.messages, newMessage] };
    });
    
    setIsTyping(true);
    if (userRole === "admin") {
      await postAdminChatMessageAction(complaintId, textToSend, userName || "System Administrator");
    } else if (userRole === "staff") {
      await postStaffChatMessageAction(complaintId, textToSend, userName || "Staff Resolver");
    } else {
      await postStudentChatMessageAction(complaintId, textToSend, ticketContext);
    }
    await fetchChat();
    setIsTyping(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Panel */}
      <div 
        className={`mb-4 w-[340px] sm:w-[380px] h-[500px] max-h-[70vh] bg-[#07130E]/80 backdrop-blur-xl border border-[#1D4A38] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#153326]/80 border-b border-[#1D4A38]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#10B981]" />
            <h3 className="font-bold text-[#ECFDF5] text-sm font-display">Live Support</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-[#A7F3D0]/70 hover:text-white hover:bg-[#1D4A38] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatState?.messages.map((msg, i) => {
            const isMe = (userRole === "admin" && msg.sender === "admin") ||
                        (userRole === "staff" && msg.sender === "staff") ||
                        (userRole === "student" && msg.sender === "student");
            return (
            <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {msg.sender === "system" ? (
                <div className="mx-auto my-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-300 font-bold uppercase tracking-wide">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "student" 
                    ? "bg-[#10B981] text-[#042014] font-medium" 
                    : msg.sender === "bot"
                    ? "bg-[#0F2A30] text-[#A7F3D0] border border-[#134E4A]"
                    : msg.sender === "admin"
                    ? "bg-[#581C87] text-[#F3E8FF] border border-[#7C3AED] shadow-md shadow-purple-950/50"
                    : "bg-[#1E1B4B] text-[#E0E7FF] border border-[#3730A3] shadow-md"
                } ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}>
                  {msg.sender === "bot" && (
                    <div className="text-[10px] font-bold text-[#2DD4BF] mb-1 flex items-center gap-1">
                      🤖 AI Dispatcher
                    </div>
                  )}
                  {msg.sender === "admin" && (
                    <div className="text-[10px] font-bold text-[#C084FC] mb-1 flex items-center gap-1">
                      👑 {msg.senderName || "System Administrator"} (Admin Oversight)
                    </div>
                  )}
                  {msg.sender === "staff" && (
                    <div className="text-[10px] font-bold text-[#818CF8] mb-1 flex items-center gap-1">
                      👨‍🔧 {msg.senderName || msg.staffName || "Staff Member"} (Staff Resolver)
                    </div>
                  )}
                  {msg.text}
                </div>
              )}
            </div>
          )})}
          {isTyping && chatState?.mode === "bot" && (
            <div className="flex items-start">
              <div className="px-4 py-2 bg-[#153326] text-[#A7F3D0] rounded-2xl rounded-bl-sm text-xs flex items-center gap-2 animate-pulse">
                AI Dispatcher is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#1D4A38] bg-[#07130E]/90">
          <div className="relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="w-full pl-4 pr-10 py-2.5 bg-[#0E2219] border border-[#1D4A38] rounded-xl text-sm text-[#ECFDF5] placeholder-[#A7F3D0]/50 focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 p-1.5 bg-[#10B981] hover:bg-[#059669] text-[#042014] rounded-lg disabled:opacity-50 active:scale-[0.97] transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-3 bg-[#10B981] hover:bg-[#059669] text-[#042014] rounded-full font-bold shadow-[0_8px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] active:scale-[0.97] transition-all duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <MessageSquare className="w-5 h-5" />
        <span>Live Support Chat</span>
      </button>
    </div>
  );
}
