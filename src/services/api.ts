import { PanelItem } from "@/components/chat-panel";

const BASE_URL = "https://jsonplaceholder.typicode.com";

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

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  senderColor: "purple" | "orange" | "teal" | "blue";
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
    fetch(`${BASE_URL}/posts?_limit=4`).then<Post[]>((r) => r.json()),
    fetch(`${BASE_URL}/users?_limit=5`).then<User[]>((r) => r.json()),
  ]);

  const items: PanelItem[] = posts.map((post, index) => {
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
      unread: index < 2, 
    };
    return item;
  });

  items.unshift({
    id: "999",
    avatar: "F",
    title: "Fast Visa Support",
    subtitle: "Hey there! How can we help you today?",
    date: "02/06/2021 10:45",
    description: "Hey there! How can we help you today?",
    unread: false,
  });

  return items;
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
  return response.json(); 
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
  return response.json(); 
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

export async function fetchThreadFromPost(
  postId: number,
  currentUserId: number = 1,
): Promise<ChatThread> {
  if (postId === 999) {
    return {
      id: "999",
      title: "Fast Visa Support",
      participants: 1,
      messages: [
        {
          id: "fv-1",
          sender: "fast-visa",
          senderName: "FastVisa Support",
          senderColor: "blue",
          content: "Hey there. Welcome to your inbox! Contact us for more information and help about anything! We'll send you a response as soon as possible.",
          timestamp: "19:32",
          isMe: false,
        }
      ]
    };
  }

  const [post, comments, users] = await Promise.all([
    fetch(`${BASE_URL}/posts/${postId}`).then<Post>((r) => r.json()),
    fetch(`${BASE_URL}/posts/${postId}/comments`).then<Comment[]>((r) =>
      r.json(),
    ),
    fetch(`${BASE_URL}/users`).then<User[]>((r) => r.json()),
  ]);

  const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

    const messages: ChatMessage[] = comments.slice(0, 6).map((comment, index) => {
      const isMe = index === 1 || index === 3 || index === 5;

      const senderKey = isMe ? "me" : (comment.email.split("@")[0] || "unknown");
      const colorIndex = isMe ? 0 : (senderKey.charCodeAt(0) % senderColors.length);
      const senderColor = senderColors[colorIndex];

      const hours = 19 + Math.floor(index / 2);
      const mins = 32 + (index % 2) * 2;
      const timestamp = `${hours}:${mins.toString().padStart(2, "0")}`;

      let senderName = isMe ? "You" : (userByEmail.get(comment.email.toLowerCase())?.name || comment.name.split(" ")[0] || "Unknown");

      return {
        id: String(comment.id),
        sender: senderKey,
        senderName,
        senderColor,
        content: comment.body,
        timestamp,
        isMe,
      };
    });

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

  const uniqueSenders = new Set(messages.map((m) => m.sender));

  return {
    id: String(post.id),
    title: post.title,
    participants: uniqueSenders.size,
    messages,
  };
}
