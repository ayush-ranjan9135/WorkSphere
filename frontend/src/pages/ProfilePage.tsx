import { type Variants, motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function Field({ label, value, type = 'text', readOnly = false, onChange, emoji }: {
  label: string; value: string; type?: string; readOnly?: boolean; onChange?: (v: string) => void; emoji?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-1">
        {emoji && <span>{emoji}</span>} {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl text-sm text-white border transition-all focus:outline-none ${
          readOnly
            ? 'bg-white/[0.01] border-white/[0.04] text-gray-400 cursor-not-allowed'
            : 'bg-white/[0.03] border-white/[0.06] hover:border-[#6c63ff]/30 focus:border-[#6c63ff]/50 input-glow'
        }`}
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const avatarInitials = (user?.name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
      toast.success('Profile updated! ✨');
    } catch {
      toast.error('Failed to update profile. 😕');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show"
      className="flex-1 overflow-auto p-6 md:p-10 bg-[#0a0b0e] relative">

      {/* Ambient glow */}
      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-[#6c63ff] opacity-[0.015] blur-[120px] rounded-full pointer-events-none" />

      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="text-2xl">✨</span> Profile
        </h2>
        <p className="text-gray-400 mt-1.5 text-sm">Manage your account details and preferences.</p>
      </motion.div>

      <div className="max-w-3xl space-y-6">

        {/* Avatar + Summary */}
        <motion.div variants={itemVariants}
          className="glass-card rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6c63ff] to-transparent" />
          
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0 bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] shadow-[0_0_30px_rgba(108,99,255,0.3)]"
            >
              {avatarInitials}
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#06d6a0] border-[3px] border-[#0f1115] flex items-center justify-center text-[8px]">
              ✓
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              {user.name}
              {user.role === 'admin' && <span className="text-xs bg-[#fbbf24]/10 text-[#fbbf24] px-2 py-0.5 rounded-lg font-semibold border border-[#fbbf24]/20">⭐ Admin</span>}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
              <span>📅</span> Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {/* Edit Profile */}
        <motion.div variants={itemVariants}
          className="glass-card rounded-2xl p-6 space-y-5">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>📝</span> Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" value={name} onChange={setName} emoji="👤" />
            <Field label="Email" value={user.email} readOnly emoji="📧" />
          </div>
          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-gray-600 flex items-center gap-1">
              <span>🔒</span> Email cannot be changed
            </p>
            <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(108,99,255,0.3)' }} whileTap={{ scale: 0.97 }}
              onClick={handleSaveProfile} disabled={saving}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:from-[#5b52f0] hover:to-[#4338ca] disabled:opacity-50 rounded-xl transition-all shadow-[0_0_20px_rgba(108,99,255,0.2)] flex items-center gap-2">
              {saving ? '⏳ Saving…' : '💾 Save Changes'}
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          {[
            { emoji: '🏢', label: 'Role', value: user.role === 'admin' ? 'Admin' : 'Member' },
            { emoji: '📊', label: 'Status', value: 'Active' },
            { emoji: '🌍', label: 'Timezone', value: Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop() || 'UTC' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xl mb-1">{stat.emoji}</p>
              <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
              <p className="text-sm font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Keyboard Shortcuts */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { keys: '⌘ K', desc: 'Open Command Palette' },
              { keys: '⌘ B', desc: 'Toggle Sidebar' },
              { keys: '⌘ N', desc: 'New Task' },
              { keys: '⌘ /', desc: 'Search' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <span className="text-xs text-gray-400">{shortcut.desc}</span>
                <kbd className="px-2 py-1 rounded-lg bg-white/5 border border-white/[0.06] text-[11px] text-gray-300 font-mono">{shortcut.keys}</kbd>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
