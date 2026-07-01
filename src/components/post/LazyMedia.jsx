import { useRef, useState, useEffect } from 'react';

function LazyImage({ src, alt, className }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full bg-white/5">
      {/* Placeholder shimmer */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-white/8 rounded-inherit" style={{ minHeight: 120 }} />
      )}
      {inView && (
        <img
          src={src}
          alt={alt || ''}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

export default function LazyMedia({ urls = [], className = '' }) {
  if (!urls.length) return null;
  const single = urls.length === 1;

  return (
    <div className={`grid gap-1 rounded-2xl overflow-hidden ${single ? 'grid-cols-1' : 'grid-cols-2'} ${className}`}>
      {urls.slice(0, 4).map((url, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5">
          {url.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={url}
              controls
              preload="none"
              className="w-full h-auto max-h-[512px] object-contain"
            />
          ) : (
            <LazyImage
              src={url}
              alt=""
              className={`w-full h-auto ${single ? 'object-contain' : 'max-h-48 object-cover'}`}
            />
          )}
          {i === 3 && urls.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">+{urls.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}