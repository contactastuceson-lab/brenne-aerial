import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

export default function BeforeAfterSlider({ beforeUrl, afterUrl, beforeLabel = 'Avant', afterLabel = 'Après' }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e) => { dragging.current = true; e.preventDefault(); };
  const onMouseMove = (e) => { if (dragging.current) updatePosition(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchStart = () => { dragging.current = true; };
  const onTouchMove = (e) => { if (dragging.current) updatePosition(e.touches[0].clientX); };
  const onTouchEnd = () => { dragging.current = false; };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video overflow-hidden cursor-col-resize select-none"
      onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      {/* After (base) */}
      <img src={afterUrl} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={beforeUrl} alt={beforeLabel} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${10000 / position}%`, maxWidth: 'none' }} draggable={false} />
      </div>

      {/* Divider line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center cursor-col-resize"
          onMouseDown={onMouseDown} onTouchStart={onTouchStart}
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 left-2 font-mono text-[10px] bg-black/50 text-white px-2 py-1 rounded-full pointer-events-none">
        {beforeLabel}
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-[10px] bg-black/50 text-white px-2 py-1 rounded-full pointer-events-none">
        {afterLabel}
      </div>
    </div>
  );
}