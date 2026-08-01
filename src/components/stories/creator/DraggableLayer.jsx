import { useRef } from 'react';

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function angle(a, b) { return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; }

// Calque déplaçable (drag 1 doigt) + pincement/zoom/rotation (2 doigts).
// Les coordonnées x/y sont en % du canvas ; scale et rotation en unités CSS.
export default function DraggableLayer({ layer, selected, canvasRef, onSelect, onChange, onDelete, children }) {
  const pointers = useRef(new Map());
  const start = useRef(null);

  const onDown = (e) => {
    if (e.button && e.button !== 0) return;
    e.stopPropagation();
    onSelect?.(layer.id);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      start.current = { mode: 'drag', sx: layer.x, sy: layer.y, px: e.clientX, py: e.clientY };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      start.current = {
        mode: 'pinch',
        dist: dist(pts[0], pts[1]),
        ang: angle(pts[0], pts[1]),
        scale: layer.scale ?? 1,
        rotation: layer.rotation ?? 0,
      };
    }
  };

  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const b = canvasRef.current?.getBoundingClientRect();
    if (!b) return;
    if (start.current?.mode === 'drag' && pointers.current.size === 1) {
      const dx = ((e.clientX - start.current.px) / b.width) * 100;
      const dy = ((e.clientY - start.current.py) / b.height) * 100;
      const nx = Math.min(96, Math.max(4, start.current.sx + dx));
      const ny = Math.min(96, Math.max(4, start.current.sy + dy));
      onChange?.(layer.id, { x: nx, y: ny });
    } else if (start.current?.mode === 'pinch' && pointers.current.size >= 2) {
      const pts = [...pointers.current.values()];
      const d = dist(pts[0], pts[1]);
      const a = angle(pts[0], pts[1]);
      const ns = Math.max(0.4, Math.min(4, start.current.scale * (d / Math.max(1, start.current.dist))));
      const nr = start.current.rotation + (a - start.current.ang);
      onChange?.(layer.id, { scale: ns, rotation: nr });
    }
  };

  const onUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) start.current = null;
  };

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="absolute touch-none select-none cursor-grab active:cursor-grabbing"
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: `translate(-50%,-50%) scale(${layer.scale ?? 1}) rotate(${layer.rotation ?? 0}deg)`,
        zIndex: selected ? 60 : 30,
      }}
    >
      <div className={`relative ${selected ? 'outline outline-2 outline-white rounded' : ''}`}>
        {children}
        {selected && onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
            className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold z-[70] shadow-lg"
            aria-label="Supprimer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}