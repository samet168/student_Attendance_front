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
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface DraggableGridProps<T extends { id: string | number }> {
  items: T[];
  onDragEnd: (event: DragEndEvent) => void;
  renderCard: (item: T, index: number) => React.ReactNode;
}

export function DraggableGrid<T extends { id: string | number }>({
  items,
  onDragEnd,
  renderCard,
}: DraggableGridProps<T>) {
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
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, index) => renderCard(item, index))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default DraggableGrid;
