import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay, useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { NewTaskDialog } from '../components/ui/NewTaskDialog';
import { EditTaskDialog } from '../components/ui/EditTaskDialog';
import { projectsApi, type Project, type Task, type ProjectMember } from '../lib/api';
import { useTasks } from '../context/TaskContext';

const COLUMNS: { label: string; value: Task['status']; emoji: string; color: string; gradient: string }[] = [
  { label: 'To Do',       value: 'todo',        emoji: '📋', color: 'text-[#6c63ff]',  gradient: 'from-[#6c63ff]/10' },
  { label: 'In Progress', value: 'in_progress', emoji: '🔄', color: 'text-[#fbbf24]',  gradient: 'from-[#fbbf24]/10' },
  { label: 'Done',        value: 'done',        emoji: '✅', color: 'text-[#06d6a0]',  gradient: 'from-[#06d6a0]/10' },
];

const priorityColors: Record<string, string> = {
  high:   'bg-[#ff6b6b]/10 text-[#ff6b6b] border border-[#ff6b6b]/20',
  medium: 'bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20',
  low:    'bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20',
};

const priorityEmojis: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🔵',
};

function SortableTaskItem({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id, data: { ...task },
  });

  const isDone = task.status === 'done';
  const completedAt = task.completed_at ? new Date(task.completed_at) : null;
  const expiresIn = completedAt ? Math.max(0, 24 - (Date.now() - completedAt.getTime()) / 3600000) : null;

  return (
    <motion.div 
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="group relative p-4 bg-[#141720]/80 border border-white/[0.04] rounded-xl task-card backdrop-blur-sm"
    >
      {/* drag handle area */}
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab touch-none rounded-xl" />
      <div className="relative pointer-events-none">
        <div className="flex justify-between items-start mb-2.5">
          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1 ${priorityColors[task.priority]}`}>
            <span>{priorityEmojis[task.priority]}</span> {task.priority}
          </span>
          <span className="text-[11px] text-gray-600">{task.created_at.slice(0, 10)}</span>
        </div>
        <h4 className="text-sm font-semibold text-white mb-3 leading-relaxed">{task.title}</h4>
        {isDone && expiresIn !== null && (
          <p className="text-[10px] text-[#fbbf24]/70 mb-2 flex items-center gap-1">
            <span>⏰</span> Auto-deletes in {expiresIn.toFixed(1)}h
          </p>
        )}
        <div className="flex justify-between items-center mt-2">
          <div className="flex -space-x-2">
            {task.assignee_name && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] border-2 border-[#141720] flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                {task.assignee_name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {task.deadline && (
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <span>📅</span> {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      {/* edit button */}
      <button
        onClick={e => { e.stopPropagation(); onEdit(task); }}
        className="pointer-events-auto absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#6c63ff]/20 text-gray-500 hover:text-white transition-all z-10 backdrop-blur-sm border border-white/[0.04]">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
        </svg>
      </button>
    </motion.div>
  );
}

function Column({ col, tasks, onEdit }: { col: typeof COLUMNS[0]; tasks: Task[]; onEdit: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.value, data: { type: 'Column' } });
  return (
    <motion.div 
      layout
      className={`w-80 flex-shrink-0 flex flex-col bg-[#0f1115]/80 border rounded-2xl backdrop-blur-sm transition-all duration-200 ${
        isOver ? 'border-[#6c63ff]/30 shadow-[0_0_30px_rgba(108,99,255,0.1)]' : 'border-white/[0.04]'
      }`}
    >
      <div className={`p-4 border-b border-white/[0.04] flex justify-between items-center bg-gradient-to-r ${col.gradient} to-transparent rounded-t-2xl`}>
        <h3 className="font-bold text-white flex items-center gap-2 text-sm">
          <span className="text-base">{col.emoji}</span> {col.label}
        </h3>
        <span className="text-[11px] bg-white/5 text-gray-400 px-2.5 py-1 rounded-lg font-semibold border border-white/[0.04]">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map(task => <SortableTaskItem key={task.id} task={task} onEdit={onEdit} />)}
          </AnimatePresence>
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-2xl mb-2">{col.value === 'todo' ? '📝' : col.value === 'in_progress' ? '⏳' : '🎉'}</p>
            <p className="text-xs text-gray-600">
              {col.value === 'done' ? 'Completed tasks show here!' : 'Drop tasks here'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Kanban() {
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    const { data } = await projectsApi.list();
    setProjects(data);
    if (data.length > 0 && !activeProjectId) {
      setActiveProjectId(data[0].id);
      fetchTasks(data[0].id);
      const { data: proj } = await projectsApi.get(data[0].id);
      setProjectMembers(proj.members ?? []);
    }
  }, [activeProjectId, fetchTasks]);

  const switchProject = useCallback(async (id: string) => {
    setActiveProjectId(id);
    fetchTasks(id);
    const { data: proj } = await projectsApi.get(id);
    setProjectMembers(proj.members ?? []);
  }, [fetchTasks]);

  useEffect(() => {
    loadProjects().catch(() => toast.error('Failed to load projects. 😕'));
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const { data } = await projectsApi.create(newProjectName.trim());
      setProjects(prev => [...prev, data]);
      switchProject(data.id);
      setNewProjectName('');
      setProjectDialogOpen(false);
      toast.success(`Project "${data.name}" created! 🎉`);
    } catch {
      toast.error('Failed to create project. 😕');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleEditSave = async (taskId: string, payload: any) => {
    try {
      await updateTask(activeProjectId, taskId, {
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        status: payload.status,
        assignee_id: payload.assignee_id || null,
        deadline: payload.deadline || null,
      });
      toast.success('Task updated! ✅');
    } catch {
      toast.error('Failed to update task. 😕');
      throw new Error();
    }
  };

  const handleEditDelete = async (taskId: string) => {
    try {
      await deleteTask(activeProjectId, taskId);
      toast.success('Task deleted. 🗑️');
    } catch {
      toast.error('Failed to delete task. 😕');
      throw new Error();
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveTask(tasks.find(t => t.id === event.active.id) ?? null);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isOverTask   = over.data.current?.title !== undefined;
    const isOverColumn = over.data.current?.type === 'Column';
    const activeIdx    = tasks.findIndex(t => t.id === active.id);

    if (isOverTask) {
      const overIdx = tasks.findIndex(t => t.id === over.id);
      const updated = [...tasks];
      if (updated[activeIdx].status !== updated[overIdx].status)
        updated[activeIdx] = { ...updated[activeIdx], status: updated[overIdx].status };
    }
    if (isOverColumn) {
      const updated = [...tasks];
      updated[activeIdx] = { ...updated[activeIdx], status: over.id as Task['status'] };
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !activeProjectId) return;

    const activeIdx = tasks.findIndex(t => t.id === active.id);
    const overStatus: Task['status'] = over.data.current?.type === 'Column'
      ? over.id
      : (tasks.find(t => t.id === over.id)?.status ?? tasks[activeIdx].status);

    const reordered = tasks.map((t, i) => ({
      id: t.id,
      position: i,
      status: t.id === active.id ? overStatus : t.status,
    }));

    try {
      await reorderTasks(activeProjectId, reordered);
      await fetchTasks(activeProjectId);
      toast.success('Task moved! 🎯');
    } catch {
      toast.error('Failed to update task order. 😕');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-8 relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6c63ff] opacity-[0.015] blur-[100px] rounded-full pointer-events-none" />

      <header className="mb-6 flex justify-between items-center relative">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="text-xl">🎯</span> Project Tasks
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Manage your team's workload. Drag & drop to organize. ✨</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <select value={activeProjectId}
              onChange={e => switchProject(e.target.value)}
              className="px-3 py-2.5 bg-[#0f1115] border border-white/[0.06] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#6c63ff]/50 [color-scheme:dark] transition-colors">
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <Button variant="secondary" onClick={() => setProjectDialogOpen(true)} className="rounded-xl border-white/[0.06]">
            📁 New Project
          </Button>
          {activeProjectId && (
            <Button variant="primary" onClick={() => setDialogOpen(true)} className="rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] shadow-[0_0_20px_rgba(108,99,255,0.2)]">
              ✨ New Task
            </Button>
          )}
        </div>
      </header>

      {/* Create Project Dialog */}
      <AnimatePresence>
        {projectDialogOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" 
            onClick={() => setProjectDialogOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card rounded-3xl p-7 w-full max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6c63ff] to-transparent" />
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span>📁</span> Create Project
              </h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <input autoFocus type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-colors input-glow" />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setProjectDialogOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-400 hover:text-white bg-white/5 rounded-xl transition-colors border border-white/[0.04]">Cancel</button>
                  <button type="submit" disabled={creatingProject || !newProjectName.trim()}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] disabled:opacity-50 rounded-xl transition-colors shadow-[0_0_20px_rgba(108,99,255,0.2)]">
                    {creatingProject ? '⏳ Creating…' : '🚀 Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-80 h-64 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start">
          <DndContext sensors={sensors} collisionDetection={closestCorners}
            onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            {COLUMNS.map(col => (
              <Column key={col.value} col={col} tasks={tasks.filter(t => t.status === col.value)} onEdit={setEditTask} />
            ))}
            <DragOverlay>
              {activeTask && (
                <div className="p-4 bg-[#141720] border-2 border-[#6c63ff] rounded-xl shadow-[0_16px_48px_rgba(108,99,255,0.2)] cursor-grabbing scale-105 w-80 backdrop-blur-sm">
                  <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg flex items-center gap-1 w-fit ${priorityColors[activeTask.priority]}`}>
                    {priorityEmojis[activeTask.priority]} {activeTask.priority}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-2.5">{activeTask.title}</h4>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        projects={projects}
        onSubmit={async (payload) => {
          if (!activeProjectId) return;
          try {
            await addTask(activeProjectId, {
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
              status: payload.status,
              assignee_id: payload.assigneeId,
              deadline: payload.deadline,
            });
            toast.success(`"${payload.title}" created! ✨`);
          } catch {
            toast.error('Failed to create task. 😕');
          }
        }}
      />

      <EditTaskDialog
        open={!!editTask}
        task={editTask}
        members={projectMembers}
        onClose={() => setEditTask(null)}
        onSave={handleEditSave}
        onDelete={handleEditDelete}
      />
    </div>
  );
}
