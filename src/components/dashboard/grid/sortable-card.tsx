'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface SortableCardProps {
  id: string | number;
  children: React.ReactNode;
  className?: string;
}

export function SortableCard({ id, children, className }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md',
        isDragging && 'ring-2 ring-blue-500 shadow-xl bg-blue-50/50',
        className
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
        title="Drag to reorder"
      >
        <DotsSixVertical size={18} weight="bold" />
      </button>
      {children}
    </div>
  );
}

export default SortableCard;
