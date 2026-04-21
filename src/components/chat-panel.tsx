"use client";

import { Search, X, LucideIcon, RefreshCw, Plus, Loader2, User as UserIcon } from "lucide-react";
import { ReactNode, useState, useMemo } from "react";
import { LoadingIndicator } from "./ui/loading-indicator";

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

export function ChatPanel({
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  return (
    <>
      <div className="py-5 px-8">
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-(--color-border-2) rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-bg-dark-1)" />
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <LoadingIndicator message="Loading Chats ..." />
        )}

        {error && !loading && (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-blue-500 hover:text-blue-600 text-sm underline cursor-pointer"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchQuery ? `No results found for "${searchQuery}"` : emptyMessage}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <div key={item.id}>
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <button
                    onClick={() => onItemClick?.(item.id)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left  cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar - Overlapping circles or Single initial */}
                      {item.title === "Fast Visa Support" ? (
                        <div className="shrink-0 w-[51px] flex justify-center">
                          <div className="w-[34px] h-[34px] rounded-full bg-[#2F80ED] flex items-center justify-center text-white font-bold text-sm">
                            {item.avatar || "F"}
                          </div>
                        </div>
                      ) : (
                        <div className="shrink-0 relative w-[51px] h-[34px]">
                          {/* Back circle - gray */}
                          <div className="absolute left-0 top-0 w-[34px] h-[34px] rounded-full bg-[#E0E0E0] flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-[#4F4F4F]" />
                          </div>
                          {/* Front circle - blue */}
                          <div className="absolute right-0 top-0 w-[34px] h-[34px] rounded-full bg-[#2F80ED] flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

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
