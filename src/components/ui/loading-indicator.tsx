"use client";

import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export function LoadingIndicator({
  message = "Loading...",
  className = "",
}: LoadingIndicatorProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-4 ${className}`}>
      <div className="relative w-12 h-12">
        <div className="absolute rounded-full border-4 border-[#F2F2F2]" />
        <Loader2 className="absolute  w-12 h-12 text-[#C4C4C4] animate-spin stroke-[3px]" />
      </div>
      <span className="text-[#4F4F4F] text-sm font-bold">{message}</span>
    </div>
  );
}
