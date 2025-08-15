import React, { useEffect, useRef, useState } from 'react';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  initialBlur?: boolean;
  skeleton?: boolean;
  revealScale?: boolean;
  lazy?: boolean;
  aspectClass?: string;
  wrapperClassName?: string;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  initialBlur = true,
  skeleton = true,
  revealScale = true,
  lazy = true,
  aspectClass,
  wrapperClassName = '',
  className = '',
  ...rest
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(!lazy);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!lazy || inView) return;
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.15, rootMargin: '150px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [lazy, inView]);

  return (
    <div ref={ref} className={`relative ${aspectClass || ''} ${wrapperClassName}`.trim()}>
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={[
            'w-full h-full object-cover',
            initialBlur && !loaded ? 'blur-sm scale-105' : 'blur-0',
            loaded && revealScale ? 'scale-100 transition-[filter,transform] duration-700 ease-out' : 'transition-[filter,transform] duration-700 ease-out',
            className
          ].join(' ')}
          loading={lazy ? 'lazy' : 'eager'}
          {...rest}
        />
      )}
      {skeleton && (!loaded || !inView) && (
        <div className="absolute inset-0 bg-white/10 animate-pulse rounded-md" aria-hidden="true" />
      )}
    </div>
  );
};

export default ProgressiveImage;
