'use client';

import React, { useState } from 'react';
import { 
  Sparkle, Robot, PaperPlaneTilt, Lightbulb, 
  BookOpen, Brain, CheckCircle, X, CaretRight, SpinnerGap 
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

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
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; message: string }>>([
    {
      sender: 'ai',
      message: isKm
        ? `សួស្តី! ខ្ញុំជា AI Study Assistant ឆ្លាតវៃរបស់អ្នក។ តើខ្ញុំអាចជួយពន្យល់មេរៀន ណែនាំគន្លឹះរៀនពូកែ ឬរៀបចំកាលវិភាគសិក្សាអ្វីខ្លះជូនអ្នកនៅថ្ងៃនេះ?`
        : `Hello! I am your AI Smart Study Assistant. How can I help you understand lessons, provide study tips, or review exam preparation today?`
    }
  ]);

  const quickPrompts = role === 'student' ? [
    isKm ? 'របៀបរៀនមុខវិជ្ជាគណិតវិទ្យាឱ្យឆាប់យល់' : 'Effective study strategies for Mathematics',
    isKm ? 'បង្កើតកាលវិភាគរំលឹកមេរៀនមុនប្រឡង' : 'Create an exam revision schedule',
    isKm ? 'គន្លឹះសរសេរតែងសេចក្តីភាសាខ្មែរឱ្យបានពិន្ទុខ្ពស់' : 'Tips for writing high-scoring essays',
  ] : [
    isKm ? 'បង្កើតសំណួរត្រួតពិនិត្យការយល់ដឹងរបស់សិស្ស' : 'Generate quick student assessment questions',
    isKm ? 'គន្លឹះលើកទឹកចិត្តសិស្សដែលខ្សោយឱ្យខិតខំរៀន' : 'Strategies to motivate struggling students',
    isKm ? 'រៀបចំផែនការបង្រៀនមេរៀនថ្មីឱ្យទាក់ទាញ' : 'Design an engaging interactive lesson plan',
  ];

  const handleSend = (text?: string) => {
    const query = text || inputQuery;
    if (!query.trim() || loading) return;

    const newLogs = [...chatLog, { sender: 'user' as const, message: query.trim() }];
    setChatLog(newLogs);
    setInputQuery('');
    setLoading(true);

    setTimeout(() => {
      let aiReply = '';
      const q = query.toLowerCase();

      if (q.includes('math') || q.includes('គណិត')) {
        aiReply = isKm
          ? `[គន្លឹះរៀនគណិតវិទ្យា]\n1. យល់ពីគំនិតជាមុន: កុំទន្ទេញរូបមន្តដោយមិនយល់ប្រភពដើម។\n2. អនុវត្តលំហាត់ពីងាយទៅពិបាក: ដោះស្រាយយ៉ាងហោច ៣-៥ លំហាត់ជារៀងរាល់ថ្ងៃ។\n3. កត់ត្រាកំហុស: កត់ចំណាំចំណុចដែលធ្លាប់គណនាខុសដើម្បីកុំឱ្យច្រឡំម្តងទៀត។`
          : `[Mathematics Strategy]\n1. Master Core Concepts: Understand derivations instead of rote memorization.\n2. Daily Problem Solving: Practice at least 3-5 problems daily from simple to complex.\n3. Maintain an Error Journal: Review mistakes to avoid repeating them in exams.`;
      } else if (q.includes('កាលវិភាគ') || q.includes('schedule') || q.includes('exam')) {
        aiReply = isKm
          ? `[កាលវិភាគសិក្សាឆ្លាតវៃ]\n- រៀនផ្តោតអារម្មណ៍: ២៥ នាទីជាប់គ្នាមិនមើលទូរសព្ទ\n- សម្រាកខ្លី: ៥ នាទី\n- បន្ទាប់ពី ៤ ជុំ: សម្រាកវែង ១៥-៣០ នាទី\n- ចែកពេលរំលឹកមេរៀនពេលព្រឹកព្រលឹមសម្រាប់មុខវិជ្ជាទ្រឹស្តី!`
          : `[Smart Study Schedule]\n- Deep Focus: 25 minutes uninterrupted focus\n- Short Break: 5 minutes\n- After 4 cycles: Take 15-30 minutes long break\n- Review theoretical subjects in the morning for best retention!`;
      } else {
        aiReply = isKm
          ? `[ការណែនាំពី AI Assistant]\nផ្អែកលើសំណួររបស់អ្នក "${query}"៖\n- សូមបែងចែកគោលដៅសិក្សាជាដំណាក់កាលតូចៗ។\n- ប្រើប្រាស់រូបភាព Mind Map ដើម្បីងាយចងចាំ។\n- សួរលោកគ្រូ/អ្នកគ្រូភ្លាមៗនៅពេលមានចម្ងល់ក្នុងថ្នាក់រៀន!`
          : `[AI Recommendation]\nRegarding "${query}":\n- Break down study goals into manageable micro-milestones.\n- Utilize visual mind-mapping for conceptual clarity.\n- Actively ask questions in class whenever concepts are unclear!`;
      }

      setChatLog([...newLogs, { sender: 'ai', message: aiReply }]);
      setLoading(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-8 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all cursor-pointer border border-white/20"
        title={isKm ? 'ជំនួយការសិក្សាឆ្លាតវៃ AI' : 'AI Study Assistant'}
      >
        <Sparkle size={18} weight="fill" className="animate-spin text-amber-300" />
        <span className="hidden sm:inline">{isKm ? 'AI Study Assistant' : 'AI Assistant'}</span>
      </button>

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[560px] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
                  <Robot size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm font-black flex items-center gap-1.5">
                    <span>Smart School AI Assistant</span>
                    <Sparkle size={13} weight="fill" className="text-amber-300" />
                  </h3>
                  <p className="text-[10px] text-indigo-200 font-medium">
                    {isKm ? 'ជំនួយការសិក្សាឆ្លាតវៃ និងណែនាំមេរៀន' : 'Intelligent Study & Pedagogical Helper'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50">
              {chatLog.map((log, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {log.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkle size={14} weight="fill" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-xs ${
                      log.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                    }`}
                  >
                    {log.message}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded-2xl w-fit">
                  <SpinnerGap size={16} className="animate-spin" />
                  <span>{isKm ? 'AI កំពុងវិភាគ និងឆ្លើយតប...' : 'AI is analyzing and formulating response...'}</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-400 shrink-0 font-semibold">{isKm ? 'សំណួររហ័ស:' : 'Quick:'}</span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition shrink-0 cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
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
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isKm ? 'សួរសំណួរមេរៀន ឬគន្លឹះសិក្សា...' : 'Ask about lesson concepts or study tips...'}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputQuery.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 cursor-pointer shadow-xs"
              >
                <PaperPlaneTilt size={14} weight="bold" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIStudyAssistant;
