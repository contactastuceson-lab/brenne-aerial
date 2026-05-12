import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DonationFloatingButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-[88px] right-4 z-40"
    >
      <Link to="/donation">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group sky-glow"
        >
          <Heart className="w-6 h-6 text-white fill-white" />
          
          {/* Pulse ring animation */}
          <motion.div
            animate={{ scale: [1, 1.3], opacity: [1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-red-400"
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
              Nous soutenir
              <div className="absolute top-full right-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
            </div>
          </div>
        </motion.button>
      </Link>
    </motion.div>
  );
}