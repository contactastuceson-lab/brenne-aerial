import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import ContentReveal from '@/components/motion/ContentReveal';

export default function PageTransition({ context }) {
  const location = useLocation();
  const outlet = useOutlet(context);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: 36, opacity: 0.01 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -36, opacity: 0.01 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.22 }}
        className="min-h-[720px] w-full"
        style={{ willChange: 'transform, opacity' }}
      >
        <ContentReveal>{outlet}</ContentReveal>
      </motion.div>
    </AnimatePresence>
  );
}