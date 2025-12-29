import React, { useEffect, useRef, useState } from 'react';

interface BlogCardCarouselProps {
  images?: string[];            // Array of image URLs (may be empty)
  fallback?: string;            // Fallback single image (image_url field)
  alt: string;                  // Alt text base (title)
  autoIntervalMs?: number;      // Auto advance interval
  autoRotate?: boolean;         // Enable / disable auto-rotation (accessibility preference)
  className?: string;           // Additional classes for outer container
  showIndicators?: boolean;     // Show bottom dots
  showArrows?: boolean;         // Show prev/next arrows (hover only)
  badge?: React.ReactNode;      // Optional overlay badge (e.g., Featured)
  enableKeyboard?: boolean;     // Allow arrow key navigation (default true)
}

// Lightweight carousel for blog listing cards.
// Accessible, pauses on hover/focus, minimal DOM (absolutely positioned slides).
const BlogCardCarousel: React.FC<BlogCardCarouselProps> = ({
  images = [],
  fallback,
  alt,
  autoIntervalMs = 4000,
  autoRotate = true,
  className = '',
  showIndicators = true,
  showArrows = false,
  badge,
  enableKeyboard = true
}) => {
  const effectiveImages = (images && images.length > 0 ? images : (fallback ? [fallback] : []))
    // Filter out empties / nulls defensively
    .filter(Boolean);

  const isVideoSrc = (src: string) => /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(src);
  const hasVideo = effectiveImages.some(isVideoSrc);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false); // becomes true when intersecting
  const [loaded, setLoaded] = useState<boolean[]>(() => effectiveImages.map(() => false));

  // Update loaded state array if image list length changes
  useEffect(() => {
    setLoaded(prev => {
      if (prev.length === effectiveImages.length) return prev;
      return effectiveImages.map((_, i) => prev[i] || false);
    });
  }, [effectiveImages]);

  // Clamp index if images change
  useEffect(() => {
    if (index >= effectiveImages.length) setIndex(0);
  }, [effectiveImages.length, index]);

  // IntersectionObserver to defer auto-rotation & image decoding until visible
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target); // one-shot
          }
        });
      },
      { root: null, threshold: 0.15, rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto advance (only when inView, autoRotate enabled, not paused)
  useEffect(() => {
    // If a post uses video, don't auto-rotate (prevents skipping while user plays/loads video).
    if (!autoRotate || hasVideo) return;
    if (!inView) return;
    if (effectiveImages.length <= 1) return; // nothing to rotate
    if (paused) return;
    intervalRef.current = window.setTimeout(() => {
      setIndex(prev => (prev + 1) % effectiveImages.length);
    }, autoIntervalMs);
    return () => {
      if (intervalRef.current) window.clearTimeout(intervalRef.current);
    };
  }, [index, paused, effectiveImages.length, autoIntervalMs, inView, autoRotate]);

  if (effectiveImages.length === 0) {
    // Placeholder (keeps layout stable)
    return (
      <div className={`relative w-full h-full bg-white/10 flex items-center justify-center text-xs text-white/40 ${className}`}>No Image</div>
    );
  }

  const goTo = (i: number) => setIndex(i % effectiveImages.length);
  const next = () => goTo((index + 1) % effectiveImages.length);
  const prev = () => goTo((index - 1 + effectiveImages.length) % effectiveImages.length);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableKeyboard) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
      setPaused(true); // pause auto-rotation after manual interaction
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
      setPaused(true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
      setPaused(true);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(effectiveImages.length - 1);
      setPaused(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full group/carousel ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label={`Image carousel for ${alt}${effectiveImages.length > 1 ? ` (slide ${index + 1} of ${effectiveImages.length})` : ''}`}
      aria-live="polite"
    >
      {effectiveImages.map((src, i) => {
        const isActive = i === index;
        const isLoaded = loaded[i];
        const shouldRender = inView || i === 0; // render first image immediately; others once in view
        const isVideo = isVideoSrc(src);
        return (
          <div key={src + i} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`} data-active={isActive ? 'true' : 'false'}>
            {shouldRender && (
              <>
                {isVideo ? (
                  <>
                    <video
                      src={src}
                      className="w-full h-full object-cover bg-black/40"
                      playsInline
                      preload={i === 0 ? 'metadata' : 'none'}
                      controls={isActive}
                      muted
                      onLoadedData={() => setLoaded(prev => {
                        const copy = [...prev];
                        copy[i] = true;
                        return copy;
                      })}
                    />
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-white/10 animate-pulse" aria-hidden="true" />
                    )}
                  </>
                ) : (
                  <>
                    <img
                      src={src}
                      alt={`${alt} ${effectiveImages.length > 1 ? `– media ${i + 1} of ${effectiveImages.length}` : ''}`}
                      className={`w-full h-full object-cover select-none ${!isLoaded ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-[filter,transform] duration-700`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                      onLoad={() => setLoaded(prev => {
                        const copy = [...prev];
                        copy[i] = true;
                        return copy;
                      })}
                    />
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-white/10 animate-pulse" aria-hidden="true" />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Gradient overlay for readability (subtle) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent pointer-events-none" />

      {badge}

  {showArrows && effectiveImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

  {showIndicators && effectiveImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {effectiveImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-azure-400' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogCardCarousel;
