"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { TaskItem, type TaskItemData } from "./task-item";

export type { TaskItemData as TaskItem };

interface TaskPanelProps {
  items: TaskItemData[];
  onClose: () => void;
  onToggle: (id: string, completed: boolean) => void;
  onAdd?: () => void;
  onUpdateDate?: (id: string, date: string) => void;
  onUpdateDescription?: (id: string, description: string) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onUpdateTags?: (id: string, tags: TaskItemData["tags"]) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

const CATEGORIES = ["My Tasks", "Personal Errands", "Urgent To-Do"];

export function TaskPanel({
  items,
  onClose,
  onToggle,
  onAdd,
  onUpdateDate,
  onUpdateDescription,
  onUpdateTitle,
  onUpdateTags,
  onDelete,
  loading,
}: TaskPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [prevItemsCount, setPrevItemsCount] = useState(items.length);

  // Initialize expandedIds based on completed status when items are loaded
  useEffect(() => {
    if (items.length > 0 && !initialized) {
      const initialExpanded = new Set<string>();
      items.forEach(item => {
        if (!item.completed) {
          initialExpanded.add(item.id);
        }
      });
      setExpandedIds(initialExpanded);
      setInitialized(true);
      setPrevItemsCount(items.length);
    } else if (items.length > prevItemsCount) {
      // Handle newly added tasks
      setExpandedIds(prev => {
        const newExpanded = new Set(prev);
        items.forEach(item => {
          if (!item.completed) {
            newExpanded.add(item.id);
          }
        });
        return newExpanded;
      });
      setPrevItemsCount(items.length);
    }
  }, [items, initialized, prevItemsCount]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5">
        <div className="relative">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#828282] rounded-md text-[#4F4F4F] font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {selectedCategory}
            <ChevronDown className={`w-4 h-4 text-[#4F4F4F] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCategoryOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#828282] rounded-md shadow-lg z-10 overflow-hidden">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#4F4F4F] font-bold hover:bg-[#F2F2F2] border-b border-[#828282] last:border-0  cursor-pointer"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {onAdd && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-sm font-bold rounded-md transition-colors cursor-pointer"
          >
            New Task
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-8 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#828282] animate-spin" />
            <span className="text-[#4F4F4F] text-sm">Loading Task List...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#828282] text-sm font-medium">No tasks found</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map((item) => (
              <TaskItem
                key={item.id}
                item={item}
                isExpanded={expandedIds.has(item.id)}
                onToggleExpand={() => toggleExpand(item.id)}
                onToggleComplete={onToggle}
                onUpdateDate={onUpdateDate}
                onUpdateDescription={onUpdateDescription}
                onUpdateTitle={onUpdateTitle}
                onUpdateTags={onUpdateTags}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
