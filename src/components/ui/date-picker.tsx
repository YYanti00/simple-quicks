"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const date = value ? new Date(value) : undefined;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSelect = (selectedDate: Date) => {
    // Manually format to YYYY-MM-DD using local time to avoid timezone shifts
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    
    onChange?.(formatted);
    setIsOpen(false);
  };

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-1.5 border border-[#828282] rounded-md text-sm text-[#4F4F4F] bg-white hover:bg-gray-50 transition-colors min-w-[150px]",
          isOpen && "border-[#2F80ED]"
        )}
      >
        <span>{date ? formatDate(date) : "Set Date"}</span>
        <CalendarIcon className="w-4 h-4 text-[#4F4F4F]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-1 z-50"
          >
            <Calendar selected={date} onSelect={handleSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
