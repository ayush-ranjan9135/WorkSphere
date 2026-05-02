import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (name: string, email: string, password: string) =>
    api.post('/auth/signup', { name, email, password }),

  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.patch<User>('/auth/me', data),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectsApi = {
  list: () => api.get<Project[]>('/projects'),

  get: (projectId: string) => api.get<Project>(`/projects/${projectId}`),

  create: (name: string, description?: string) =>
    api.post<Project>('/projects', { name, description }),

  update: (projectId: string, data: { name?: string; description?: string }) =>
    api.patch<Project>(`/projects/${projectId}`, data),

  delete: (projectId: string) => api.delete(`/projects/${projectId}`),

  inviteMember: (projectId: string, email: string, role: 'admin' | 'member' = 'member') =>
    api.post(`/projects/${projectId}/members`, { email, role }),

  updateMemberRole: (projectId: string, userId: string, role: 'admin' | 'member') =>
    api.patch(`/projects/${projectId}/members/${userId}`, { role }),

  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),

  activity: (projectId: string) =>
    api.get<ActivityLog[]>(`/projects/${projectId}/activity`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (projectId: string, filters?: TaskFilters) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`, { params: filters }),

  get: (projectId: string, taskId: string) =>
    api.get<Task>(`/projects/${projectId}/tasks/${taskId}`),

  create: (projectId: string, data: CreateTaskPayload) =>
    api.post<Task>(`/projects/${projectId}/tasks`, data),

  update: (projectId: string, taskId: string, data: Partial<CreateTaskPayload>) =>
    api.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, data),

  delete: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),

  reorder: (projectId: string, tasks: ReorderPayload[]) =>
    api.post(`/projects/${projectId}/tasks/reorder`, { tasks }),
};

// ── Teams ────────────────────────────────────────────────────────────────────
export const teamsApi = {
  list: () => api.get<Team[]>('/teams'),
  create: (name: string, userIds?: string[]) => api.post<Team>('/teams', { name, userIds }),
  delete: (teamId: string) => api.delete(`/teams/${teamId}`),
  addMember: (teamId: string, userId: string) => api.post<Team>(`/teams/${teamId}/members`, { userId }),
  removeMember: (teamId: string, userId: string) => api.delete<Team>(`/teams/${teamId}/members/${userId}`),
  assignToProject: (teamId: string, projectId: string) => api.post(`/teams/${teamId}/assign`, { projectId }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard'),
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: string;
  assignee_name?: string;
  assignee_avatar?: string;
  created_by: string;
  deadline?: string;
  completed_at?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  members: { id: string; name: string; email: string }[];
}

export interface ActivityLog {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  action: string;
  meta?: Record<string, unknown>;
  created_at: string;
}

export interface DashboardData {
  stats: { total: number; todo: number; in_progress: number; done: number; overdue: number };
  overdue: Task[];
  assigned: Task[];
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignee_id?: string;
  search?: string;
  overdue?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: string;
  deadline?: string;
}

export interface ReorderPayload {
  id: string;
  position: number;
  status: 'todo' | 'in_progress' | 'done';
}
