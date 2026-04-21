// JSONPlaceholder API Service
// Free fake REST API - https://jsonplaceholder.typicode.com/

import { PanelItem } from "@/components/panel";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// Types matching JSONPlaceholder schema
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export type { PanelItem };

// Chat types matching chat.tsx
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

// JSONPlaceholder Comment type
interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

// =================== INBOX (Posts as Messages) ===================

export async function fetchInbox(): Promise<PanelItem[]> {
  const [posts, users] = await Promise.all([
    fetch(`${BASE_URL}/posts?_limit=5`).then<Post[]>((r) => r.json()),
    fetch(`${BASE_URL}/users?_limit=5`).then<User[]>((r) => r.json()),
  ]);

  return posts.map((post, index) => {
    const user =
      users.find((u) => u.id === post.userId) || users[index % users.length];
    const initials =
      user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2) || "U";

    const item: PanelItem = {
      id: String(post.id),
      avatar: initials,
      title: post.title.slice(0, 50),
      subtitle: `${user?.name || "Unknown"}:`,
      date: new Date(Date.now() - index * 86400000).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      description: post.body.slice(0, 100),
      unread: index < 2, // First 2 are unread
    };
    return item;
  });
}

export async function createMessage(
  title: string,
  body: string,
): Promise<Post> {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      title,
      body,
      userId: 1,
    }),
  });
  return response.json(); // Returns created object with id: 101
}

export async function updateMessage(
  id: number,
  updates: Partial<Post>,
): Promise<Post> {
  const response = await fetch(`${BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(updates),
  });
  return response.json();
}

export async function deleteMessage(id: number): Promise<void> {
  await fetch(`${BASE_URL}/posts/${id}`, { method: "DELETE" });
}

// =================== TASKS (Todos) ===================

export async function fetchTasks(): Promise<PanelItem[]> {
  const todos = await fetch(`${BASE_URL}/todos?_limit=5`).then<Todo[]>((r) =>
    r.json(),
  );

  return todos.map((todo, index) => {
    const item: PanelItem = {
      id: String(todo.id),
      avatar: todo.completed ? "✓" : "○",
      title: todo.title.slice(0, 50),
      date: todo.completed
        ? "Completed"
        : `Due ${index + 1} day${index === 0 ? "" : "s"}`,
      description: todo.completed
        ? "Task completed successfully"
        : "Task pending completion",
      unread: !todo.completed,
    };
    return item;
  });
}

export async function createTask(title: string): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      title,
      completed: false,
      userId: 1,
    }),
  });
  return response.json(); // Returns created object with id: 201
}

export async function updateTask(
  id: number,
  completed: boolean,
): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ completed }),
  });
  return response.json();
}

export async function deleteTask(id: number): Promise<void> {
  await fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" });
}

// =================== CHAT THREADS (Comments as Messages) ===================

const senderColors: ("purple" | "orange" | "teal")[] = [
  "purple",
  "orange",
  "teal",
];

/**
 * Fetches a post and its comments from JSONPlaceholder to create a chat thread.
 * Uses the post as the thread title and comments as messages.
 */
export async function fetchThreadFromPost(
  postId: number,
  currentUserId: number = 1,
): Promise<ChatThread> {
  const [post, comments, users] = await Promise.all([
    fetch(`${BASE_URL}/posts/${postId}`).then<Post>((r) => r.json()),
    fetch(`${BASE_URL}/posts/${postId}/comments`).then<Comment[]>((r) =>
      r.json(),
    ),
    fetch(`${BASE_URL}/users`).then<User[]>((r) => r.json()),
  ]);

  // Create a map of users by email (comments use email, not userId)
  const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

  // Map comments to messages
  const messages: ChatMessage[] = comments.slice(0, 6).map((comment, index) => {
    const user = userByEmail.get(comment.email.toLowerCase());
    const isMe = user?.id === currentUserId;

    // Assign colors based on sender
    const senderKey = comment.email.split("@")[0] || "unknown";
    const colorIndex = senderKey.charCodeAt(0) % senderColors.length;
    const senderColor = senderColors[colorIndex];

    // Generate timestamp (comments don't have dates, so we simulate)
    const hours = 19 + Math.floor(index / 2);
    const mins = 30 + (index % 2) * 2;
    const timestamp = `${hours}:${mins.toString().padStart(2, "0")}`;

    return {
      id: String(comment.id),
      sender: senderKey,
      senderName: user?.name || comment.name.split("@")[0] || "Unknown",
      senderColor,
      content: comment.body,
      timestamp,
      isMe,
    };
  });

  // If no comments, create a default message
  if (messages.length === 0) {
    messages.push({
      id: "1",
      sender: "system",
      senderName: "System",
      senderColor: "teal",
      content: "No messages in this thread yet.",
      timestamp: "19:32",
      isMe: false,
    });
  }

  // Get unique participants
  const uniqueSenders = new Set(messages.map((m) => m.sender));

  return {
    id: String(post.id),
    title: post.title,
    participants: uniqueSenders.size,
    messages,
  };
}

/**
 * Alternative: Generate a thread from mock data (kept for fallback)
 */
export function generateMockThread(itemTitle: string): ChatThread {
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: itemTitle,
    participants: 3,
    messages: [
      {
        id: "1",
        sender: "mary",
        senderName: "Mary Hilda",
        senderColor: "orange",
        content: "Just Fill me in for his updates yea?",
        timestamp: "19:32",
        isMe: false,
      },
      {
        id: "2",
        sender: "me",
        senderName: "You",
        senderColor: "purple",
        content:
          "No worries. It will be completed ASAP. I've asked him yesterday.",
        timestamp: "19:32",
        isMe: true,
      },
      {
        id: "3",
        sender: "mary",
        senderName: "Mary Hilda",
        senderColor: "orange",
        content:
          "Hello Obaidullah, I will be your case advisor for case #029290. I have assigned some homework for you to fill. Please keep up with the due dates. Should you have any questions, you can message me anytime. Thanks.",
        timestamp: "19:32",
        isMe: false,
      },
      {
        id: "4",
        sender: "me",
        senderName: "You",
        senderColor: "purple",
        content:
          "Please contact Mary for questions regarding the case bcs she will be managing your forms from now on! Thanks Mary.",
        timestamp: "19:32",
        isMe: true,
      },
      {
        id: "5",
        sender: "mary",
        senderName: "Mary Hilda",
        senderColor: "orange",
        content: "Sure thing. Claren.",
        timestamp: "19:32",
        isMe: false,
      },
      {
        id: "6",
        sender: "obaidullah",
        senderName: "Obaidullah Amarkhil",
        senderColor: "teal",
        content: "Morning. I'll try to do them. Thanks.",
        timestamp: "19:32",
        isMe: false,
      },
    ],
  };
}
