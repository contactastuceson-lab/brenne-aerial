import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        layout
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-30%' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
        className="min-h-[720px] w-full"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}