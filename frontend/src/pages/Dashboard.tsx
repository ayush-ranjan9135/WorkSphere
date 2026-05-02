import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { NewTaskDialog } from '../components/ui/NewTaskDialog';
import { dashboardApi, projectsApi, type DashboardData, type ActivityLog, type Project } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { formatDistanceToNow } from '../lib/utils';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const priorityColor: Record<string, string> = {
  high:   'text-[#ff6b6b] bg-[#ff6b6b]/10 border border-[#ff6b6b]/20',
  medium: 'text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20',
  low:    'text-[#6c63ff] bg-[#6c63ff]/10 border border-[#6c63ff]/20',
};

const priorityEmoji: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🔵',
};

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  if (hour < 21) return { text: 'Good evening', emoji: '🌆' };
  return { text: 'Good night', emoji: '🌙' };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { addTask } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.get(),
      projectsApi.list(),
    ]).then(([dash, proj]) => {
      setData(dash.data);
      setProjects(proj.data);
      // Fetch activity for first project if available
      if (proj.data.length > 0) {
        projectsApi.activity(proj.data[0].id).then(r => setActivity(r.data)).catch(() => {});
      }
    }).catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const greeting = getGreeting();

  const stats = data ? [
    { label: 'Total Tasks',  value: data.stats.total,       delta: `${data.stats.todo} to do`,        color: 'text-white', emoji: '📋', gradient: 'from-[#6c63ff]/10 to-transparent', borderColor: 'border-[#6c63ff]/10' },
    { label: 'In Progress',  value: data.stats.in_progress, delta: 'Active tasks',                    color: 'text-[#fbbf24]', emoji: '🔄', gradient: 'from-[#fbbf24]/10 to-transparent', borderColor: 'border-[#fbbf24]/10' },
    { label: 'Overdue',      value: data.stats.overdue,     delta: 'Needs attention',                 color: 'text-[#ff6b6b]', emoji: '⚠️', gradient: 'from-[#ff6b6b]/10 to-transparent', borderColor: 'border-[#ff6b6b]/10' },
    { label: 'Completed',    value: data.stats.done,        delta: `${Math.round((+data.stats.done / (+data.stats.total || 1)) * 100)}% completion`, color: 'text-[#06d6a0]', emoji: '✅', gradient: 'from-[#06d6a0]/10 to-transparent', borderColor: 'border-[#06d6a0]/10' },
  ] : [];

  return (
    <motion.div className="flex-1 overflow-auto p-6 md:p-8 bg-[#0a0b0e] relative"
      variants={containerVariants} initial="hidden" animate="show">

      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6c63ff] opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#06d6a0] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 flex items-center justify-between relative">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            {greeting.text}{user ? `, ${user.name.split(' ')[0]}` : ''} <span className="text-2xl animate-float">{greeting.emoji}</span>
          </h2>
          <p className="text-gray-400 mt-1.5 text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
            Here's what's happening with your projects today.
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(108,99,255,0.4)' }} whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:from-[#5b52f0] hover:to-[#4338ca] text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(108,99,255,0.2)] flex items-center gap-2"
          onClick={() => setDialogOpen(true)}>
          <span className="text-base">✨</span> New Task
        </motion.button>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <SpotlightCard className={`p-5 h-full stat-card bg-gradient-to-br ${stat.gradient} ${stat.borderColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">{stat.label}</p>
                  <span className="text-lg">{stat.emoji}</span>
                </div>
                <p className={`text-4xl font-black ${stat.color} mb-1.5 tracking-tight`}>{stat.value}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  {stat.delta}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Quick Actions Bar */}
      <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3 overflow-x-auto pb-2">
        {[
          { emoji: '🎯', label: 'Kanban Board', href: '/projects' },
          { emoji: '👥', label: 'Team', href: '/team' },
          { emoji: '👤', label: 'Profile', href: '/profile' },
        ].map((action) => (
          <a key={action.label} href={action.href}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-gray-400 hover:text-white hover:border-[#6c63ff]/20 hover:bg-[#6c63ff]/[0.04] transition-all whitespace-nowrap group">
            <span className="group-hover:scale-110 transition-transform">{action.emoji}</span>
            {action.label}
            <svg className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </a>
        ))}
      </motion.div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Assigned Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📌</span> Recently Assigned
            </h3>
            <a href="/projects" className="text-xs text-[#6c63ff] hover:text-[#8b83ff] transition-colors flex items-center gap-1 font-medium">
              View all <span>→</span>
            </a>
          </div>
          <div className="bg-[#0f1115]/80 border border-white/[0.04] rounded-2xl overflow-hidden backdrop-blur-sm">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton-shimmer" />)
            ) : data?.assigned.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-sm text-gray-500">No tasks assigned yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {data?.assigned.map((task, i) => (
                  <motion.div key={task.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6c63ff]/10 flex items-center justify-center text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {priorityEmoji[task.priority] || '📋'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{task.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                          <span>📁</span> {(task as any).project_name ?? task.project_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg ${priorityColor[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.deadline && (
                        <span className="text-xs text-gray-600 hidden sm:flex items-center gap-1">
                          <span>📅</span> {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={itemVariants}>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Activity
          </h3>
          <div className="bg-[#0f1115]/80 border border-white/[0.04] rounded-2xl p-5 backdrop-blur-sm">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-12 skeleton-shimmer rounded-lg mb-3" />)
            ) : activity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-500">No recent activity.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activity.slice(0, 5).map((item, i) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex gap-3 items-start group"
                  >
                    <div className="mt-1 w-8 h-8 rounded-lg bg-[#6c63ff]/10 flex items-center justify-center text-xs flex-shrink-0">
                      {item.action.includes('create') ? '🆕' : item.action.includes('update') ? '✏️' : item.action.includes('delete') ? '🗑️' : '📋'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-300">
                        <span className="text-white font-semibold">{item.user_name}</span>{' '}
                        <span className="text-gray-500">{item.action.replace(/_/g, ' ')}</span>
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
                        <span>🕐</span> {formatDistanceToNow(item.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pro Tip Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#6c63ff]/[0.06] to-transparent border border-[#6c63ff]/10"
          >
            <p className="text-xs font-bold text-[#8b83ff] mb-1 flex items-center gap-1">
              <span>💡</span> Pro Tip
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">⌘K</kbd> to quickly navigate anywhere in the app!
            </p>
          </motion.div>
        </motion.div>
      </div>

      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        projects={projects}
        onSubmit={async (payload) => {
          try {
            await addTask(payload.projectId, {
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
              status: payload.status,
              assignee_id: payload.assigneeId,
              deadline: payload.deadline,
            });
            toast.success(`Task "${payload.title}" created! ✨`);
          } catch {
            toast.error('Failed to create task. 😕');
          }
        }}
      />
    </motion.div>
  );
}
