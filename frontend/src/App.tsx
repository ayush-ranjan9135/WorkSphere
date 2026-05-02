import { BrowserRouter as Router, Routes, Route, Link, NavLink, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { CommandPalette } from './components/CommandPalette';
import { useState } from 'react';

const navItem   = 'nav-item-glow flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/[0.04]';
const navActive = 'nav-item-glow active flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-xl text-white bg-gradient-to-r from-[#6c63ff]/15 to-transparent border border-[#6c63ff]/15';

function SidebarNavItem({ to, icon, label, emoji }: { to: string; icon: React.ReactNode; label: string; emoji?: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => isActive ? navActive : navItem}>
      {icon}
      <span className="flex items-center gap-2">
        {label}
        {emoji && <span className="text-xs">{emoji}</span>}
      </span>
    </NavLink>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0b0e]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] animate-pulse flex items-center justify-center text-white font-bold text-xl shadow-[0_0_40px_rgba(108,99,255,0.4)]">
            ✨
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-[#6c63ff] opacity-20 animate-ping" />
        </div>
        <p className="text-gray-500 text-sm animate-pulse">Loading workspace…</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function Layout() {
  const { user, logout } = useAuth();
  const [sidebarHover, setSidebarHover] = useState(false);

  return (
    <div className="flex h-screen bg-[#0a0b0e] text-[#e4e6ed] font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        className="w-[260px] flex-shrink-0 border-r border-[#232636]/60 bg-[#0c0d12] flex flex-col relative overflow-hidden"
      >
        {/* Sidebar ambient glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#6c63ff]/[0.03] to-transparent pointer-events-none" />
        <AnimatePresence>
          {sidebarHover && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#6c63ff]/[0.02] to-transparent pointer-events-none" 
            />
          )}
        </AnimatePresence>

        {/* Logo */}
        <div className="p-5 border-b border-[#232636]/60 relative">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_20px_rgba(108,99,255,0.3)] relative"
            >
              L
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#06d6a0] opacity-0 group-hover:opacity-30 transition-opacity blur-sm" />
            </motion.div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">LinearClone</span>
              <span className="ml-1.5 text-[10px] font-medium text-[#06d6a0] bg-[#06d6a0]/10 px-1.5 py-0.5 rounded-full">PRO</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3.5 space-y-0.5 overflow-y-auto relative">
          <p className="px-3 pt-3 pb-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] flex items-center gap-1.5">
            <span>⚡</span> Workspace
          </p>
          <SidebarNavItem to="/dashboard" label="Dashboard" emoji="📊" icon={
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
          } />
          <SidebarNavItem to="/projects" label="Kanban Board" emoji="🎯" icon={
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
          } />
          <SidebarNavItem to="/team" label="Team" emoji="👥" icon={
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 11v-2a4 4 0 00-3-3.87" /></svg>
          } />
          <SidebarNavItem to="/profile" label="My Profile" emoji="✨" icon={
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          } />

          <p className="px-3 pt-5 pb-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] flex items-center gap-1.5">
            <span>⌨️</span> Quick Actions
          </p>
          <div className="px-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-dashed border-[#232636] text-gray-500 text-xs cursor-pointer hover:border-[#6c63ff]/30 hover:text-gray-400 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search… <kbd className="ml-auto text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-[#232636] font-mono">⌘K</kbd>
            </div>
          </div>
        </nav>

        {/* User + Logout */}
        <div className="p-3.5 border-t border-[#232636]/60 relative">
          {user && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.02] border border-[#232636]/50"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-lg">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#06d6a0] border-2 border-[#0c0d12]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
              </div>
            </motion.div>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/[0.05] transition-all duration-200 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Log out
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6c63ff]/30 to-transparent" />
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Router>
      <Toaster 
        theme="dark" 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#141720',
            border: '1px solid rgba(108,99,255,0.15)',
            color: '#e4e6ed',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
        }}
      />
      <CommandPalette />
      <Routes>
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects"  element={<Kanban />} />
            <Route path="/team"      element={<TeamPage />} />
            <Route path="/profile"   element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppRoutes />
      </TaskProvider>
    </AuthProvider>
  );
}
