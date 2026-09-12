'use client';

import React from 'react';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Star, Envelope, Phone, PencilSimple, Trash } from '@phosphor-icons/react';
import { StudentItem } from '@/types';

interface SortableCardProps {
  student: StudentItem;
  onEdit?: (student: StudentItem) => void;
  onDelete?: (studentId: number) => void;
}

const SortableCard: React.FC<SortableCardProps> = ({ student, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: student.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition group relative flex flex-col justify-between"
    >
      <div>
        {/* Card Header: Drag handle & Roll */}
        <div className="flex items-center justify-between text-slate-400 mb-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-600 rounded transition"
            title="អូសដើម្បីតម្រៀប"
          >
            <DotsSixVertical size={18} weight="bold" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              #{student.roll_no}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* Avatar and Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              student.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{student.name}</h4>
            <span className="text-[11px] font-mono text-slate-400">{student.student_code}</span>
          </div>
        </div>

        {/* Contact details */}
        <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Envelope size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{student.email}</span>
          </div>
          {student.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-1 mt-4 pt-2 border-t border-slate-50">
        {onEdit && (
          <button
            onClick={() => onEdit(student)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
          >
            <PencilSimple size={15} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(student.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          >
            <Trash size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

interface CardGridProps {
  students: StudentItem[];
  onReorder?: (newStudents: StudentItem[]) => void;
  onEdit?: (student: StudentItem) => void;
  onDelete?: (studentId: number) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({ students, onReorder, onEdit, onDelete }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = students.findIndex((item) => item.id === active.id);
      const newIndex = students.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(students, oldIndex, newIndex);
      localStorage.setItem('school_students_order', JSON.stringify(reordered.map((s) => s.id)));
      if (onReorder) onReorder(reordered);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={students.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {students.map((student) => (
            <SortableCard
              key={student.id}
              student={student}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
