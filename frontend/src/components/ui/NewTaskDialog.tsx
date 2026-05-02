import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../../lib/api';

export interface NewTaskPayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  deadline: string;
  assigneeId: string;
  projectId: string;
}

interface NewTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onSubmit: (payload: NewTaskPayload) => void;
}

const priorities: NewTaskPayload['priority'][] = ['high', 'medium', 'low'];
const statuses: { label: string; value: NewTaskPayload['status'] }[] = [
  { label: 'To Do',       value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done',        value: 'done' },
];

const priorityConfig: Record<NewTaskPayload['priority'], { dot: string; badge: string }> = {
  high:   { dot: 'bg-[#ffb4ab]', badge: 'text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/20' },
  medium: { dot: 'bg-orange-400', badge: 'text-orange-400 bg-orange-400/10 border border-orange-400/20' },
  low:    { dot: 'bg-blue-400',   badge: 'text-blue-400 bg-blue-400/10 border border-blue-400/20' },
};

export function NewTaskDialog({ open, onClose, projects, onSubmit }: NewTaskDialogProps) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]     = useState<NewTaskPayload['priority']>('medium');
  const [status, setStatus]         = useState<NewTaskPayload['status']>('todo');
  const [deadline, setDeadline]     = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [projectId, setProjectId]   = useState('');

  // Set default project when projects load
  useEffect(() => {
    if (projects.length > 0 && !projectId) setProjectId(projects[0].id);
  }, [projects, projectId]);

  // Set default assignee from selected project members
  const selectedProject = projects.find(p => p.id === projectId);
  const members = selectedProject?.members ?? [];

  useEffect(() => {
    if (members.length > 0 && !assigneeId) setAssigneeId(members[0].id);
  }, [members, assigneeId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    onSubmit({ title, description, priority, status, deadline, assigneeId, projectId });
    setTitle(''); setDescription(''); setPriority('medium');
    setStatus('todo'); setDeadline(''); setAssigneeId('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

          <motion.div key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-lg bg-[#101417]/80 backdrop-blur-2xl border border-[#27282b] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#27282b]/60 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#5e6ad2]/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#5e6ad2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-white">New Task</h2>
                </div>
                <button onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#27282b] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

                  <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full bg-transparent text-white text-xl font-semibold placeholder-gray-600 focus:outline-none" />

                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Add a description (optional)..." rows={2}
                    className="w-full bg-transparent text-sm text-gray-400 placeholder-gray-600 resize-none focus:outline-none leading-relaxed" />

                  <div className="border-t border-[#27282b]/60" />

                  {/* Project */}
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Project</p>
                    <select value={projectId} onChange={e => { setProjectId(e.target.value); setAssigneeId(''); }}
                      className="w-full px-3 py-1.5 bg-[#0e0f11] border border-[#27282b] hover:border-[#454652] rounded-md text-xs text-gray-300 focus:outline-none focus:border-[#5e6ad2] transition-colors [color-scheme:dark]">
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  {/* Assign To */}
                  {members.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Assign To</p>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {members.map(m => (
                          <button key={m.id} type="button" onClick={() => setAssigneeId(m.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border ${
                              assigneeId === m.id
                                ? 'border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-white'
                                : 'border-transparent hover:bg-[#27282b] text-gray-300'
                            }`}>
                            <div className="w-7 h-7 rounded-full bg-[#5e6ad2] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              {m.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="text-left min-w-0">
                              <p className="font-medium truncate">{m.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{m.email}</p>
                            </div>
                            {assigneeId === m.id && (
                              <svg className="w-4 h-4 text-[#5e6ad2] ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#27282b]/60" />

                  {/* Priority + Status */}
                  <div className="flex flex-wrap gap-5">
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Priority</p>
                      <div className="flex gap-2">
                        {priorities.map(p => (
                          <button key={p} type="button" onClick={() => setPriority(p)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                              priority === p ? priorityConfig[p].badge : 'text-gray-500 bg-[#0e0f11] border border-[#27282b] hover:border-[#454652]'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priority === p ? priorityConfig[p].dot : 'bg-gray-600'}`} />
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Status</p>
                      <div className="flex gap-2">
                        {statuses.map(s => (
                          <button key={s.value} type="button" onClick={() => setStatus(s.value)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                              status === s.value
                                ? 'text-[#5e6ad2] bg-[#5e6ad2]/10 border-[#5e6ad2]/30'
                                : 'text-gray-500 bg-[#0e0f11] border-[#27282b] hover:border-[#454652]'
                            }`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Due Date</p>
                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                      className="px-3 py-1.5 bg-[#0e0f11] border border-[#27282b] hover:border-[#454652] rounded-md text-xs text-gray-300 focus:outline-none focus:border-[#5e6ad2] transition-colors [color-scheme:dark]" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#27282b]/60 bg-[#0e0f11]/40 flex-shrink-0">
                  <p className="text-xs text-gray-600">
                    <kbd className="font-mono bg-[#27282b] px-1 py-0.5 rounded text-gray-400">Esc</kbd> to cancel
                  </p>
                  <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-[#27282b] hover:bg-[#323539] rounded-lg transition-colors">
                      Cancel
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      type="submit" disabled={!title.trim() || !projectId}
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#5e6ad2] hover:bg-[#4854bb] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-[0_0_20px_rgba(94,106,210,0.3)]">
                      Create Task
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
