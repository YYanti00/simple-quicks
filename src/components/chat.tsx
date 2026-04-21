"use client";

import { useState, useRef, useEffect, ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, MoreHorizontal, Send } from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  senderColor: "purple" | "orange" | "teal";
  content: string;
  timestamp: string;
  isMe: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  replyTo?: {
    senderName: string;
    content: string;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  participants: number;
  messages: ChatMessage[];
}

interface ChatProps {
  thread: ChatThread;
  hasNewMessages: boolean;
  onBack: () => void;
  onClose: () => void;
}

const senderColors = {
  purple: "bg-purple-100 text-purple-900",
  orange: "bg-orange-100 text-orange-900",
  teal: "bg-teal-100 text-teal-900",
};

const senderNameColors = {
  purple: "text-purple-600",
  orange: "text-orange-600",
  teal: "text-teal-600",
};

// Auto-resizing textarea component
interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  maxRows?: number;
}

function AutoResizeTextarea({
  value,
  onChange,
  onSend,
  placeholder,
  maxRows = 5,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate line height
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const maxHeight = lineHeight * maxRows;

    // Set new height (capped at max)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Enable/disable scroll based on content
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxRows]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={1}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px]"
    />
  );
}

export function Chat({ thread, hasNewMessages, onBack, onClose }: ChatProps) {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(thread.messages);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null,
  );
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on mount
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeMenuId]);

  // Handle scroll to show/hide "New Message" button (only for chats with new messages)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowNewMessage(hasNewMessages && !isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    if (editingMessage) {
      // Update existing message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessage.id
            ? { ...m, content: newMessage, isEdited: true }
            : m,
        ),
      );
      setEditingMessage(null);
    } else {
      // Send new message (with reply info if applicable)
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "me",
        senderName: "You",
        senderColor: "purple",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
        replyTo: replyTo
          ? {
              senderName: replyTo.senderName,
              content: replyTo.content.slice(0, 100),
            }
          : undefined,
      };
      setMessages((prev) => [...prev, newMsg]);
    }
    setNewMessage("");
    setReplyTo(null);
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleEdit = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
    setActiveMenuId(null);
  };

  const handleDeleteConfirm = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isDeleted: true, content: "" } : m,
      ),
    );
    setDeleteConfirmId(null);
    setActiveMenuId(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  // Group messages by date (simplified - groups by sender changes)
  const renderMessages = () => {
    const elements: ReactElement[] = [];
    let lastDate: string | null = null;

    // Find where new messages start (for unread indicator)
    const newMessageIndex = messages.findIndex(
      (m) => m.sender === "obaidullah",
    );

    messages.forEach((msg, index) => {
      // Date separator
      if (index === 2) {
        elements.push(
          <div
            key="date-sep"
            className="flex items-center justify-center gap-3 my-4"
          >
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500">Today June 09, 2021</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>,
        );
      }

      // New Message divider - only show if chat had unread indicator
      if (hasNewMessages && index === newMessageIndex && index > 0) {
        elements.push(
          <div
            key="new-msg"
            className="flex items-center justify-center gap-3 my-4"
          >
            <div className="flex-1 h-px bg-red-400" />
            <span className="text-sm text-red-500 font-medium">
              New Message
            </span>
            <div className="flex-1 h-px bg-red-400" />
          </div>,
        );
      }

      const isFirstInGroup =
        index === 0 || thread.messages[index - 1].sender !== msg.sender;

      const isDeleted = msg.isDeleted;

      const hasReply = msg.replyTo;

      elements.push(
        <div
          key={msg.id}
          className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"} mb-3 relative`}
        >
          {isFirstInGroup && !msg.isMe && (
            <span
              className={`text-xs font-medium mb-1 ${senderNameColors[msg.senderColor]}`}
            >
              {msg.senderName}
            </span>
          )}
          {isFirstInGroup && msg.isMe && (
            <span
              className={`text-xs font-medium mb-1 ${senderNameColors[msg.senderColor]}`}
            >
              You
            </span>
          )}
          {/* Reply Preview - always above the message */}
          {hasReply && (
            <div className="mb-0.5 max-w-[80%]">
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <p className="text-gray-500 text-xs mb-1">
                  {msg.replyTo?.senderName}
                </p>
                <p className="text-gray-700 line-clamp-2">
                  {msg.replyTo?.content}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2 max-w-[80%] flex-row">
            {msg.isMe && !isDeleted && (
              <div className="relative order-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                  }}
                  className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
                {/* Popup Menu */}
                <AnimatePresence>
                  {activeMenuId === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-8 w-24 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(msg)}
                        className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          setDeleteConfirmId(msg.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50 transition-colors border-t border-gray-100"
                      >
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div
              className={`px-4 py-2 rounded-lg text-sm ${
                isDeleted
                  ? "bg-gray-100 text-gray-400 italic"
                  : `${senderColors[msg.senderColor]} ${
                      msg.isMe
                        ? "rounded-br-none order-2"
                        : "rounded-bl-none order-1"
                    }`
              }`}
            >
              {isDeleted ? (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  This message has been deleted
                </span>
              ) : (
                <>
                  {msg.content}
                  {msg.isEdited && (
                    <span className="text-xs opacity-50 ml-1">(edited)</span>
                  )}
                  <span className="block text-xs opacity-60 mt-1">
                    {msg.timestamp}
                  </span>
                </>
              )}
            </div>
            {!msg.isMe && !isDeleted && (
              <div className="relative order-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                  }}
                  className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
                {/* Popup Menu for other users */}
                <AnimatePresence>
                  {activeMenuId === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-8 w-24 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          console.log("Share message:", msg.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 transition-colors"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          setReplyTo(msg);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
                      >
                        Reply
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>,
      );
    });

    return elements;
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h3 className="font-semibold text-sm text-gray-800">
              {thread.title}
            </h3>
            <p className="text-xs text-gray-500">
              {thread.participants} Participants
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {/* New Message Button (when scrolled up) */}
      {showNewMessage && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full shadow-lg transition-colors"
        >
          New Message
        </motion.button>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200">
        {editingMessage && (
          <div className="flex items-center justify-between mb-2 px-2 py-1 bg-blue-50 rounded text-sm">
            <span className="text-blue-600">Editing message...</span>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {replyTo && (
          <div className="mb-2 bg-gray-100 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-200/50">
              <span className="text-sm font-medium text-gray-700">
                Replying to {replyTo.senderName}
              </span>
              <button
                onClick={cancelReply}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="px-3 py-2 text-sm text-gray-600 line-clamp-2">
              {replyTo.content}
            </p>
          </div>
        )}
        <div className="flex items-end gap-2">
          <AutoResizeTextarea
            value={newMessage}
            onChange={setNewMessage}
            onSend={handleSend}
            placeholder={
              editingMessage ? "Edit your message" : "Type a new message"
            }
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            {editingMessage ? "Save" : "Send"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-80 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold text-gray-800 mb-2">
                Delete Message
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this message?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    deleteConfirmId && handleDeleteConfirm(deleteConfirmId)
                  }
                  className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors  cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

