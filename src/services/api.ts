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
      date: new Date(Date.now() - index * 86400000).toLocaleDateString(),
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
