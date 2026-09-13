'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DotsSixVertical,
  Sparkle,
  TrendUp,
  ChartBar,
  Brain,
  CheckCircle,
  Warning,
  ArrowClockwise,
  Coins,
  ShieldCheck,
  Lightning,
  CaretUp,
} from '@phosphor-icons/react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface AIWidgetProps {
  id: string;
  isKm: boolean;
}

// Custom Glassmorphic Card Wrapper
const WidgetCard = ({ children, color, isDragging, setNodeRef, style, glow }: any) => (
  <div
    ref={setNodeRef}
    style={style}
    className={`
      relative overflow-hidden rounded-[32px] 
      border border-white/40 dark:border-white/[0.08] 
      bg-white/80 dark:bg-[#111318]/80 
      backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
      hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgb(0,0,0,0.4)]
      transition-all duration-500 group flex flex-col justify-between
      ${isDragging ? 'opacity-40 z-[999] scale-[1.02] shadow-2xl ring-2 ring-primary/50' : 'z-auto'}
    `}
  >
    <div className={`absolute -top-32 -right-32 h-72 w-72 rounded-full ${glow} blur-[100px] pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-700`} />
    <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent dark:from-white/[0.03] dark:to-transparent pointer-events-none" />
    <div className="relative z-10 p-6 flex flex-col h-full">
      {children}
    </div>
  </div>
);

// 1. AI Weekly Attendance & Engagement Wave Chart Widget
function AttendanceTrendWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [activeTimeframe, setActiveTimeframe] = useState<'7D' | '30D' | 'TERM'>('7D');

  const data = isKm 
    ? [ { name: 'ច', val: 92 }, { name: 'អ', val: 96 }, { name: 'ព', val: 91 }, { name: 'ព្រ', val: 99 }, { name: 'សុ', val: 95 }, { name: 'ស', val: 98 } ]
    : [ { name: 'Mon', val: 92 }, { name: 'Tue', val: 96 }, { name: 'Wed', val: 91 }, { name: 'Thu', val: 99 }, { name: 'Fri', val: 95 }, { name: 'Sat', val: 98 } ];

  return (
    <WidgetCard setNodeRef={setNodeRef} style={style} isDragging={isDragging} glow="bg-blue-500">
      <div className="flex-1">
        <div className="flex items-start justify-between pb-4">
          <div className="flex gap-3">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors mt-1">
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <TrendUp size={16} weight="bold" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {isKm ? 'AI វិភាគវត្តមាន' : 'AI Attendance Trend'}
                </h3>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-10.5">
                {isKm ? 'ទស្សន៍ទាយនិន្នាការចូលរួម' : 'Engagement prediction'}
              </p>
            </div>
          </div>
          <div className="flex items-center p-1 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 backdrop-blur-md">
            {(['7D', '30D'] as const).map((t) => (
              <button key={t} onClick={() => setActiveTimeframe(t)} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${activeTimeframe === t ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-end gap-3 mb-2 px-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">97.2%</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full mb-1.5">
              <CaretUp size={12} weight="bold" /> +4.2%
            </span>
          </div>

          <div className="h-32 w-full mt-4 -ml-2 group-hover:scale-[1.02] transition-transform duration-700">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                  itemStyle={{ color: '#60a5fa' }} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
          <Sparkle size={14} weight="fill" className="animate-pulse" />
          <span>{isKm ? 'កម្រិតវត្តមានកើនឡើងឆ្នើម' : 'Exceptional consistency'}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Real-time</span>
      </div>
    </WidgetCard>
  );
}

// 2. AI Smart Learning Diagnostics & Recommendations Widget
function AILearningInsightsWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const insights = isKm ? [
    { title: 'គណិតវិទ្យា', desc: 'សិស្ស ៨៨% យល់ដឹងច្បាស់ពីមេរៀនថ្មី', badge: '95%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle },
    { title: 'កិច្ចការផ្ទះ', desc: 'សិស្ស ៣នាក់ យឺតយ៉ាវប្រគល់លំហាត់គីមី', badge: 'Action', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20', icon: Warning },
    { title: 'AI អនុសាសន៍', desc: 'រៀបចំការពិភាក្សាជាក្រុមតូចៗនៅថ្ងៃព្រហស្បតិ៍', badge: 'Smart', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20', icon: Lightning },
  ] : [
    { title: 'Mathematics', desc: '88% exceeded target comprehension', badge: '95%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle },
    { title: 'Assignments', desc: '3 students delayed chemistry submission', badge: 'Action', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20', icon: Warning },
    { title: 'AI Advice', desc: 'Peer breakout session recommended on Thu', badge: 'Smart', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20', icon: Lightning },
  ];

  return (
    <WidgetCard setNodeRef={setNodeRef} style={style} isDragging={isDragging} glow="bg-purple-500">
      <div className="flex-1">
        <div className="flex items-start justify-between pb-4">
          <div className="flex gap-3">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors mt-1">
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Brain size={16} weight="bold" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {isKm ? 'AI វិភាគការសិក្សា' : 'AI Diagnostics'}
                </h3>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-10.5">
                {isKm ? 'អនុសាសន៍ឆ្លាតវៃ' : 'Smart learning insights'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {insights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="group/item relative overflow-hidden p-3.5 rounded-2xl bg-white/60 dark:bg-[#1c1e26]/60 border border-white/80 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all flex items-start gap-3 backdrop-blur-md">
                <div className={`p-2 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                  <Icon size={16} weight="bold" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.bg} ${item.color}`}>{item.badge}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 group-hover/item:line-clamp-none transition-all">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center text-xs">
        <span className="text-slate-400 text-[11px] font-medium">{isKm ? 'ភាពត្រឹមត្រូវ ៩៩.៤%' : 'Confidence 99.4%'}</span>
        <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold transition flex items-center gap-1 cursor-pointer">
          {isKm ? 'របាយការណ៍លម្អិត' : 'Deep dive'} <span className="text-[14px]">→</span>
        </button>
      </div>
    </WidgetCard>
  );
}

// 3. Grade & Subject Mastery Distribution Widget
function GradeDistributionWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const data = [
    { name: 'A', value: 45, fill: '#10b981' },
    { name: 'B', value: 35, fill: '#3b82f6' },
    { name: 'C', value: 15, fill: '#f59e0b' },
    { name: 'D/F', value: 5, fill: '#ef4444' }
  ];

  return (
    <WidgetCard setNodeRef={setNodeRef} style={style} isDragging={isDragging} glow="bg-emerald-500">
      <div className="flex-1">
        <div className="flex items-start justify-between pb-4">
          <div className="flex gap-3">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors mt-1">
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <ChartBar size={16} weight="bold" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {isKm ? 'ការបែងចែកកម្រិតពិន្ទុ' : 'Grade Distribution'}
                </h3>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-10.5">
                {isKm ? 'ស្ថិតិពិន្ទុសរុបគ្រប់ថ្នាក់រៀន' : 'Roster-wide mastery curve'}
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black font-mono text-xs shadow-sm">
            GPA 3.68
          </div>
        </div>

        <div className="mt-4 h-36 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-700">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={12} data={data}>
              <RadialBar background={{ fill: 'rgba(148, 163, 184, 0.1)' }} dataKey="value" cornerRadius={12} />
              <Tooltip cursor={false} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">80%</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{isKm ? 'កម្រិត A/B' : 'Top A/B'}</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-5">
           {data.map((entry, index) => (
             <div key={`legend-${index}`} className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
               <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.fill }} />
               <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{entry.name}</span>
             </div>
           ))}
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center text-xs">
        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{isKm ? 'កំណើន +១២% ធៀបខែមុន' : '+12% from last term'}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">Rank #1</span>
      </div>
    </WidgetCard>
  );
}

// 4. Financial & Claims Approvals Breakdown Widget
function FinanceDistributionWidget({ id, isKm }: AIWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const breakdown = [
    { label: isKm ? 'បានទូទាត់រួច' : 'Paid Claims', amount: '$4,850', count: 32, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', barW: 'w-[85%]' },
    { label: isKm ? 'រង់ចាំអនុម័ត' : 'Pending Review', amount: '$620', count: 4, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', barW: 'w-[11%]' },
    { label: isKm ? 'បង្វិលសងវិញ' : 'Returned', amount: '$150', count: 2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', barW: 'w-[4%]' },
  ];

  return (
    <WidgetCard setNodeRef={setNodeRef} style={style} isDragging={isDragging} glow="bg-amber-500">
      <div className="flex-1">
        <div className="flex items-start justify-between pb-4">
          <div className="flex gap-3">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors mt-1">
              <DotsSixVertical size={18} weight="bold" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Coins size={16} weight="bold" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {isKm ? 'ហិរញ្ញវត្ថុ & ការទូទាត់' : 'Fiscal & Collections'}
                </h3>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-10.5">
                {isKm ? 'ទិន្នន័យចំណូលប្រចាំខែ' : 'Monthly audited ledger'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 mb-5 flex items-end gap-2 px-1">
          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">$5,620<span className="text-xl text-slate-400 dark:text-slate-500">.00</span></span>
        </div>

        <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-black/40 border border-slate-200/50 dark:border-white/5 flex overflow-hidden mb-6 shadow-inner">
           {breakdown.map((b, i) => (
             <div key={i} className={`h-full ${b.bg} ${b.barW} transition-all duration-1000 ease-out border-r border-white/20 last:border-r-0`} />
           ))}
        </div>

        <div className="space-y-3.5">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group/fin cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${item.bg} group-hover/fin:scale-150 transition-transform shadow-sm`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className="text-[13px] font-black text-slate-900 dark:text-white">{item.amount}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[28px] text-center">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5 flex justify-between items-center text-xs">
        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{isKm ? 'អត្រាទូទាត់ជោគជ័យ ៩៤.៥%' : 'Settlement: 94.5%'}</span>
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
          <ShieldCheck size={14} weight="fill" />
          <span>Audited OK</span>
        </div>
      </div>
    </WidgetCard>
  );
}

// ----------------------------------------------------
// Main Draggable AI Chart Widgets Container
// ----------------------------------------------------
export function AIDraggableWidgets({ isKm = true }: { isKm?: boolean }) {
  const defaultWidgetIds = ['attendance-trend', 'ai-insights', 'grade-dist', 'finance-dist'];
  const [widgetOrder, setWidgetOrder] = useState<string[]>(defaultWidgetIds);
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('school_ai_widgets_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWidgetOrder(parsed);
          setIsCustomOrder(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(String(active.id));
      const newIndex = widgetOrder.indexOf(String(over.id));
      const newOrder = arrayMove(widgetOrder, oldIndex, newIndex);
      setWidgetOrder(newOrder);
      setIsCustomOrder(true);
      localStorage.setItem('school_ai_widgets_order', JSON.stringify(newOrder));
    }
  };

  const handleResetOrder = () => {
    setWidgetOrder(defaultWidgetIds);
    setIsCustomOrder(false);
    localStorage.removeItem('school_ai_widgets_order');
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'attendance-trend':
        return <AttendanceTrendWidget key={id} id={id} isKm={isKm} />;
      case 'ai-insights':
        return <AILearningInsightsWidget key={id} id={id} isKm={isKm} />;
      case 'grade-dist':
        return <GradeDistributionWidget key={id} id={id} isKm={isKm} />;
      case 'finance-dist':
        return <FinanceDistributionWidget key={id} id={id} isKm={isKm} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Draggable Reorder Notice Banner */}
      <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 backdrop-blur-sm border border-blue-500/20">
            <DotsSixVertical size={16} weight="bold" />
          </div>
          <span className="font-bold text-[13px] tracking-tight">
            {isKm
              ? 'រៀបចំផ្ទាំង AI តាមបំណង — អូសដើម្បីប្ដូរទីតាំង Widget · រក្សាទុកដោយស្វ័យប្រវត្តិ'
              : 'Customize Layout — drag widgets to reorder · auto-saved locally'}
          </span>
        </div>
        {isCustomOrder && (
          <button
            onClick={handleResetOrder}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <ArrowClockwise size={13} weight="bold" />
            <span>{isKm ? 'កំណត់ដើម' : 'Reset default'}</span>
          </button>
        )}
      </div>

      {/* Grid of Sortable AI Widgets */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {widgetOrder.map((id) => renderWidget(id))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default AIDraggableWidgets;
