import { useRef, useState, useEffect } from 'react';
import VideoPlayer from '@/components/post/VideoPlayer';

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

// Faux post minimal pour le player quand on n'a pas le post complet
function makeMinimalPost(url) {
  return { id: null, media_urls: [url], content: '', likes_count: 0, replies_count: 0 };
}

export default function LazyMedia({ urls = [], className = '', post = null }) {
  const [videoPlayer, setVideoPlayer] = useState(null); // { post, url }
  if (!urls.length) return null;
  const single = urls.length === 1;

  const openVideo = (url) => {
    setVideoPlayer({ post: post || makeMinimalPost(url), url });
  };

  return (
    <>
      <div className={`grid gap-1 rounded-2xl overflow-hidden ${single ? 'grid-cols-1' : 'grid-cols-2'} ${className}`}>
        {urls.slice(0, 4).map((url, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5">
            {url.match(/\.(mp4|webm|ogg)$/i) ? (
              <div
                className="relative cursor-pointer group"
                onClick={() => openVideo(url)}
              >
                <video
                  src={url}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-auto max-h-[512px] object-contain pointer-events-none"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white fill-white ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
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

      {videoPlayer && (
        <VideoPlayer
          initialPost={videoPlayer.post}
          initialUrl={videoPlayer.url}
          onClose={() => setVideoPlayer(null)}
        />
      )}
    </>
  );
}