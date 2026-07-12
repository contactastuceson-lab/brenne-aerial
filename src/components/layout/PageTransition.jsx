import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom';
import ContentReveal from '@/components/motion/ContentReveal';

export default function PageTransition({ context }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet(context);
  const isBackNavigation = navigationType === 'POP';
  const enterOffset = isBackNavigation ? -36 : 36;
  const exitOffset = isBackNavigation ? 36 : -36;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: enterOffset, opacity: 0.01 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: exitOffset, opacity: 0.01 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.22 }}
        className="min-h-[720px] w-full"
        style={{ willChange: 'transform, opacity' }}
      >
        <ContentReveal>{outlet}</ContentReveal>
      </motion.div>
    </AnimatePresence>
  );
}