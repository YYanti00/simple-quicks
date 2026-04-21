"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar as CalendarIcon, 
  Clock,
  Pencil, 
  Bookmark, 
  MoreHorizontal, 
  Check 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "./ui/date-picker";
import { DeleteConfirmationModal } from "./ui/delete-confirmation-modal";

export interface TaskTag {
  label: string;
  color: string;
}

export interface TaskItemData {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  description?: string;
  tags?: TaskTag[];
}

const AVAILABLE_TAGS: TaskTag[] = [
  { label: "Important ASAP", color: "#E5A443" },
  { label: "Offline Meeting", color: "#9B51E0" },
  { label: "Virtual Meeting", color: "#F2C94C" },
  { label: "ASAP", color: "#6FCF97" },
  { label: "Client Related", color: "#43B78D" },
  { label: "Self Task", color: "#2F80ED" },
  { label: "Appointments", color: "#EB5757" },
  { label: "Court Related", color: "#56CCF2" },
];

interface TaskItemProps {
  item: TaskItemData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onUpdateDate?: (id: string, date: string) => void;
  onUpdateDescription?: (id: string, description: string) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onUpdateTags?: (id: string, tags: TaskTag[]) => void;
  onDelete?: (id: string) => void;
}

function getDaysLeft(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function TaskItem({
  item,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onUpdateDate,
  onUpdateDescription,
  onUpdateTitle,
  onUpdateTags,
  onDelete,
}: TaskItemProps) {
  const [isTagPopupOpen, setIsTagPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(item.title === "");
  const [localTitle, setLocalTitle] = useState(item.title);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const daysLeft = getDaysLeft(item.dueDate);
  const isOverdue = daysLeft < 0;
  const showDaysLeft = !item.completed && daysLeft <= 14;
  const daysLeftColor = daysLeft < 5 ? "text-[#EB5757]" : "text-[#4F4F4F]";

  // Auto-resize description textarea
  useEffect(() => {
    const textarea = descriptionRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.max(35, Math.min(textarea.scrollHeight, 70));
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > 70 ? "auto" : "hidden";
    }
  }, [item.description]);

  // Click outside for tag popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagContainerRef.current && !tagContainerRef.current.contains(event.target as Node)) {
        setIsTagPopupOpen(false);
      }
    };
    if (isTagPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTagPopupOpen]);

  const toggleTag = (tag: TaskTag) => {
    const currentTags = item.tags || [];
    const isAlreadySelected = currentTags.some((t) => t.label === tag.label);
    
    let newTags;
    if (isAlreadySelected) {
      newTags = currentTags.filter((t) => t.label !== tag.label);
    } else {
      newTags = [...currentTags, tag];
    }
    
    onUpdateTags?.(item.id, newTags);
  };

  return (
    <div className="border-b border-[#828282] last:border-0 py-4">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => {
            onToggleComplete(item.id, !item.completed);
            if (!item.completed && isExpanded) {
              onToggleExpand();
            }
          }}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
            item.completed
              ? "bg-white border-[#828282]"
              : "border-[#828282]"
          }`}
        >
          {item.completed && <Check className="w-3.5 h-3.5 text-[#828282]" />}
        </button>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            {isEditingTitle ? (
              <input
                autoFocus
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdateTitle?.(item.id, localTitle);
                    setIsEditingTitle(false);
                  }
                }}
                onBlur={() => {
                  onUpdateTitle?.(item.id, localTitle);
                  setIsEditingTitle(false);
                }}
                placeholder="Type Task Title"
                className="flex-1 px-3 py-1.5 text-sm font-bold border border-[#828282] rounded-md focus:outline-none focus:ring-1 focus:ring-[#2F80ED] text-[#4F4F4F] placeholder-[#828282]"
              />
            ) : (
              <span
                className={`text-sm font-bold leading-tight cursor-pointer ${
                  item.completed
                    ? "text-[#828282] line-through"
                    : "text-[#4F4F4F]"
                }`}
                onClick={() => {
                  setLocalTitle(item.title);
                  setIsEditingTitle(true);
                }}
              >
                {item.title || "No Title"}
              </span>
            )}

            <div className="flex items-center gap-4 flex-shrink-0">
              {showDaysLeft && (
                <span className={`text-xs font-medium ${daysLeftColor}`}>
                  {isOverdue ? "Overdue" : `${daysLeft} Days Left`}
                </span>
              )}
              <span className="text-xs text-[#4F4F4F]">
                {formatDate(item.dueDate)}
              </span>
              <button
                onClick={onToggleExpand}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#4F4F4F]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#4F4F4F]" />
                )}
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsDeletePopupOpen(!isDeletePopupOpen)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4 text-[#4F4F4F]" />
                </button>

                <AnimatePresence>
                  {isDeletePopupOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full right-0 mt-1 bg-white border border-[#828282] rounded-md shadow-lg z-30 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setIsDeletePopupOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="px-6 py-2 text-sm text-[#EB5757] font-medium hover:bg-gray-50 whitespace-nowrap transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={isExpanded ? "" : "overflow-hidden"}
              >
                <div className="pt-4 space-y-4">
                  {/* Date Picker */}
                  <div className="flex items-center gap-4">
                    <Clock className="w-4 h-4 text-[#2F80ED]" />
                    <DatePicker
                      value={item.dueDate}
                      onChange={(date) => onUpdateDate?.(item.id, date)}
                    />
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-4">
                    <Pencil className="w-4 h-4 text-[#2F80ED] mt-1" />
                    <textarea
                      ref={descriptionRef}
                      value={item.description || ""}
                      onChange={(e) => onUpdateDescription?.(item.id, e.target.value)}
                      placeholder="No Description"
                      className="flex-1 px-0 py-1 !h-[35px] text-sm text-[#4F4F4F] placeholder-[#828282] focus:outline-none resize-none bg-transparent"
                      style={{ maxHeight: '70px' }}
                    />
                  </div>

                  {/* Tags */}
                  <div className="relative" ref={tagContainerRef}>
                    <div 
                      onClick={() => setIsTagPopupOpen(!isTagPopupOpen)}
                      className={`flex items-start gap-4 p-2 rounded cursor-pointer transition-all ${
                        isTagPopupOpen ? 'bg-[#F9F9F9] border border-[#2F80ED]' : 'bg-[#F9F9F9] border border-transparent'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 text-[#2F80ED] mt-1" />
                      <div className="flex flex-wrap gap-2 flex-1">
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded text-xs font-bold"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              {tag.label}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-[#828282] py-1">No Tags</span>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isTagPopupOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-1 w-[250px] bg-white border border-[#828282] rounded-md shadow-lg z-20 p-3 space-y-2"
                        >
                          {AVAILABLE_TAGS.map((tag) => {
                            const isSelected = item.tags?.some((t) => t.label === tag.label);
                            return (
                              <button
                                key={tag.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTag(tag);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-bold transition-colors border cursor-pointer ${
                                  isSelected ? 'border-[#2F80ED]' : 'border-transparent'
                                }`}
                                style={{ 
                                  backgroundColor: tag.color + '20', 
                                  color: tag.color,
                                }}
                              >
                                {tag.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete?.(item.id)}
      />
    </div>
  );
}
