'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkle, Robot, PaperPlaneTilt, 
  X, SpinnerGap, ArrowClockwise, Trash, Copy, Check
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIStudyAssistantProps {
  role?: 'student' | 'teacher';
  contextData?: {
    studentName?: string;
    className?: string;
    subjects?: string[];
    weakAreas?: string[];
    averageScore?: number;
  };
  locale?: string;
}

export function AIStudyAssistant({ role = 'student', contextData, locale = 'km' }: AIStudyAssistantProps) {
  const isKm = locale === 'km';
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: isKm
        ? `សួស្តី! ខ្ញុំជា **Smart School AI Assistant** — ជំនួយការសិក្សាឆ្លាតវៃរបស់អ្នក។\n\nខ្ញុំអាចជួយអ្នកបាន:\n- ពន្យល់មេរៀន និងគំនិតស្មុគស្មាញ\n- គន្លឹះត្រៀមប្រឡង\n- រៀបចំកាលវិភាគសិក្សា\n- ជួយសរសេរតែងសេចក្តី\n\nតើខ្ញុំអាចជួយអ្វីខ្លះនៅថ្ងៃនេះ?`
        : `Hello! I'm **Smart School AI Assistant** — your intelligent study companion.\n\nI can help you with:\n- Explaining lessons and complex concepts\n- Exam preparation tips\n- Study schedule planning\n- Essay and writing guidance\n\nHow can I help you today?`
    }
  ]);

  // Quick prompts based on role
  const quickPrompts = role === 'student' ? [
    isKm ? 'គន្លឹះត្រៀមប្រឡងអោយបានពិន្ទុខ្ពស់' : 'Tips for getting high exam scores',
    isKm ? 'គន្លឹះរៀនគណិតវិទ្យាអោយឆាប់យល់' : 'Math study strategies',
    isKm ? 'រៀបចំកាលវិភាគសិក្សាប្រចាំសប្ដាហ៍' : 'Create a weekly study plan',
  ] : [
    isKm ? 'បង្កើតផែនការមេរៀនថ្មី' : 'Create an engaging lesson plan',
    isKm ? 'គន្លឹះវាយតម្លៃសិស្ស' : 'Student assessment strategies',
    isKm ? 'របៀបលើកទឹកចិត្តសិស្សខ្សោយ' : 'Motivating struggling students',
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, displayText]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Typing animation effect
  const typeMessage = (fullText: string, callback: () => void) => {
    setIsTyping(true);
    setDisplayText('');
    let idx = 0;
    const speed = Math.max(8, Math.min(25, 2000 / fullText.length)); // Adaptive speed
    
    const timer = setInterval(() => {
      if (idx < fullText.length) {
        // Type in chunks for faster feel
        const chunkSize = Math.min(3, fullText.length - idx);
        setDisplayText(fullText.slice(0, idx + chunkSize));
        idx += chunkSize;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        callback();
      }
    }, speed);

    return () => clearInterval(timer);
  };

  const handleSend = async (text?: string) => {
    const query = text || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: query.trim() };
    const updatedLog = [...chatLog, userMessage];
    setChatLog(updatedLog);
    setInputQuery('');
    setLoading(true);

    try {
      // Call real AI API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedLog.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          })),
          locale,
          role,
          contextData
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || (isKm ? 'សូមអភ័យទោស មានបញ្ហា។ សាកម្តងទៀត។' : 'Sorry, there was an issue. Please try again.');

      setLoading(false);

      // Typing animation
      typeMessage(aiReply, () => {
        setChatLog(prev => [...prev, { role: 'assistant', content: aiReply }]);
        setDisplayText('');
      });

    } catch (error) {
      console.error('AI Chat error:', error);
      setLoading(false);
      
      const fallback = isKm 
        ? '⚠️ មានបញ្ហាក្នុងការតភ្ជាប់។ សូមពិនិត្យអ៊ីនធឺណិត ហើយសាកម្តងទៀត។'
        : '⚠️ Connection error. Please check your internet and try again.';
      
      setChatLog(prev => [...prev, { role: 'assistant', content: fallback }]);
    }
  };

  const handleClearChat = () => {
    setChatLog([{
      role: 'assistant',
      content: isKm
        ? `សួស្តី! ខ្ញុំជា **Smart School AI Assistant** — ជំនួយការសិក្សាឆ្លាតវៃរបស់អ្នក។\n\nតើខ្ញុំអាចជួយអ្វីខ្លះនៅថ្ងៃនេះ?`
        : `Hello! I'm **Smart School AI Assistant**.\n\nHow can I help you today?`
    }]);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Render markdown-like formatting
  const renderMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      if (!processed.trim()) return <br key={i} />;
      return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} className="mb-0.5" />;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 lg:bottom-8 right-6 z-40 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 group"
          title={isKm ? 'ជំនួយការសិក្សាឆ្លាតវៃ AI' : 'AI Study Assistant'}
        >
          <div className="relative">
            <Sparkle size={20} weight="fill" className="text-amber-300 group-hover:animate-spin" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600 animate-pulse" />
          </div>
          <span className="hidden sm:inline">{isKm ? 'AI Assistant' : 'AI Assistant'}</span>
        </button>
      )}

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#0f1117] sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 flex flex-col h-[85vh] sm:h-[600px] overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
                  <Robot size={22} weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm font-black flex items-center gap-1.5 tracking-tight">
                    <span>Smart School AI</span>
                    <Sparkle size={13} weight="fill" className="text-amber-300 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-indigo-200 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isKm ? 'ប្រើ AI ពិតប្រាកដ · ព្រៀបស្រេចឆ្លើយតប' : 'Powered by AI · Ready to help'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearChat}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                  title={isKm ? 'ជម្រះការសន្ទនា' : 'Clear chat'}
                >
                  <Trash size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-[#0a0b0e]">
              {chatLog.map((log, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${log.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {log.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
                      <Sparkle size={13} weight="fill" />
                    </div>
                  )}
                  <div className="relative group max-w-[85%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                        log.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-[#1a1c24] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 rounded-bl-sm'
                      }`}
                    >
                      {log.role === 'assistant' ? renderMessage(log.content) : log.content}
                    </div>
                    {/* Copy button for AI messages */}
                    {log.role === 'assistant' && index > 0 && (
                      <button
                        onClick={() => handleCopy(log.content, index)}
                        className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm cursor-pointer"
                        title="Copy"
                      >
                        {copiedIdx === index ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing animation */}
              {isTyping && displayText && (
                <div className="flex gap-2.5 justify-start animate-in fade-in duration-200">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
                    <Sparkle size={13} weight="fill" className="animate-pulse" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-[13px] leading-relaxed bg-white dark:bg-[#1a1c24] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-sm">
                    {renderMessage(displayText)}
                    <span className="inline-block w-1.5 h-4 bg-indigo-500 rounded-full animate-pulse ml-0.5 align-middle" />
                  </div>
                </div>
              )}

              {/* Loading state */}
              {loading && !isTyping && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <Sparkle size={13} weight="fill" />
                  </div>
                  <div className="flex items-center gap-2.5 bg-white dark:bg-[#1a1c24] border border-slate-200/80 dark:border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {isKm ? 'AI កំពុងគិត...' : 'AI is thinking...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2.5 bg-white dark:bg-[#0f1117] border-t border-slate-100 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-400 shrink-0 font-bold uppercase tracking-wider">{isKm ? 'សំណួរ:' : 'Quick:'}</span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  disabled={loading || isTyping}
                  className="px-3 py-1.5 text-[11px] rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-all shrink-0 cursor-pointer border border-slate-200/60 dark:border-white/5 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-[#0f1117] border-t border-slate-200/80 dark:border-white/5 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={loading || isTyping}
                placeholder={isKm ? 'សួរអ្វីក៏បាន... AI នឹងឆ្លើយតបភ្លាមៗ' : 'Ask anything... AI will respond instantly'}
                className="flex-1 px-4 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder:text-slate-400 disabled:opacity-50 transition-all"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputQuery.trim() || loading || isTyping}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-3.5 h-9 cursor-pointer shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                <PaperPlaneTilt size={15} weight="bold" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIStudyAssistant;
