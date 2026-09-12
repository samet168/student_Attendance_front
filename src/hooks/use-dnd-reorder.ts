import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export function useDndReorder<T extends { id: number | string }>(
  initialItems: T[],
  storageKey: string = 'school_custom_order'
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isCustomOrdered, setIsCustomOrdered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const orderIds = JSON.parse(saved) as (number | string)[];
        const sorted = [...initialItems].sort(
          (a, b) => orderIds.indexOf(a.id) - orderIds.indexOf(b.id)
        );
        setItems(sorted);
        setIsCustomOrdered(true);
        return;
      } catch {
        // ignore
      }
    }
    setItems(initialItems);
  }, [initialItems, storageKey]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        localStorage.setItem(storageKey, JSON.stringify(reordered.map((i) => i.id)));
        setIsCustomOrdered(true);
        return reordered;
      });
    }
  };

  const resetOrder = (defaultSortFn?: (a: T, b: T) => number) => {
    localStorage.removeItem(storageKey);
    const reset = defaultSortFn ? [...initialItems].sort(defaultSortFn) : initialItems;
    setItems(reset);
    setIsCustomOrdered(false);
  };

  return {
    items,
    setItems,
    isCustomOrdered,
    handleDragEnd,
    resetOrder,
  };
}
