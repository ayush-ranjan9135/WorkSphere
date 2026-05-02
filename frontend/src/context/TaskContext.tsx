import { createContext, useContext, useState, useCallback } from 'react';
import { tasksApi, type Task, type CreateTaskPayload, type ReorderPayload } from '../lib/api';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  fetchTasks: (projectId: string) => Promise<void>;
  addTask: (projectId: string, data: CreateTaskPayload) => Promise<Task>;
  updateTask: (projectId: string, taskId: string, data: Partial<CreateTaskPayload>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  reorderTasks: (projectId: string, tasks: ReorderPayload[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const { data } = await tasksApi.list(projectId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (projectId: string, payload: CreateTaskPayload) => {
    const { data: task } = await tasksApi.create(projectId, payload);
    setTasks(prev => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (projectId: string, taskId: string, changes: Partial<CreateTaskPayload>) => {
    const { data: updated } = await tasksApi.update(projectId, taskId, changes);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  }, []);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    await tasksApi.delete(projectId, taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const reorderTasks = useCallback(async (projectId: string, reordered: ReorderPayload[]) => {
    await tasksApi.reorder(projectId, reordered);
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, addTask, updateTask, deleteTask, reorderTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}

export type { Task, CreateTaskPayload, ReorderPayload };
