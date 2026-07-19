import React, { useState } from 'react';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

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
      {/* Skeleton screen overlay with shimmering pulse */}
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center ${skeletonClassName}`}
        >
          {/* Subtle logo or visual indicator in the middle of skeleton (optional) */}
          <div className="w-8 h-8 rounded-full border-2 border-neutral-300/40 border-t-neutral-400 animate-spin" />
        </div>
      )}

      {/* Actual image */}
      <img
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
