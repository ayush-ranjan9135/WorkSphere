import type { Variants } from 'framer-motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { Magnetic } from '../components/ui/Magnetic';
import { useEffect, useState } from 'react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const itemVariants: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease: EASE } },
};

// Floating emoji particles
function FloatingEmoji({ emoji, delay, x, duration }: { emoji: string; delay: number; x: number; duration: number }) {
  return (
    <motion.div
      className="absolute text-2xl pointer-events-none z-0 select-none"
      initial={{ y: '110vh', x: `${x}vw`, opacity: 0, rotate: 0 }}
      animate={{ y: '-10vh', opacity: [0, 1, 1, 0], rotate: 360 }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      {emoji}
    </motion.div>
  );
}

// Animated counter
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const emojis = [
    { emoji: '🚀', delay: 0, x: 10, duration: 15 },
    { emoji: '⚡', delay: 3, x: 25, duration: 18 },
    { emoji: '💜', delay: 5, x: 45, duration: 20 },
    { emoji: '✨', delay: 2, x: 65, duration: 16 },
    { emoji: '🎯', delay: 7, x: 80, duration: 22 },
    { emoji: '🔥', delay: 4, x: 90, duration: 17 },
    { emoji: '💎', delay: 8, x: 35, duration: 19 },
    { emoji: '🌟', delay: 1, x: 55, duration: 14 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-white selection:bg-[#6c63ff]/40 selection:text-white overflow-hidden relative">
      
      {/* Floating Emojis */}
      {emojis.map((e, i) => (
        <FloatingEmoji key={i} {...e} />
      ))}

      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: 'linear-gradient(rgba(108,99,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Gradient Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#6c63ff] opacity-[0.06] blur-[150px] rounded-full pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#06d6a0] opacity-[0.04] blur-[120px] rounded-full pointer-events-none animate-glow-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-[#0a0b0e]/80 to-[#0a0b0e]" />

      {/* Navigation - Glassmorphism */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between bg-[#0a0b0e]/70 backdrop-blur-2xl border-b border-white/[0.04]"
      >
        <div className="flex items-center gap-2.5">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] flex items-center justify-center text-sm font-bold shadow-[0_0_20px_rgba(108,99,255,0.3)]"
          >L</motion.div>
          <span className="font-bold tracking-tight text-lg">LinearClone</span>
          <span className="text-[10px] font-semibold text-[#06d6a0] bg-[#06d6a0]/10 px-2 py-0.5 rounded-full border border-[#06d6a0]/20">✨ Beta</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
            Log in
          </Link>
          <Link to="/signup" className="text-sm font-semibold px-5 py-2.5 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:from-[#5b52f0] hover:to-[#4338ca] text-white rounded-xl transition-all shadow-[0_0_30px_rgba(108,99,255,0.25)] hover:shadow-[0_0_40px_rgba(108,99,255,0.4)]">
            Get Started Free 🚀
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-52 md:pb-36 px-4 md:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[700px] md:h-[700px] bg-[#6c63ff] opacity-[0.12] blur-[100px] md:blur-[150px] rounded-full pointer-events-none animate-glow-pulse" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#6c63ff]/20 bg-[#6c63ff]/[0.06] backdrop-blur-md text-sm font-medium text-[#8b83ff] mb-8 animate-border-glow">
            <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
            <span>✨ Introducing the future of project management</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl md:text-[90px] font-black tracking-[-0.04em] mb-8 leading-[0.95]">
            <span className="bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">Manage projects.</span>
            <br />
            <span className="bg-gradient-to-r from-[#6c63ff] via-[#8b83ff] to-[#06d6a0] bg-clip-text text-transparent animate-gradient-shift">Ship faster.</span>
            <span className="ml-3 inline-block animate-float">🚀</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed px-4">
            A purpose-built tool for product teams. Designed to help you focus on what matters most — <span className="text-white font-medium">building incredible software</span> ⚡
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0 z-20 relative">
            <Magnetic>
              <Link to="/signup" className="group px-10 py-4 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:from-[#5b52f0] hover:to-[#4338ca] text-white rounded-2xl text-lg font-semibold transition-all w-full sm:w-auto shadow-[0_0_50px_rgba(108,99,255,0.35)] hover:shadow-[0_0_60px_rgba(108,99,255,0.5)] block text-center relative overflow-hidden">
                <span className="relative z-10">Start building for free ✨</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#6c63ff] via-[#06d6a0] to-[#6c63ff] opacity-0 group-hover:opacity-30 transition-opacity bg-[length:200%] animate-gradient-shift" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to="/dashboard" className="px-10 py-4 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-2xl text-lg font-semibold transition-all w-full sm:w-auto backdrop-blur-md block text-center border border-white/[0.06] hover:border-[#6c63ff]/30">
                View Demo 👀
              </Link>
            </Magnetic>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={itemVariants} className="mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { emoji: '🏢', text: '10K+ Teams' },
              { emoji: '⭐', text: '4.9/5 Rating' },
              { emoji: '🔒', text: 'SOC 2 Certified' },
              { emoji: '⚡', text: '99.9% Uptime' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-base">{badge.emoji}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 md:px-8 pb-16 max-w-5xl mx-auto z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: 10000, suffix: '+', label: 'Active Teams', emoji: '🏢' },
            { value: 2, suffix: 'M+', label: 'Tasks Created', emoji: '✅' },
            { value: 99, suffix: '%', label: 'Customer Satisfaction', emoji: '💜' },
            { value: 150, suffix: '+', label: 'Countries', emoji: '🌍' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm"
            >
              <p className="text-2xl mb-1">{stat.emoji}</p>
              <p className="text-3xl md:text-4xl font-black text-white">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Parallax Product Image */}
      <section className="relative px-4 md:px-8 pb-32 max-w-6xl mx-auto z-10">
        <motion.div 
          style={{ y, opacity }}
          className="relative rounded-2xl border border-white/[0.06] bg-[#0f1115]/80 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden p-5"
        >
          {/* Mock UI window controls */}
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff6b6b]/80" />
              <div className="w-3 h-3 rounded-full bg-[#fbbf24]/80" />
              <div className="w-3 h-3 rounded-full bg-[#06d6a0]/80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-lg bg-white/[0.03] text-xs text-gray-600 border border-white/[0.04] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5">🔒</span> app.linearclone.com
              </div>
            </div>
          </div>
          
          {/* Mock Board */}
          <div className="flex gap-4">
            {[
              { title: '📋 To Do', count: 5, color: 'from-[#6c63ff]/20' },
              { title: '🔄 In Progress', count: 3, color: 'from-[#fbbf24]/20' },
              { title: '✅ Done', count: 8, color: 'from-[#06d6a0]/20' },
            ].map((col, ci) => (
              <div key={ci} className="w-1/3 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-300">{col.title}</span>
                  <span className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">{col.count}</span>
                </div>
                {[1, 2].map((card) => (
                  <motion.div 
                    key={card}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: ci * 0.1 + card * 0.05 }}
                    className={`h-24 bg-gradient-to-br ${col.color} to-transparent border border-white/[0.04] rounded-xl flex flex-col justify-between p-3.5 hover:border-[#6c63ff]/20 transition-colors`}
                  >
                    <div className="h-3 w-1/3 bg-white/5 rounded-full" />
                    <div className="h-4 w-3/4 bg-white/[0.07] rounded-full" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-1/4 bg-white/5 rounded-full" />
                      <div className="w-5 h-5 rounded-full bg-[#6c63ff]/30 ml-auto" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 md:px-8 py-24 md:py-32 relative z-10 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <span className="text-sm font-semibold text-[#6c63ff] tracking-wide uppercase mb-4 block">⚡ Features</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5">
              Built for <span className="gradient-text">speed</span> 🏎️
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">Everything you need to manage your team, completely friction-free.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              { emoji: '⌨️', title: "Keyboard First", desc: "Never take your hands off the keyboard. Navigate the entire app with CMD+K.", gradient: 'from-[#6c63ff]/10' },
              { emoji: '⚡', title: "Real-time Sync", desc: "Instantly sync state across your entire team. No refreshing required.", gradient: 'from-[#06d6a0]/10' },
              { emoji: '🌙', title: "Dark Mode Native", desc: "Designed for late nights and long sessions. Easy on the eyes, always.", gradient: 'from-[#8b83ff]/10' },
              { emoji: '🔧', title: "Custom Workflows", desc: "Adapt the tool to how your team works, not the other way around.", gradient: 'from-[#fbbf24]/10' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full"
              >
                <SpotlightCard className="p-8 h-full group hover:border-[#6c63ff]/20 transition-colors">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} to-transparent flex items-center justify-center mb-6 relative z-10 text-2xl group-hover:scale-110 transition-transform`}>
                    {feature.emoji}
                  </div>
                  <h3 className="text-xl font-bold mb-3 relative z-10 text-white">{feature.title}</h3>
                  <p className="text-base text-gray-400 relative z-10 leading-relaxed">{feature.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <div className="absolute inset-0 bg-[#6c63ff]/[0.06] blur-[80px] rounded-full" />
          <div className="relative glass-card rounded-3xl p-12 md:p-16 border border-[#6c63ff]/10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Ready to ship faster? 🚀
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of teams who've already made the switch to LinearClone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white rounded-2xl text-lg font-semibold shadow-[0_0_40px_rgba(108,99,255,0.3)] hover:shadow-[0_0_60px_rgba(108,99,255,0.5)] transition-all">
                Start Free Trial ✨
              </Link>
              <Link to="/login" className="px-8 py-4 text-gray-300 hover:text-white transition-colors text-lg font-medium">
                Talk to Sales →
              </Link>
            </div>
            <p className="text-sm text-gray-600 mt-6">No credit card required • Free forever plan available 💳</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#0a0b0e] py-12 px-8 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#4f46e5] flex items-center justify-center text-[10px] font-bold">L</div>
            <span className="font-semibold text-gray-400">LinearClone</span>
          </div>
          <p className="text-sm text-gray-600">© 2026 LinearClone. Built with 💜 using React & Framer Motion.</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
