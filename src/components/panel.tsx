"use client";

import { motion } from "framer-motion";
import { Search, X, LucideIcon, RefreshCw, Plus, Loader2 } from "lucide-react";
import { ReactNode } from "react";

export interface PanelItem {
  id: string;
  avatar?: string;
  avatarIcon?: LucideIcon;
  title: string;
  subtitle?: string;
  date: string;
  description: string;
  unread?: boolean;
}

interface PanelProps {
  isOpen: boolean;
  title: string;
  icon: LucideIcon;
  items: PanelItem[];
  onClose: () => void;
  onItemClick?: (id: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  renderItem?: (item: PanelItem) => ReactNode;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
}

export function Panel({
  isOpen,
  title,
  icon: Icon,
  items,
  onClose,
  onItemClick,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  renderItem,
  loading,
  error,
  onRefresh,
  onAdd,
  addButtonLabel,
}: PanelProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute bottom-20 right-0 w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden z-30"
    >
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            )}
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {addButtonLabel}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-[320px] overflow-y-auto">
        {loading && (
          <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {error && !loading && (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-blue-500 hover:text-blue-600 text-sm underline"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            {emptyMessage}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id}>
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <button
                    onClick={() => onItemClick?.(item.id)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {item.avatarIcon ? (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <item.avatarIcon className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                            {item.avatar || item.title.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {item.title}
                          </p>
                          <span className="text-xs text-gray-400 shrink-0">
                            {item.date}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="text-xs text-gray-500">
                            {item.subtitle}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {item.unread && (
                        <div className="shrink-0 w-2 h-2 rounded-full bg-red-500 mt-2" />
                      )}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
