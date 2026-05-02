import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, ProjectMember } from '../../lib/api';

export interface EditTaskPayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  deadline: string;
  assignee_id: string;
}

interface EditTaskDialogProps {
  open: boolean;
  task: Task | null;
  members: ProjectMember[];
  onClose: () => void;
  onSave: (taskId: string, payload: EditTaskPayload) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const priorities: EditTaskPayload['priority'][] = ['high', 'medium', 'low'];
const statuses: { label: string; value: EditTaskPayload['status'] }[] = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];
const priorityConfig: Record<EditTaskPayload['priority'], { dot: string; badge: string }> = {
  high:   { dot: 'bg-[#ffb4ab]', badge: 'text-[#ffb4ab] bg-[#ffb4ab]/10 border border-[#ffb4ab]/20' },
  medium: { dot: 'bg-orange-400', badge: 'text-orange-400 bg-orange-400/10 border border-orange-400/20' },
  low:    { dot: 'bg-blue-400',   badge: 'text-blue-400 bg-blue-400/10 border border-blue-400/20' },
};

export function EditTaskDialog({ open, task, members, onClose, onSave, onDelete }: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<EditTaskPayload['priority']>('medium');
  const [status, setStatus] = useState<EditTaskPayload['status']>('todo');
  const [deadline, setDeadline] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setStatus(task.status);
      setDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
      setAssigneeId(task.assignee_id ?? '');
      setConfirmDelete(false);
    }
  }, [task]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;
    setSaving(true);
    try {
      await onSave(task.id, { title, description, priority, status, deadline, assignee_id: assigneeId });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && task && (
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
            <div className="pointer-events-auto w-full max-w-lg bg-[#101417]/90 backdrop-blur-2xl border border-[#27282b] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#27282b]/60 flex-shrink-0">
                <h2 className="text-base font-semibold text-white">Edit Task</h2>
                <button onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#27282b] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full bg-transparent text-white text-xl font-semibold placeholder-gray-600 focus:outline-none" />

                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Add a description..." rows={2}
                    className="w-full bg-transparent text-sm text-gray-400 placeholder-gray-600 resize-none focus:outline-none leading-relaxed" />

                  <div className="border-t border-[#27282b]/60" />

                  {/* Assignee */}
                  {members.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Assign To</p>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        <button type="button" onClick={() => setAssigneeId('')}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border ${
                            !assigneeId ? 'border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-white' : 'border-transparent hover:bg-[#27282b] text-gray-400'
                          }`}>
                          <div className="w-7 h-7 rounded-full bg-[#27282b] flex items-center justify-center text-xs text-gray-500">—</div>
                          <span>Unassigned</span>
                        </button>
                        {members.map(m => (
                          <button key={m.id} type="button" onClick={() => setAssigneeId(m.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border ${
                              assigneeId === m.id ? 'border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-white' : 'border-transparent hover:bg-[#27282b] text-gray-300'
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
                              status === s.value ? 'text-[#5e6ad2] bg-[#5e6ad2]/10 border-[#5e6ad2]/30' : 'text-gray-500 bg-[#0e0f11] border-[#27282b] hover:border-[#454652]'
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
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#ffb4ab]">Sure?</span>
                      <button type="button" onClick={handleDelete} disabled={deleting}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg transition-colors">
                        {deleting ? 'Deleting…' : 'Yes, delete'}
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#27282b] rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                  <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-[#27282b] hover:bg-[#323539] rounded-lg transition-colors">
                      Cancel
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      type="submit" disabled={saving || !title.trim()}
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#5e6ad2] hover:bg-[#4854bb] disabled:opacity-40 rounded-lg transition-colors shadow-[0_0_20px_rgba(94,106,210,0.3)]">
                      {saving ? 'Saving…' : 'Save Changes'}
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
