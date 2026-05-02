import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [focused, setFocused] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-[#ff6b6b]', 'bg-[#fbbf24]', 'bg-[#06d6a0]'];
  const strengthLabels = ['', 'Weak 😟', 'Good 👍', 'Strong 💪'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields. 📝'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters. 🔑'); return; }
    setSubmitting(true);
    try {
      await signup(name, email, password);
      toast.success('Account created! Please log in. 🎉');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Signup failed. Please try again. 😕');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[#0a0b0e] overflow-hidden">
      {/* Animated grid */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(108,99,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-[30%] right-[15%] w-[500px] h-[500px] bg-[#6c63ff] opacity-[0.06] blur-[130px] rounded-full pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-[#06d6a0] opacity-[0.04] blur-[100px] rounded-full pointer-events-none animate-glow-pulse" style={{ animationDelay: '2s' }} />

      {/* Floating emojis */}
      <motion.div className="absolute top-[20%] left-[8%] text-3xl select-none pointer-events-none"
        animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}>🎯</motion.div>
      <motion.div className="absolute top-[15%] right-[12%] text-2xl select-none pointer-events-none"
        animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity }}>⚡</motion.div>
      <motion.div className="absolute bottom-[25%] left-[12%] text-2xl select-none pointer-events-none"
        animate={{ y: [-8, 12, -8] }} transition={{ duration: 3.5, repeat: Infinity }}>🌟</motion.div>
      <motion.div className="absolute bottom-[15%] right-[8%] text-3xl select-none pointer-events-none"
        animate={{ y: [5, -15, 5], rotate: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>💎</motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="glass-card rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-10 relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#06d6a0] to-transparent" />

          <div className="mb-8 text-center">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
              className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#06d6a0] flex items-center justify-center text-white font-bold text-xl mb-5 shadow-[0_0_30px_rgba(6,214,160,0.3)] relative"
            >
              L
              <div className="absolute -inset-1 rounded-2xl bg-[#06d6a0] opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tight">Create an account ✨</h1>
            <p className="text-gray-400 mt-2 text-sm">Join thousands of teams already using LinearClone</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2 flex items-center gap-1">
                <span>👤</span> Full Name
              </label>
              <div className={`rounded-xl transition-all duration-200 ${focused === 'name' ? 'ring-2 ring-[#6c63ff]/40 shadow-[0_0_20px_rgba(108,99,255,0.1)]' : ''}`}>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-all text-sm input-glow"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2 flex items-center gap-1">
                <span>📧</span> Email Address
              </label>
              <div className={`rounded-xl transition-all duration-200 ${focused === 'email' ? 'ring-2 ring-[#6c63ff]/40 shadow-[0_0_20px_rgba(108,99,255,0.1)]' : ''}`}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-all text-sm input-glow"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2 flex items-center gap-1">
                <span>🔑</span> Password
              </label>
              <div className={`rounded-xl transition-all duration-200 ${focused === 'password' ? 'ring-2 ring-[#6c63ff]/40 shadow-[0_0_20px_rgba(108,99,255,0.1)]' : ''}`}>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-all text-sm input-glow"
                  placeholder="Min. 6 characters"
                />
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2.5 space-y-1.5"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3].map(level => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? strengthColors[level] : 'bg-white/5'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">{strengthLabels[passwordStrength]}</p>
                </motion.div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01, boxShadow: '0 0 40px rgba(108,99,255,0.35)' }}
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={submitting}
              className="w-full py-3.5 mt-3 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:from-[#5b52f0] hover:to-[#4338ca] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_30px_rgba(108,99,255,0.25)] relative overflow-hidden"
            >
              <span className="relative z-10">{submitting ? '⏳ Creating account…' : 'Create account 🚀'}</span>
            </motion.button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-600">
            By signing up, you agree to our{' '}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>. 🔒
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6c63ff] hover:text-[#8b83ff] font-semibold transition-colors">Log in 👋</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
