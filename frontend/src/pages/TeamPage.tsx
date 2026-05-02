import { useEffect, useState } from 'react';
import { type Variants, motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { projectsApi, teamsApi, type Project, type ProjectMember, type Team } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = [
    'from-[#6c63ff] to-[#4f46e5]',
    'from-[#06d6a0] to-[#059669]',
    'from-[#fbbf24] to-[#f59e0b]',
    'from-[#ff6b6b] to-[#ef4444]',
    'from-[#8b83ff] to-[#6c63ff]',
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;
  
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-lg`}>
      {initials}
    </div>
  );
}

export default function TeamPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tab, setTab] = useState<'members' | 'teams'>('members');

  // Members tab state
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviting, setInviting] = useState(false);

  // Teams tab state
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [assignTeamId, setAssignTeamId] = useState('');
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    projectsApi.list().then(({ data }) => {
      setProjects(data);
      if (data.length > 0) {
        setActiveProjectId(data[0].id);
        setAssignProjectId(data[0].id);
      }
    }).catch(() => toast.error('Failed to load projects. 😕'));

    teamsApi.list().then(({ data }) => setTeams(data)).catch(() => {});
  }, []);

  // Load members when project changes
  useEffect(() => {
    if (!activeProjectId) return;
    projectsApi.get(activeProjectId).then(({ data }) => {
      setMembers(data.members ?? []);
      setAllUsers(data.members?.map(m => ({ id: m.id, name: m.name, email: m.email })) ?? []);
    }).catch(() => {});
  }, [activeProjectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeProjectId) return;
    setInviting(true);
    try {
      await projectsApi.inviteMember(activeProjectId, inviteEmail.trim(), inviteRole);
      toast.success(`${inviteEmail} invited as ${inviteRole}! 🎉`);
      setInviteEmail('');
      const { data } = await projectsApi.get(activeProjectId);
      setMembers(data.members ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to invite member. 😕');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this project? 🤔`)) return;
    try {
      await projectsApi.removeMember(activeProjectId, userId);
      setMembers(prev => prev.filter(m => m.id !== userId));
      toast.success(`${name} removed. 👋`);
    } catch {
      toast.error('Failed to remove member. 😕');
    }
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'member') => {
    try {
      await projectsApi.updateMemberRole(activeProjectId, userId, role);
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, role } : m));
      toast.success('Role updated! ✅');
    } catch {
      toast.error('Failed to update role. 😕');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    try {
      const { data } = await teamsApi.create(newTeamName.trim(), selectedUserIds);
      setTeams(prev => [data, ...prev]);
      setNewTeamName('');
      setSelectedUserIds([]);
      toast.success(`Team "${data.name}" created! 🎉`);
    } catch {
      toast.error('Failed to create team. 😕');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, name: string) => {
    if (!confirm(`Delete team "${name}"? 🗑️`)) return;
    try {
      await teamsApi.delete(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
      toast.success('Team deleted. 🗑️');
    } catch {
      toast.error('Failed to delete team. 😕');
    }
  };

  const handleRemoveTeamMember = async (teamId: string, userId: string) => {
    try {
      const { data } = await teamsApi.removeMember(teamId, userId);
      setTeams(prev => prev.map(t => t.id === teamId ? data : t));
    } catch {
      toast.error('Failed to remove member. 😕');
    }
  };

  const handleAssignTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeamId || !assignProjectId) return;
    setAssigning(true);
    try {
      const { data } = await teamsApi.assignToProject(assignTeamId, assignProjectId);
      toast.success((data as any).message + ' 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to assign team. 😕');
    } finally {
      setAssigning(false);
    }
  };

  const toggleUser = (id: string) =>
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show"
      className="flex-1 overflow-auto p-6 md:p-8 bg-[#0a0b0e] relative">

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6c63ff] opacity-[0.015] blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="text-2xl">👥</span> Team
        </h2>
        <p className="text-gray-400 mt-1.5 text-sm">Manage members, teams and project assignments. ⚡</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 mb-6 bg-[#0f1115]/80 border border-white/[0.04] rounded-xl p-1 w-fit backdrop-blur-sm">
        {([
          { key: 'members' as const, emoji: '👤', label: 'Members' },
          { key: 'teams' as const, emoji: '🏢', label: 'Teams' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              tab === t.key 
                ? 'bg-gradient-to-r from-[#6c63ff]/15 to-transparent text-white border border-[#6c63ff]/15 shadow-[0_0_15px_rgba(108,99,255,0.1)]' 
                : 'text-gray-500 hover:text-gray-300'
            }`}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </motion.div>

      {/* ── MEMBERS TAB ── */}
      <AnimatePresence mode="wait">
        {tab === 'members' && (
          <motion.div 
            key="members"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="max-w-3xl space-y-6"
          >
            {projects.length > 1 && (
              <motion.div variants={itemVariants}>
                <select value={activeProjectId} onChange={e => setActiveProjectId(e.target.value)}
                  className="px-3 py-2.5 bg-[#0f1115] border border-white/[0.06] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#6c63ff]/50 [color-scheme:dark] transition-colors">
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </motion.div>
            )}

            {isAdmin && (
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>📨</span> Invite to Project
                </h4>
                <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@email.com"
                    className="flex-1 min-w-0 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-colors input-glow" />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-300 focus:outline-none [color-scheme:dark]">
                    <option value="member">👤 Member</option>
                    <option value="admin">⭐ Admin</option>
                  </select>
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={inviting || !inviteEmail.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(108,99,255,0.2)]">
                    {inviting ? '⏳ Inviting…' : '🚀 Invite'}
                  </motion.button>
                </form>
                <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1">
                  <span>ℹ️</span> User must already have an account.
                </p>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>👥</span> Members
                </h4>
                <span className="text-[11px] text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg font-semibold border border-white/[0.04]">{members.length}</span>
              </div>
              {members.length === 0
                ? <div className="p-12 text-center">
                    <p className="text-3xl mb-2">🤷</p>
                    <p className="text-sm text-gray-500">No members yet.</p>
                  </div>
                : <div className="divide-y divide-white/[0.03]">
                    {members.map((m, i) => (
                      <motion.div 
                        key={m.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group"
                      >
                        <Avatar name={m.name} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-[#8b83ff] transition-colors">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate">{m.email}</p>
                        </div>
                        {isAdmin ? (
                          <>
                            <select value={m.role} onChange={e => handleRoleChange(m.id, e.target.value as 'admin' | 'member')}
                              className="px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-gray-300 focus:outline-none [color-scheme:dark]">
                              <option value="member">👤 Member</option>
                              <option value="admin">⭐ Admin</option>
                            </select>
                            <button onClick={() => handleRemoveMember(m.id, m.name)}
                              className="text-gray-600 hover:text-[#ff6b6b] transition-colors p-1.5 rounded-lg hover:bg-[#ff6b6b]/5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 capitalize border border-white/[0.06] px-2.5 py-1 rounded-lg bg-white/[0.02] flex items-center gap-1">
                            {m.role === 'admin' ? '⭐' : '👤'} {m.role}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
              }
            </motion.div>
          </motion.div>
        )}

        {/* ── TEAMS TAB ── */}
        {tab === 'teams' && (
          <motion.div 
            key="teams"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            className="max-w-3xl space-y-6"
          >
            {/* Create Team */}
            {isAdmin && (
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>🏢</span> Create Team
                </h4>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                    placeholder="Team name (e.g. Frontend, Backend)"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-colors input-glow" />

                  {allUsers.length > 0 && (
                    <div>
                      <p className="text-[11px] text-gray-500 mb-2 flex items-center gap-1"><span>👥</span> Add members (optional)</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {allUsers.map(u => (
                          <button key={u.id} type="button" onClick={() => toggleUser(u.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                              selectedUserIds.includes(u.id)
                                ? 'border-[#6c63ff]/30 bg-[#6c63ff]/[0.06] text-white'
                                : 'border-transparent hover:bg-white/[0.02] text-gray-400'
                            }`}>
                            <Avatar name={u.name} />
                            <div className="text-left min-w-0">
                              <p className="font-semibold truncate text-sm">{u.name}</p>
                              <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                            {selectedUserIds.includes(u.id) && (
                              <span className="ml-auto text-[#06d6a0]">✅</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={creatingTeam || !newTeamName.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(108,99,255,0.2)]">
                      {creatingTeam ? '⏳ Creating…' : '🚀 Create Team'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Assign Team to Project */}
            {isAdmin && teams.length > 0 && projects.length > 0 && (
              <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
                <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>🔗</span> Assign Team to Project
                </h4>
                <form onSubmit={handleAssignTeam} className="flex gap-3 flex-wrap">
                  <select value={assignTeamId} onChange={e => setAssignTeamId(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#6c63ff]/50 [color-scheme:dark]">
                    <option value="">Select team…</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.members.length} 👤)</option>)}
                  </select>
                  <select value={assignProjectId} onChange={e => setAssignProjectId(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#6c63ff]/50 [color-scheme:dark]">
                    <option value="">Select project…</option>
                    {projects.map(p => <option key={p.id} value={p.id}>📁 {p.name}</option>)}
                  </select>
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={assigning || !assignTeamId || !assignProjectId}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#06d6a0] to-[#059669] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(6,214,160,0.2)]">
                    {assigning ? '⏳ Assigning…' : '🔗 Assign'}
                  </motion.button>
                </form>
                <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1">
                  <span>ℹ️</span> All team members will be added to the selected project.
                </p>
              </motion.div>
            )}

            {/* Teams List */}
            <motion.div variants={itemVariants} className="space-y-4">
              {teams.length === 0
                ? <div className="border border-dashed border-white/[0.06] rounded-2xl p-12 text-center">
                    <p className="text-3xl mb-2">🏢</p>
                    <p className="text-sm text-gray-500">No teams yet. Create one above.</p>
                  </div>
                : teams.map(team => (
                    <motion.div 
                      key={team.id} 
                      layout
                      className="glass-card rounded-2xl overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>🏢</span> {team.name}
                          </h5>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {team.members.length} 👤 · Created by {team.created_by_name}
                          </p>
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleDeleteTeam(team.id, team.name)}
                            className="text-xs text-gray-600 hover:text-[#ff6b6b] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#ff6b6b]/5 border border-transparent hover:border-[#ff6b6b]/10 flex items-center gap-1">
                            <span>🗑️</span> Delete
                          </button>
                        )}
                      </div>
                      {team.members.length === 0
                        ? <div className="px-6 py-6 text-center">
                            <p className="text-xs text-gray-600">No members in this team yet. 🤷</p>
                          </div>
                        : <div className="divide-y divide-white/[0.03]">
                            {team.members.map(m => (
                              <div key={m.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                                <Avatar name={m.name} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white truncate font-medium">{m.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{m.email}</p>
                                </div>
                                {isAdmin && (
                                  <button onClick={() => handleRemoveTeamMember(team.id, m.id)}
                                    className="text-gray-600 hover:text-[#ff6b6b] transition-colors p-1.5 rounded-lg hover:bg-[#ff6b6b]/5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                      }
                    </motion.div>
                  ))
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
