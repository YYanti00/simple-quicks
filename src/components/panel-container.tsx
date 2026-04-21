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
          className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[634px] h-[450px] sm:h-[520px] max-h-[calc(100vh-120px)] bg-white rounded-sm shadow-2xl overflow-hidden z-30 flex flex-col"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
