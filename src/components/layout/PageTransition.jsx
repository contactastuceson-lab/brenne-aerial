import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: 24, opacity: 0.98 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -12, opacity: 0.98 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.18 }}
        className="min-h-[720px] w-full"
        style={{ willChange: 'transform, opacity' }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}