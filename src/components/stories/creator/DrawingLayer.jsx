import { useRef } from 'react';

// Calque de dessin à main levée (SVG, points en % du canvas).
// `strokes`: [{ color, size, points: [{x,y}] }] ; `active` active la saisie.
export default function DrawingLayer({ strokes, color, size, active, canvasRef, onChange, onClear }) {
  const drawing = useRef(false);
  const cur = useRef(null);

  const pct = (e) => {
    const b = canvasRef.current?.getBoundingClientRect();
    if (!b) return null;
    return { x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 };
  };

  const down = (e) => {
    if (!active) return;
    e.stopPropagation();
    drawing.current = true;
    const p = pct(e);
    if (!p) return;
    cur.current = { color, size, points: [p] };
    onChange([...strokes, { ...cur.current, points: [...cur.current.points] }]);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const p = pct(e);
    if (!p) return;
    cur.current.points.push(p);
    const next = [...strokes];
    next[next.length - 1] = { ...cur.current, points: [...cur.current.points] };
    onChange(next);
  };
  const up = () => { drawing.current = false; cur.current = null; };

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ touchAction: active ? 'none' : 'auto', pointerEvents: active ? 'auto' : 'none' }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={up}
    >
      {strokes.map((s, i) => (
        <polyline
          key={i}
          points={s.points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')}
          fill="none"
          stroke={s.color}
          strokeWidth={s.size}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}