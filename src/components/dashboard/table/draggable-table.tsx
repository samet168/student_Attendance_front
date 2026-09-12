'use client';

import React from 'react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/table';

interface DraggableTableProps<T extends { id: string | number }> {
  items: T[];
  onDragEnd: (event: DragEndEvent) => void;
  headers: string[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

export function DraggableTable<T extends { id: string | number }>({
  items,
  onDragEnd,
  headers,
  renderRow,
}: DraggableTableProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              {headers.map((h, i) => (
                <TableHead key={i}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item, index) => renderRow(item, index))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
    </DndContext>
  );
}

export default DraggableTable;
