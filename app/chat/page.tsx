'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, getChatHistory, saveChatMessage, getEntries, clearChatHistory, StudentProfile, ChatMessage, JournalEntry } from '@/lib/storage';
import { Send, Trash2, HelpCircle, User, Sparkles, Smile, Compass } from 'lucide-react';

const SUGGESTIONS = [
  "I am overwhelmed by my backlog.",
  "Give me a study tip for tomorrow.",
  "Help me calm down before my mock test.",
  "Suggest a 2-minute grounding exercise."
];

export default function ChatPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push('/');
    } else {
      setProfile(p);
      setRecentEntries(getEntries());
      setMessages(getChatHistory());
      setLoaded(true);
    }
  }, [router]);

  // Scroll to bottom whenever messages list is updated
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || !profile) return;

    // Save user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = saveChatMessage(userMsg);
    setMessages(updatedHistory);
    setInput('');
    setIsTyping(true);

    try {
      // Map to Gemini history format (removing unique ids and dates)
      const apiHistory = updatedHistory.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      // Remove latest user message from history array passed because it's passed as 'message' parameter
      apiHistory.pop();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: apiHistory,
          profile,
          recentEntries: recentEntries.slice(0, 3)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat response');
      }

      const data = await response.json();
      
      // Save model reply
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      
      const postReplyHistory = saveChatMessage(modelMsg);
      setMessages(postReplyHistory);
    } catch (error) {
      console.error(error);
      // Fallback response
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `I'm here for you, ${profile.name}. The exam pressure is very real, but you are not alone in this. Let's focus on taking one solid step at a time today. What subject are you studying right now?`,
        timestamp: new Date().toISOString()
      };
      const postErrorHistory = saveChatMessage(errorMsg);
      setMessages(postErrorHistory);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear chat logs with Serenity?')) {
      clearChatHistory();
      setMessages([]);
    }
  };

  if (!loaded || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ec8a4]"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[500px] page-fade-in">
      {/* Sidebar Suggestions */}
      <div className="lg:col-span-1 glass-panel p-5 flex flex-col justify-between hidden lg:flex">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-[#7ec8a4]" />
            <h3 className="serif-display text-base font-bold text-white">Suggested Prompts</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Click any suggestion below to ask Serenity for guidance.
          </p>
          <div className="space-y-3">
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item)}
                className="w-full text-left p-3 rounded-xl border border-white/5 bg-white/3 hover:border-[#7ec8a4]/30 hover:bg-[#7ec8a4]/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer leading-relaxed"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-red-500/5 hover:text-red-400 text-xs text-slate-500 transition-all cursor-pointer mt-4"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Chat Logs
        </button>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 glass-panel flex flex-col overflow-hidden h-full">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7ec8a4]/20 text-[#7ec8a4]">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <h2 className="serif-display text-base font-bold text-white">Serenity</h2>
              <p className="text-[10px] text-slate-400">Context: {profile.examType} Student Companion</p>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
            title="Clear Chat Logs"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7ec8a4]/15 text-[#7ec8a4] mb-4">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="serif-display text-lg font-bold text-white">Meet Serenity</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Hi {profile.name}! I'm loaded with your {profile.examType} exam profile and recent study logs. How are you holding up today? Let's discuss test anxiety, backlog structures, or any syllabus doubts.
              </p>
              
              {/* Mobile suggestions */}
              <div className="grid grid-cols-1 gap-2 w-full mt-6 lg:hidden">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item)}
                    className="p-2.5 border border-white/5 bg-white/3 text-[11px] rounded-lg text-slate-300 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isUser ? 'bg-[#b8a9d9]/20 text-[#b8a9d9]' : 'bg-[#7ec8a4]/20 text-[#7ec8a4]'
                  }`}>
                    {isUser ? <User className="h-4 w-4" /> : <Smile className="h-4 w-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-[#b8a9d9]/10 border border-[#b8a9d9]/20 text-white rounded-tr-none'
                      : 'bg-white/3 border border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7ec8a4]/20 text-[#7ec8a4]">
                <Smile className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5 animate-pulse">
                <span>Serenity is thinking</span>
                <span className="flex gap-0.5 mt-0.5">
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-0" />
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-150" />
                  <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-300" />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-white/5 bg-white/2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Serenity about backlogs, mental exhaustion, mock strategies..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-[#7ec8a4] focus:ring-1 focus:ring-[#7ec8a4]/30 text-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7ec8a4] text-[#0a0f1e] hover:bg-[#7ec8a4]/90 disabled:opacity-50 disabled:hover:scale-100 transition-all transform hover:scale-102 shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
