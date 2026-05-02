import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ComponentProps<typeof motion.button> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white hover:from-[#5b52f0] hover:to-[#4338ca] border-transparent shadow-[0_0_15px_rgba(108,99,255,0.15)]',
      secondary: 'bg-white/[0.04] text-white hover:bg-white/[0.08] border-white/[0.06]',
      ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/[0.04] border-transparent',
      danger: 'bg-transparent text-[#ff6b6b] hover:bg-[#ff6b6b]/10 border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/30 border disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
