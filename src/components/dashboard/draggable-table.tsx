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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  DotsSixVertical, Star, ArrowCounterClockwise, CheckSquare, Square,
  PencilSimple, Trash, Phone, Envelope
} from '@phosphor-icons/react';
import { StudentItem } from '@/types';
import { useAppStore, translations } from '@/lib/store';

interface SortableRowProps {
  student: StudentItem;
  isSelected: boolean;
  isStarred: boolean;
  onToggleSelect: (id: number) => void;
  onToggleStar: (id: number) => void;
  onEdit?: (student: StudentItem) => void;
  onDelete?: (studentId: number) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
  student,
  isSelected,
  isStarred,
  onToggleSelect,
  onToggleStar,
  onEdit,
  onDelete,
}) => {
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
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors group ${
        isSelected ? 'bg-blue-50/50' : ''
      }`}
    >
      {/* Drag Handle */}
      <td className="py-3.5 pl-4 pr-1 w-10 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-1 rounded transition"
          title="អូសដើម្បីតម្រៀប / Drag to reorder"
        >
          <DotsSixVertical size={18} weight="bold" />
        </button>
      </td>

      {/* Select Checkbox */}
      <td className="py-3.5 px-2 w-10 text-center">
        <button
          onClick={() => onToggleSelect(student.id)}
          className="text-slate-400 hover:text-blue-600 p-1 transition cursor-pointer"
        >
          {isSelected ? (
            <CheckSquare size={18} weight="fill" className="text-blue-600" />
          ) : (
            <Square size={18} />
          )}
        </button>
      </td>

      {/* Star / Favorite */}
      <td className="py-3.5 px-2 w-10 text-center">
        <button
          onClick={() => onToggleStar(student.id)}
          className="p-1 transition cursor-pointer"
        >
          <Star
            size={18}
            weight={isStarred ? 'fill' : 'regular'}
            className={isStarred ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}
          />
        </button>
      </td>

      {/* Roll No */}
      <td className="py-3.5 px-3 text-sm font-semibold text-slate-700 w-16 text-center">
        #{student.roll_no}
      </td>

      {/* Student Avatar + Info */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
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
            <div className="font-semibold text-slate-900 text-sm">{student.name}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[11px]">
                {student.student_code}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Contact info */}
      <td className="py-3.5 px-4 text-xs text-slate-600">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Envelope size={13} className="text-slate-400" />
            <span>{student.email}</span>
          </div>
          {student.phone && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Phone size={13} className="text-slate-400" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>
      </td>

      {/* Status Pill */}
      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Active</span>
        </span>
      </td>

      {/* Action buttons */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
          {onEdit && (
            <button
              onClick={() => onEdit(student)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="កែប្រែ"
            >
              <PencilSimple size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(student.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="ដកសិស្សចេញ"
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

interface DraggableTableProps {
  students: StudentItem[];
  onReorder?: (newStudents: StudentItem[]) => void;
  onEdit?: (student: StudentItem) => void;
  onDelete?: (studentId: number) => void;
}

export const DraggableTable: React.FC<DraggableTableProps> = ({
  students: initialStudents,
  onReorder,
  onEdit,
  onDelete,
}) => {
  const [items, setItems] = useState<StudentItem[]>(initialStudents);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [starredIds, setStarredIds] = useState<number[]>([]);
  const [isCustomOrdered, setIsCustomOrdered] = useState(false);
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    // Check saved order from local storage
    const saved = localStorage.getItem('school_students_order');
    if (saved) {
      try {
        const orderIds = JSON.parse(saved) as number[];
        const sorted = [...initialStudents].sort(
          (a, b) => orderIds.indexOf(a.id) - orderIds.indexOf(b.id)
        );
        setItems(sorted);
        setIsCustomOrdered(true);
        return;
      } catch {
        // ignore
      }
    }
    setItems(initialStudents);
  }, [initialStudents]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        
        // Save order locally
        localStorage.setItem(
          'school_students_order',
          JSON.stringify(reordered.map((s) => s.id))
        );
        setIsCustomOrdered(true);
        if (onReorder) onReorder(reordered);
        return reordered;
      });
    }
  };

  const handleResetOrder = () => {
    localStorage.removeItem('school_students_order');
    const reset = [...initialStudents].sort((a, b) => a.roll_no - b.roll_no);
    setItems(reset);
    setIsCustomOrdered(false);
    if (onReorder) onReorder(reset);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleStar = (id: number) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {/* Device Storage Status Banner */}
      {isCustomOrdered && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50/80 border border-blue-100 rounded-xl mb-3 text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{t.savedOnDevice}</span>
          </div>
          <button
            onClick={handleResetOrder}
            className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            <ArrowCounterClockwise size={13} />
            <span>{t.resetOrder}</span>
          </button>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 pl-4 pr-1 w-10"></th>
                <th className="py-3 px-2 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-blue-600 p-1 transition cursor-pointer"
                    title={t.selectAll}
                  >
                    {selectedIds.length > 0 && selectedIds.length === items.length ? (
                      <CheckSquare size={18} weight="fill" className="text-blue-600" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="py-3 px-2 w-10 text-center">★</th>
                <th className="py-3 px-3 text-center">{t.rollNo}</th>
                <th className="py-3 px-4">{t.studentName}</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">{t.status}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((student) => (
                    <SortableRow
                      key={student.id}
                      student={student}
                      isSelected={selectedIds.includes(student.id)}
                      isStarred={starredIds.includes(student.id)}
                      onToggleSelect={toggleSelect}
                      onToggleStar={toggleStar}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            មិនទាន់មានទិន្នន័យសិស្សនៅឡើយទេ
          </div>
        )}
      </div>
    </div>
  );
};
