"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { MessageSquare, X, Send, Bot, Users, RefreshCw } from "lucide-react";
import {
  fetchChatStateAction,
  postStudentChatMessageAction,
  postStaffChatMessageAction,
  postAdminChatMessageAction,
  switchChatModeAction,
} from "@/app/chat/actions";

const emptySubscribe = () => () => {};

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
  ticketContext?: {
    ticketNumber?: string;
    title?: string;
    departmentName?: string;
    categoryName?: string;
    location?: string;
    priority?: string;
    status?: string;
    slaDueAt?: string;
    reporterName?: string;
    description?: string;
    progressNotesSummary?: string;
    isAnonymous?: boolean;
  };
  userRole?: "student" | "staff" | "admin";
  userName?: string;
}

export default function FloatingLiveChat({
  complaintId,
  ticketContext = {},
  userRole = "student",
  userName,
}: FloatingLiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const fetchChat = useCallback(async () => {
    const res = await fetchChatStateAction(complaintId);
    if (res.success && res.state) {
      setChatState(res.state as ChatState);
    }
  }, [complaintId]);

  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    const runFetch = async () => {
      const res = await fetchChatStateAction(complaintId);
      if (isCurrent && res.success && res.state) {
        setChatState(res.state as ChatState);
      }
    };

    void runFetch();
    const interval = setInterval(() => {
      void runFetch();
    }, 2500);

    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
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

    if (chatState?.mode === "bot" && userRole === "student") {
      setIsTyping(true);
    }

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

  const handleToggleMode = async () => {
    if (isSwitchingMode) return;
    const currentMode = chatState?.mode || "bot";
    const nextMode = currentMode === "bot" ? "staff" : "bot";
    setIsSwitchingMode(true);

    const actor =
      userName || (userRole === "admin" ? "Admin" : userRole === "staff" ? "Staff" : "Student");
    await switchChatModeAction(complaintId, nextMode, actor);
    await fetchChat();
    setIsSwitchingMode(false);
  };

  if (!mounted) return null;

  const isStaffMode = chatState?.mode === "staff";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Panel */}
      <div
        className={`mb-4 w-[350px] sm:w-[400px] h-[520px] max-h-[75vh] bg-[#07130E]/90 backdrop-blur-xl border border-[#1D4A38] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-10 pointer-events-none"
        }`}
        style={{ transformOrigin: "bottom right" }}
      >
        {/* Header */}
        <div className="p-3.5 bg-[#153326]/90 border-b border-[#1D4A38]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#10B981]" />
              <div>
                <h3 className="font-bold text-[#ECFDF5] text-sm leading-none font-display">
                  Live Ticket Support
                </h3>
                {ticketContext?.ticketNumber && (
                  <span className="text-[10px] text-[#A7F3D0]/70 font-mono">
                    #{ticketContext.ticketNumber}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#A7F3D0]/70 hover:text-white hover:bg-[#1D4A38] transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Banner */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1D4A38]/70">
            <div className="flex items-center gap-1.5">
              {isStaffMode ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Users className="w-3 h-3 text-indigo-400" />
                  Staff & Admin Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Bot className="w-3 h-3 text-emerald-400" />
                  AI Dispatcher Mode
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleMode}
              disabled={isSwitchingMode}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 ${
                isStaffMode
                  ? "bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-600/40"
                  : "bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-600/40"
              }`}
              title={isStaffMode ? "Switch to automated AI dispatcher" : "Request human staff to take over"}
            >
              {isSwitchingMode ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : isStaffMode ? (
                <>
                  <Bot className="w-3 h-3" />
                  <span>Switch to AI</span>
                </>
              ) : (
                <>
                  <Users className="w-3 h-3" />
                  <span>Talk to Staff</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Informational Banner */}
          {isStaffMode ? (
            <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-[11px] text-indigo-200 leading-snug">
              💬 <strong>Live Human Mode Active:</strong> You are conversing directly with department staff resolvers and administrators. The AI dispatcher is paused.
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/30 rounded-xl text-[11px] text-emerald-200/90 leading-snug">
              🤖 <strong>AI Dispatcher Active:</strong> Asking questions evaluates live ticket status, SLA deadlines, and staff logs. Click <em>Talk to Staff</em> above for human assistance.
            </div>
          )}

          {chatState?.messages.map((msg, i) => {
            const isMe =
              (userRole === "admin" && msg.sender === "admin") ||
              (userRole === "staff" && msg.sender === "staff") ||
              (userRole === "student" && msg.sender === "student");

            return (
              <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {msg.sender === "system" ? (
                  <div className="mx-auto my-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-300 font-bold uppercase tracking-wide text-center">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "student"
                        ? "bg-[#10B981] text-[#042014] font-medium"
                        : msg.sender === "bot"
                        ? "bg-[#0F2A30] text-[#A7F3D0] border border-[#134E4A]"
                        : msg.sender === "admin"
                        ? "bg-[#581C87] text-[#F3E8FF] border border-[#7C3AED] shadow-md shadow-purple-950/50"
                        : "bg-[#1E1B4B] text-[#E0E7FF] border border-[#3730A3] shadow-md"
                    } ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}
                  >
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
            );
          })}

          {isTyping && chatState?.mode === "bot" && (
            <div className="flex items-start">
              <div className="px-4 py-2 bg-[#153326] text-[#A7F3D0] rounded-2xl rounded-bl-sm text-xs flex items-center gap-2 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
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
              placeholder={
                isStaffMode
                  ? "Message staff & admins directly..."
                  : "Ask AI Dispatcher or type your question..."
              }
              className="w-full pl-4 pr-10 py-2.5 bg-[#0E2219] border border-[#1D4A38] rounded-xl text-sm text-[#ECFDF5] placeholder-[#A7F3D0]/50 focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 p-1.5 bg-[#10B981] hover:bg-[#059669] text-[#042014] rounded-lg disabled:opacity-50 active:scale-[0.97] transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]"
              aria-label="Send message"
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
