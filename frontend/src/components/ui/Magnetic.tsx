import { useRef, useState } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { motion } from 'framer-motion';

export function Magnetic({ children }: { children: ReactElement, strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    // Calculate distance and max pull
    const distance = Math.sqrt(middleX * middleX + middleY * middleY);
    const maxDistance = width / 2;

    if (distance < maxDistance) {
      setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
