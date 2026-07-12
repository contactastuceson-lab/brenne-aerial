import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const variants = {
  initial: (direction) => ({ x: direction === 'back' ? '-20%' : '100%' }),
  animate: { x: 0 },
  exit: (direction) => ({ x: direction === 'back' ? '100%' : '-20%' }),
};

const PageTransition = forwardRef(function PageTransition({ children, direction }, ref) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      layout
      custom={direction}
      variants={variants}
      initial={reduceMotion ? false : 'initial'}
      animate="animate"
      exit={reduceMotion ? undefined : 'exit'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-dvh w-full"
    >
      {children}
    </motion.div>
  );
});

export default PageTransition;