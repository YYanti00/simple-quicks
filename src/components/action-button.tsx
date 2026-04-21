"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type ButtonVariant =
  | "task"
  | "inbox"
  | "main"
  | "shadow"
  | "active-task"
  | "active-inbox";

interface ActionButtonProps {
  variant: ButtonVariant;
  onClick: () => void;
  icon: LucideIcon;
  label?: string;
  layoutId?: string;
  delay?: number;
  className?: string;
  iconFill?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  task: "bg-(--color-border-1) hover:bg-(--color-border-1)/90 w-[56px] h-[56px]",
  inbox:
    "bg-(--color-border-1) hover:bg-(--color-border-1)/90 w-[56px] h-[56px]",
  main: "bg-(--color-primary-1) hover:bg-(--color-primary-1)/90 w-[60px] h-[60px] z-10",
  shadow:
    "bg-(--color-bg-dark-2) hover:bg-(--color-bg-dark-2)/90 w-[60px] h-[60px] z-0",
  "active-task":
    "bg-(--color-indicator-1) hover:bg-(--color-indicator-1)/90 w-[60px] h-[60px]",
  "active-inbox":
    "bg-(--color-indicator-2) hover:bg-(--color-indicator-2)/90 w-[60px] h-[60px]",
};

const iconColors: Record<ButtonVariant, string> = {
  task: "text-(--color-indicator-1)",
  inbox: "text-(--color-indicator-2)",
  main: "text-white",
  shadow: "text-white",
  "active-task": "text-white",
  "active-inbox": "text-white",
};

export function ActionButton({
  variant,
  onClick,
  icon: Icon,
  label,
  layoutId,
  delay = 0,
  className = "",
  iconFill,
}: ActionButtonProps) {
  const content = (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {label && (
        <span
          className={`text-white text-sm font-medium ${label === " " ? "opacity-0" : ""}`}
        >
          {label}
        </span>
      )}
      <Button
        onClick={onClick}
        className={`${variantStyles[variant]} rounded-full cursor-pointer`}
      >
        <Icon
          size={24}
          className={`${iconColors[variant]} h-full! w-[22px]! ${variant == "main" ? "fill-current" : "fill-transparent"}`}
          fill={variant == "main" ? iconFill : ""}
        />
      </Button>
    </div>
  );

  if (layoutId) {
    return (
      <motion.div
        layoutId={layoutId}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25, delay, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
