import { useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SpotlightCard({ children, className, ...props }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => { setIsFocused(true); setOpacity(1); };
  const handleBlur = () => { setIsFocused(false); setOpacity(0); };
  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative rounded-2xl border border-white/[0.04] bg-[#0f1115]/80 overflow-hidden transition-all duration-300 backdrop-blur-sm hover:border-[#6c63ff]/15 hover:shadow-[0_8px_32px_rgba(108,99,255,0.06)]',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(108,99,255,.08), transparent 40%)`,
        }}
      />
      {/* Subtle top gradient */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {children}
    </div>
  );
}
