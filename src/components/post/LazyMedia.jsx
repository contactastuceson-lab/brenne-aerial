import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import VideoPlayer from '@/components/post/VideoPlayer';

// ─── Inline autoplay video (plays muted when scrolled into view) ───────────
function InlineVideo({ url, onClick }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative cursor-pointer group w-full" onClick={onClick}>
      <video
        ref={videoRef}
        src={url}
        className="w-full h-auto max-h-[510px] object-cover transition-opacity duration-300"
        style={{ opacity: loaded ? 1 : 0 }}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setLoaded(true)}
      />
      {!loaded && <div className="w-full bg-white/[0.03]" style={{ aspectRatio: '16/9' }} />}
      {/* Muted indicator + tap hint */}
      <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-black/55 flex items-center justify-center pointer-events-none">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </div>
    </div>
  );
}

function LazyImage({ src, alt, className, onClick }) {
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
    <div ref={ref} className="relative w-full cursor-zoom-in" onClick={onClick}>
      {!loaded && inView && (
        <div className="absolute inset-0 animate-pulse bg-white/[0.03] rounded-inherit" style={{ minHeight: 120 }} />
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

// ─── Photo lightbox ─────────────────────────────────────────────────────────
function PhotoLightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
      >
        <X className="w-5 h-5 text-white" />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-[92vw] max-h-[92vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}

// Faux post minimal pour le player quand on n'a pas le post complet
function makeMinimalPost(url) {
  return { id: null, media_urls: [url], content: '', likes_count: 0, replies_count: 0 };
}

export default function LazyMedia({ urls = [], className = '', post = null, currentUser = null }) {
  const [videoPlayer, setVideoPlayer] = useState(null); // { post, url }
  const [lightbox, setLightbox] = useState(null); // url

  if (!urls.length) return null;
  const single = urls.length === 1;

  const openVideo = (url) => {
    setVideoPlayer({ post: post || makeMinimalPost(url), url });
  };

  return (
    <>
      <div className={`grid gap-1 rounded-2xl overflow-hidden border border-border ${single ? 'grid-cols-1' : 'grid-cols-2'} ${className}`}>
        {urls.slice(0, 4).filter(Boolean).map((url, i) => (
          <div key={i} className="relative overflow-hidden">
            {url.match(/\.(mp4|webm|ogg)$/i) ? (
              <InlineVideo url={url} onClick={() => openVideo(url)} />
            ) : (
              <LazyImage
                src={url}
                alt=""
                className={single ? 'w-full h-auto max-h-[510px] object-cover' : 'w-full h-auto max-h-56 object-cover'}
                onClick={() => setLightbox(url)}
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

      {videoPlayer && (
        <VideoPlayer
          initialPost={videoPlayer.post}
          initialUrl={videoPlayer.url}
          onClose={() => setVideoPlayer(null)}
          currentUser={currentUser}
        />
      )}

      {lightbox && <PhotoLightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}