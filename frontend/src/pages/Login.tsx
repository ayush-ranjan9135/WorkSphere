import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [focused, setFocused] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields. 📝'); return; }
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Login failed. Please try again. 😕');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[#0a0b0e] overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(108,99,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-[#6c63ff] opacity-[0.06] blur-[120px] rounded-full pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-[#06d6a0] opacity-[0.04] blur-[100px] rounded-full pointer-events-none animate-glow-pulse" style={{ animationDelay: '2s' }} />

      {/* Floating emojis */}
      <motion.div className="absolute top-[15%] left-[10%] text-3xl select-none pointer-events-none"
        animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}>🔐</motion.div>
      <motion.div className="absolute top-[25%] right-[15%] text-2xl select-none pointer-events-none"
        animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity }}>✨</motion.div>
      <motion.div className="absolute bottom-[20%] left-[15%] text-2xl select-none pointer-events-none"
        animate={{ y: [-8, 12, -8] }} transition={{ duration: 3.5, repeat: Infinity }}>💜</motion.div>
      <motion.div className="absolute bottom-[30%] right-[10%] text-3xl select-none pointer-events-none"
        animate={{ y: [5, -15, 5], rotate: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>🚀</motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="glass-card rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-10 relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6c63ff] to-transparent" />
          
          <div className="mb-8 text-center">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
              className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] flex items-center justify-center text-white font-bold text-xl mb-5 shadow-[0_0_30px_rgba(108,99,255,0.4)] relative"
            >
              L
              <div className="absolute -inset-1 rounded-2xl bg-[#6c63ff] opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back 👋</h1>
            <p className="text-gray-400 mt-2 text-sm">Log in to your LinearClone account</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase mb-2 flex items-center gap-1">
                <span>📧</span> Email Address
              </label>
              <div className={`relative rounded-xl transition-all duration-200 ${focused === 'email' ? 'ring-2 ring-[#6c63ff]/40 shadow-[0_0_20px_rgba(108,99,255,0.1)]' : ''}`}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-all text-sm input-glow"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase flex items-center gap-1">
                  <span>🔑</span> Password
                </label>
                <a href="#" className="text-[11px] text-[#6c63ff] hover:text-[#8b83ff] transition-colors font-medium">Forgot password?</a>
              </div>
              <div className={`relative rounded-xl transition-all duration-200 ${focused === 'password' ? 'ring-2 ring-[#6c63ff]/40 shadow-[0_0_20px_rgba(108,99,255,0.1)]' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 pr-11 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#6c63ff]/50 transition-all text-sm input-glow"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-white/5">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, boxShadow: '0 0 40px rgba(108,99,255,0.35)' }}
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={submitting}
              className="w-full py-3.5 mt-3 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:from-[#5b52f0] hover:to-[#4338ca] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_30px_rgba(108,99,255,0.25)] relative overflow-hidden"
            >
              <span className="relative z-10">{submitting ? '⏳ Logging in…' : 'Log in →'}</span>
              {!submitting && <div className="absolute inset-0 bg-gradient-to-r from-[#6c63ff] via-[#06d6a0] to-[#6c63ff] opacity-0 hover:opacity-20 transition-opacity bg-[length:200%] animate-gradient-shift" />}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#6c63ff] hover:text-[#8b83ff] font-semibold transition-colors">Sign up free ✨</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
