import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../../lib/api';

interface CreateMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (name: string) => void;
}

export function CreateMemberDialog({ open, onClose, onCreated }: CreateMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await authApi.signup(name.trim(), email.trim(), password);
      onCreated?.(name.trim());
      setName(''); setEmail(''); setPassword('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

          <motion.div key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-[#101417]/90 backdrop-blur-2xl border border-[#27282b] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between px-6 py-4 border-b border-[#27282b]/60">
                <h2 className="text-base font-semibold text-white">Create Account</h2>
                <button onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#27282b] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-5 space-y-4">
                  {error && (
                    <div className="px-3 py-2 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-lg text-xs text-[#ffb4ab]">{error}</div>
                  )}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe"
                      className="w-full px-3 py-2.5 bg-[#0e0f11] border border-[#27282b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#5e6ad2] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com"
                      className="w-full px-3 py-2.5 bg-[#0e0f11] border border-[#27282b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#5e6ad2] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                      className="w-full px-3 py-2.5 bg-[#0e0f11] border border-[#27282b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#5e6ad2] transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#27282b]/60 bg-[#0e0f11]/40">
                  <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-[#27282b] hover:bg-[#323539] rounded-lg transition-colors">
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    type="submit" disabled={loading}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#5e6ad2] hover:bg-[#4854bb] disabled:opacity-50 rounded-lg transition-colors">
                    {loading ? 'Creating…' : 'Create Account'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
