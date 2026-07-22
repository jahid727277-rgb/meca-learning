import React, { useState, useEffect, useRef } from 'react';

interface ImageWithSkeletonProps {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  skeletonClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  style?: React.CSSProperties;
}

export default function ImageWithSkeleton({
  src,
  alt,
  className = '',
  containerClassName = '',
  skeletonClassName = '',
  onError,
  onLoad,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    if (imgRef.current && !imgRef.current.complete) {
      setIsLoading(false);
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      {/* Skeleton screen overlay with premium shimmering pulse */}
      {isLoading && (
        <>
          <style>{`
            @keyframes premium-shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            .premium-shimmer-bg {
              background: linear-gradient(90deg, #f3f4f6 25%, #f9fafb 50%, #f3f4f6 75%);
              background-size: 200% 100%;
              animation: premium-shimmer 1.6s infinite linear;
            }
          `}</style>
          <div 
            className={`absolute inset-0 premium-shimmer-bg ${skeletonClassName}`}
          />
        </>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        {...props}
      />
    </div>
  );
}

