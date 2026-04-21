"use client";

import { useEffect, useState } from "react";
import { BookOpenText, MessagesSquare, ZapIcon, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionButton } from "@/components/action-button";
import { ChatPanel, type PanelItem } from "@/components/chat-panel";
import { PanelContainer } from "@/components/panel-container";
import { TaskPanel, type TaskItem } from "@/components/task-panel";
import { Chat, ChatThread } from "@/components/chat";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  fetchInbox,
  fetchTasks,
  createMessage,
  deleteMessage,
  updateTask,
  deleteTask,
  createTask,
  fetchThreadFromPost,
} from "@/services/api";

type ViewState = "closed" | "menu" | "inbox" | "task" | "chat";

export default function Home() {
  const [view, setView] = useState<ViewState>("closed");
  const [inboxItems, setInboxItems] = useState<PanelItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [activeChatHasNewMessages, setActiveChatHasNewMessages] =
    useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const isMenu = view === "menu";
  const isInbox = view === "inbox";
  const isTask = view === "task";
  const isChat = view === "chat";

  useEffect(() => {
    if (isInbox && inboxItems.length === 0) {
      loadInbox();
    }
    if (isTask && tasks.length === 0) {
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
      const todos = await fetchTasks();
      
      const taskItems: TaskItem[] = todos.map((item, index) => ({
        id: item.id,
        title: item.title,
        completed: index % 3 === 0, // Mix completed status
        dueDate: new Date(Date.now() + (index + 1) * 86400000)
          .toISOString()
          .split("T")[0],
        description: item.description || "No description provided from API.",
        tags: [], // Tags will be added by the user
      }));
      setTasks(taskItems);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMessage() {
    try {
      const newPost = await createMessage(
        "New Message",
        "This is a new message created via API",
      );
      const uniqueId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newItem: PanelItem = {
        id: uniqueId,
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

  async function handleInboxItemClick(id: string) {
    const item = inboxItems.find((i) => i.id === id);
    if (!item) return;

    const wasUnread: boolean = item.unread ?? false;
    const postId = Number(id);

    setChatLoading(true);
    setView("chat");

    try {
      const thread = await fetchThreadFromPost(postId);
      setActiveChat(thread);
      setActiveChatHasNewMessages(wasUnread);
    } catch (err) {
      console.error("Failed to load thread:", err);
      alert("Failed to load conversation. Please try again.");
      setView("inbox");
    } finally {
      setChatLoading(false);
    }

    if (wasUnread) {
      setInboxItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, unread: false } : i)),
      );
    }
  }

  async function handleDeleteInboxItem(id: string) {
    try {
      await deleteMessage(Number(id));
      setInboxItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete message");
    }
  }

  function handleBackFromChat() {
    setActiveChat(null);
    setView("inbox");
  }

  async function handleCreateTask() {
    try {
      const newTodo = await createTask("");
      const uniqueId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTask: TaskItem = {
        id: uniqueId,
        title: "",
        completed: false,
        dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        description: "",
      };
      setTasks((prev: TaskItem[]) => [...prev, newTask]);
    } catch (err) {
      alert("Failed to create task");
    }
  }

  async function handleToggleTask(id: string, completed: boolean) {
    try {
      await updateTask(Number(id), completed);
      setTasks((prev: TaskItem[]) =>
        prev.map((task: TaskItem) =>
          task.id === id ? { ...task, completed } : task,
        ),
      );
    } catch (err) {
      alert("Failed to update task");
    }
  }

  function handleUpdateTaskDate(id: string, date: string) {
    setTasks((prev: TaskItem[]) =>
      prev.map((task: TaskItem) =>
        task.id === id ? { ...task, dueDate: date } : task,
      ),
    );
  }

  function handleUpdateTaskDescription(id: string, description: string) {
    setTasks((prev: TaskItem[]) =>
      prev.map((task: TaskItem) =>
        task.id === id ? { ...task, description } : task,
      ),
    );
  }

  function handleUpdateTaskTitle(id: string, title: string) {
    setTasks((prev: TaskItem[]) =>
      prev.map((task: TaskItem) =>
        task.id === id ? { ...task, title } : task,
      ),
    );
  }

  function handleUpdateTaskTags(id: string, tags: TaskItem["tags"]) {
    setTasks((prev: TaskItem[]) =>
      prev.map((task: TaskItem) =>
        task.id === id ? { ...task, tags } : task,
      ),
    );
  }

  async function handleDeleteTask(id: string) {
    try {
      await deleteTask(Number(id));
      setTasks((prev: TaskItem[]) =>
        prev.filter((task: TaskItem) => task.id !== id),
      );
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
          {(isMenu || isInbox || isChat) && (
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
              onClick={() => (isChat ? setView("chat") : setView("inbox"))}
              delay={isMenu ? 0.05 : 0}
            />
          )}
        </AnimatePresence>

        <div className="relative flex flex-col items-center">
          {/* Single Panel Container with dynamic children */}
          <PanelContainer
            isOpen={isInbox || isTask || isChat}
            onClose={() => setView("menu")}
          >
            {isInbox && (
              <ChatPanel
                title="Inbox"
                icon={MessagesSquare}
                items={inboxItems}
                onClose={() => setView("menu")}
                onItemClick={handleInboxItemClick}
                searchPlaceholder="Search inbox..."
                loading={loading}
                error={error}
                onRefresh={loadInbox}
                onAdd={handleCreateMessage}
                addButtonLabel="New Message"
              />
            )}
            {isChat && (
              <>
                {chatLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <LoadingIndicator message="Loading Chats ..." />
                  </div>
                ) : activeChat ? (
                  <Chat
                    thread={activeChat}
                    hasNewMessages={activeChatHasNewMessages}
                    onBack={handleBackFromChat}
                    onClose={() => setView("closed")}
                  />
                ) : null}
              </>
            )}
            {isTask && (
              <TaskPanel
              items={tasks}
              loading={loading}
              onClose={() => setView("menu")}
              onToggle={handleToggleTask}
              onAdd={handleCreateTask}
              onUpdateDate={handleUpdateTaskDate}
               onUpdateDescription={handleUpdateTaskDescription}
               onUpdateTitle={handleUpdateTaskTitle}
               onUpdateTags={handleUpdateTaskTags}
               onDelete={handleDeleteTask}
             />
            )}
          </PanelContainer>

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
            {(isInbox || isChat) && (
              <div className="relative z-20">
                <ActionButton
                  key="inbox-active"
                  variant="active-inbox"
                  layoutId="inbox-btn"
                  label=" "
                  icon={MessagesSquare}
                  onClick={() =>
                    isChat ? handleBackFromChat() : setView("menu")
                  }
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
