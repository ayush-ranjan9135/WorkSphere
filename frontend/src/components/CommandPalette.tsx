import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, Folder, CheckSquare, Settings, LogOut, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          {/* Palette */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[600px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1115]/95 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6c63ff]/50 to-transparent" />
            
            <Command
              shouldFilter={true}
              className="flex h-full w-full flex-col overflow-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Escape' || (e.key === 'Backspace' && !(e.currentTarget as HTMLDivElement & { value?: string }).value)) {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
            >
              <div className="flex items-center border-b border-white/[0.04] px-4">
                <Search className="mr-3 h-4 w-4 shrink-0 text-[#6c63ff]" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search… ✨"
                  className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 text-white font-medium"
                />
                <kbd className="text-[10px] bg-white/5 px-2 py-1 rounded-lg border border-white/[0.06] text-gray-500 font-mono shrink-0">ESC</kbd>
              </div>
              
              <Command.List className="max-h-[320px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2">
                  <Command.Item 
                    onSelect={() => { navigate('/dashboard'); setOpen(false); }}
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none hover:bg-white/[0.04] hover:text-white data-[selected=true]:bg-[#6c63ff]/10 data-[selected=true]:text-white transition-colors"
                  >
                    <Folder className="mr-3 h-4 w-4 text-[#6c63ff]" />
                    <span>📊 Dashboard</span>
                    <kbd className="ml-auto text-[10px] text-gray-600 font-mono">⌘D</kbd>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { navigate('/projects'); setOpen(false); }}
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none hover:bg-white/[0.04] hover:text-white data-[selected=true]:bg-[#6c63ff]/10 data-[selected=true]:text-white transition-colors"
                  >
                    <CheckSquare className="mr-3 h-4 w-4 text-[#fbbf24]" />
                    <span>🎯 Kanban Board</span>
                    <kbd className="ml-auto text-[10px] text-gray-600 font-mono">⌘P</kbd>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { navigate('/team'); setOpen(false); }}
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none hover:bg-white/[0.04] hover:text-white data-[selected=true]:bg-[#6c63ff]/10 data-[selected=true]:text-white transition-colors"
                  >
                    <Users className="mr-3 h-4 w-4 text-[#06d6a0]" />
                    <span>👥 Team</span>
                    <kbd className="ml-auto text-[10px] text-gray-600 font-mono">⌘T</kbd>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { navigate('/profile'); setOpen(false); }}
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none hover:bg-white/[0.04] hover:text-white data-[selected=true]:bg-[#6c63ff]/10 data-[selected=true]:text-white transition-colors"
                  >
                    <User className="mr-3 h-4 w-4 text-[#8b83ff]" />
                    <span>✨ Profile</span>
                    <kbd className="ml-auto text-[10px] text-gray-600 font-mono">⌘U</kbd>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="-mx-2 my-1.5 h-px bg-white/[0.03]" />

                <Command.Group heading="Settings" className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2">
                  <Command.Item 
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none hover:bg-white/[0.04] hover:text-white data-[selected=true]:bg-[#6c63ff]/10 data-[selected=true]:text-white transition-colors"
                  >
                    <Settings className="mr-3 h-4 w-4 text-gray-500" />
                    <span>⚙️ Preferences</span>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { navigate('/login'); setOpen(false); }}
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm text-[#ff6b6b] outline-none hover:bg-[#ff6b6b]/10 data-[selected=true]:bg-[#ff6b6b]/10 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>🚪 Log out</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
              
              {/* Footer */}
              <div className="border-t border-white/[0.03] px-4 py-2 flex items-center justify-between text-[10px] text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/[0.06] font-mono">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/[0.06] font-mono">↵</kbd> Select</span>
                </div>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/[0.06] font-mono">ESC</kbd> Close</span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
