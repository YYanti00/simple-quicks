"use client";

import { Search, X, LucideIcon, RefreshCw, Plus, Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface PanelItem {
  id: string;
  avatar?: string;
  avatarIcon?: LucideIcon;
  title: string;
  subtitle?: string;
  date: string;
  description: string;
  unread?: boolean;
}

export type { PanelItem };

interface PanelProps {
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
  return (
    <>
      <div className="py-5 px-8">
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-white border border-(--color-border-2) rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-bg-dark-1)" />
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-[500px] overflow-y-auto">
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
                      {/* Avatar - Overlapping circles */}
                      <div className="shrink-0 relative w-10 h-8">
                        {/* Back circle - gray */}
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        {/* Front circle - blue */}
                        <div className="absolute right-0 bottom-0 w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-medium text-blue-600 truncate capitalize">
                            {item.title}
                          </p>
                          <span className="text-xs text-gray-400 shrink-0">
                            {item.date}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="text-xs text-(--color-bg-dark-2) font-semibold">
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
    </>
  );
}
