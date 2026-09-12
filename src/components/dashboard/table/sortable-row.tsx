'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { TableRow } from '@/components/ui/table';

interface SortableRowProps extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'id'> {
  id: string | number;
  children: React.ReactNode;
}

export function SortableRow({ id, children, className, ...props }: SortableRowProps) {
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
    position: 'relative',
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        'hover:bg-slate-50/80',
        isDragging && 'bg-blue-50/70 border-blue-300 shadow-md ring-1 ring-blue-400/40',
        className
      )}
      {...props}
    >
      <td className="w-10 px-2 text-center align-middle">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          title="Drag to reorder"
        >
          <DotsSixVertical size={18} weight="bold" />
        </button>
      </td>
      {children}
    </TableRow>
  );
}

export default SortableRow;
