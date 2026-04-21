"use client";

import { useEffect, useState } from "react";
import { BookOpenText, MessagesSquare, ZapIcon, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionButton } from "@/components/action-button";
import { Panel, PanelItem } from "@/components/panel";
import {
  fetchInbox,
  fetchTasks,
  createMessage,
  deleteMessage,
  updateTask,
  deleteTask,
  createTask,
} from "@/services/api";

type ViewState = "closed" | "menu" | "inbox" | "task";

export default function Home() {
  const [view, setView] = useState<ViewState>("closed");
  const [inboxItems, setInboxItems] = useState<PanelItem[]>([]);
  const [taskItems, setTaskItems] = useState<PanelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMenu = view === "menu";
  const isInbox = view === "inbox";
  const isTask = view === "task";

  // Load data when view changes
  useEffect(() => {
    if (isInbox && inboxItems.length === 0) {
      loadInbox();
    }
    if (isTask && taskItems.length === 0) {
      loadTasks();
    }
  }, [isInbox, isTask]);

  async function loadInbox() {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchInbox();
      setInboxItems(items);
    } catch (err) {
      setError("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchTasks();
      setTaskItems(items);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  // =================== CRUD: INBOX ===================
  async function handleCreateMessage() {
    try {
      const newPost = await createMessage(
        "New Message",
        "This is a new message created via API",
      );
      const newItem: PanelItem = {
        id: String(newPost.id),
        avatar: "ME",
        title: newPost.title,
        subtitle: "You:",
        date: new Date().toLocaleDateString(),
        description: newPost.body.slice(0, 100),
        unread: true,
      };
      setInboxItems((prev) => [newItem, ...prev]);
    } catch (err) {
      alert("Failed to create message");
    }
  }

  async function handleDeleteMessage(id: string) {
    try {
      await deleteMessage(Number(id));
      setInboxItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete message");
    }
  }

  // =================== CRUD: TASKS ===================
  async function handleCreateTask() {
    try {
      const newTodo = await createTask("New Task");
      const newItem: PanelItem = {
        id: String(newTodo.id),
        avatar: "○",
        title: newTodo.title,
        date: "Due today",
        description: "Task pending completion",
        unread: true,
      };
      setTaskItems((prev) => [newItem, ...prev]);
    } catch (err) {
      alert("Failed to create task");
    }
  }

  async function handleToggleTask(id: string, currentStatus: boolean) {
    try {
      await updateTask(Number(id), !currentStatus);
      setTaskItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                avatar: !currentStatus ? "✓" : "○",
                date: !currentStatus ? "Completed" : item.date,
                description: !currentStatus
                  ? "Task completed successfully"
                  : "Task pending completion",
                unread: currentStatus,
              }
            : item,
        ),
      );
    } catch (err) {
      alert("Failed to update task");
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      await deleteTask(Number(id));
      setTaskItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete task");
    }
  }

  const handleMainClick = () => {
    setView(view === "closed" ? "menu" : "closed");
  };

  return (
    <div className="flex flex-col flex-1 items-end justify-end p-6">
      <div className="flex flex-row items-end gap-4 relative">
        <AnimatePresence mode="wait">
          {(isMenu || isInbox) && (
            <ActionButton
              key={isMenu ? "task-menu" : "task-inactive"}
              variant="task"
              layoutId="task-btn"
              label={isMenu ? "Task" : undefined}
              icon={BookOpenText}
              onClick={() => setView("task")}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {(isMenu || isTask) && (
            <ActionButton
              key={isMenu ? "inbox-menu" : "inbox-inactive"}
              variant="inbox"
              layoutId="inbox-btn"
              label={isMenu ? "Inbox" : undefined}
              icon={MessagesSquare}
              onClick={() => setView("inbox")}
              delay={isMenu ? 0.05 : 0}
            />
          )}
        </AnimatePresence>

        <div className="relative flex flex-col items-center">
          {/* Panels - positioned absolute above buttons */}
          <AnimatePresence>
            {isInbox && (
              <Panel
                isOpen={isInbox}
                title="Inbox"
                icon={MessagesSquare}
                items={inboxItems}
                onClose={() => setView("menu")}
                onItemClick={handleDeleteMessage}
                searchPlaceholder="Search inbox..."
                loading={loading}
                error={error}
                onRefresh={loadInbox}
                onAdd={handleCreateMessage}
                addButtonLabel="New Message"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isTask && (
              <Panel
                isOpen={isTask}
                title="Tasks"
                icon={BookOpenText}
                items={taskItems}
                onClose={() => setView("menu")}
                onItemClick={(id) => {
                  const item = taskItems.find((t) => t.id === id);
                  handleToggleTask(id, item?.avatar === "✓");
                }}
                searchPlaceholder="Search tasks..."
                emptyMessage="No tasks pending"
                loading={loading}
                error={error}
                onRefresh={loadTasks}
                onAdd={handleCreateTask}
                addButtonLabel="New Task"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {(view === "closed" || isMenu) && (
              <ActionButton
                key="main-btn"
                variant="main"
                layoutId="main-btn"
                icon={ZapIcon}
                onClick={handleMainClick}
                iconFill="white"
              />
            )}

            {(isInbox || isTask) && (
              <motion.div
                key="main-shadow"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 0.9 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
                className="absolute right-3 bottom-0"
              >
                <ActionButton
                  variant="shadow"
                  icon={ZapIcon}
                  onClick={handleMainClick}
                  iconFill="white"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isInbox && (
              <div className="relative z-20">
                <ActionButton
                  key="inbox-active"
                  variant="active-inbox"
                  layoutId="inbox-btn"
                  label=" "
                  icon={MessagesSquare}
                  onClick={() => setView("menu")}
                />
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isTask && (
              <div className="relative z-20">
                <ActionButton
                  key="task-active"
                  variant="active-task"
                  layoutId="task-btn"
                  label=" "
                  icon={BookOpenText}
                  onClick={() => setView("menu")}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
