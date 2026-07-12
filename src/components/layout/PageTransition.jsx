import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom';
import ContentReveal from '@/components/motion/ContentReveal';

const isDeepDestination = (pathname) => pathname.startsWith('/@') || /\/(post|blog|forum)\/[^/]+/.test(pathname) || pathname.split('/').filter(Boolean).length > 1;

export default function PageTransition({ context }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet(context);
  const directionRef = useRef(1);
  const direction = navigationType === 'POP' ? -1 : directionRef.current;

  useEffect(() => {
    const captureNavigationDirection = (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank') return;
      const destination = new URL(link.href, window.location.origin);
      if (destination.origin !== window.location.origin || destination.pathname === location.pathname) return;
      const bounds = link.getBoundingClientRect();
      directionRef.current = isDeepDestination(destination.pathname) || bounds.left + bounds.width / 2 >= window.innerWidth / 2 ? 1 : -1;
    };

    document.addEventListener('pointerdown', captureNavigationDirection, true);
    return () => document.removeEventListener('pointerdown', captureNavigationDirection, true);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: direction * 36, opacity: 0.01 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -direction * 36, opacity: 0.01 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.22 }}
        className="min-h-[720px] w-full"
        style={{ willChange: 'transform, opacity' }}
      >
        <ContentReveal>{outlet}</ContentReveal>
      </motion.div>
    </AnimatePresence>
  );
}