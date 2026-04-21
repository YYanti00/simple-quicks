"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PanelContainerProps {
  isOpen: boolean;
  children: ReactNode;
  onClose?: () => void;
}

export function PanelContainer({
  isOpen,
  children,
  onClose,
}: PanelContainerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-20 right-0 w-[634px] h-[600px] bg-white rounded-sm shadow-2xl overflow-hidden z-30 flex flex-col align-items-bottom"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
