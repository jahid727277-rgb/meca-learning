import React, { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import ImageWithSkeleton from './ImageWithSkeleton';

interface YouTubePlayerProps {
  videoUrl: string;
}

export default function YouTubePlayer({ videoUrl }: YouTubePlayerProps) {
  const [playState, setPlayState] = useState<'idle' | 'loading' | 'playing'>('idle');

  // Extract YouTube Video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  // Reset state when url changes
  useEffect(() => {
    setPlayState('idle');
  }, [videoUrl]);

  if (!videoId) return null;

  return (
    <div className="w-full aspect-video relative bg-black group overflow-hidden rounded-none shadow-lg select-none">
      {/* 1. INITIAL IDLE STATE: SHOWS THUMBNAIL WITH CUSTOM PLAY BUTTON */}
      {playState === 'idle' && (
        <div 
          onClick={() => setPlayState('loading')}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900 z-30 cursor-pointer"
        >
          <ImageWithSkeleton
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
            alt="Video Thumbnail"
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
            containerClassName="absolute inset-0 w-full h-full"
          />
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1 sm:ml-2" />
          </div>
        </div>
      )}

      {/* 2. LOADING STATE: SHOWS THUMBNAIL WITH SPINNING LOADER */}
      {playState === 'loading' && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900 z-30 cursor-wait">
          <ImageWithSkeleton
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
            alt="Video Thumbnail"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            containerClassName="absolute inset-0 w-full h-full"
          />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-600/90 text-white rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-white" />
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD NATIVE YOUTUBE IFRAME */}
      {playState !== 'idle' && (
        <iframe
          className="w-full h-full absolute inset-0 block z-10"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
          onLoad={() => {
            if (playState === 'loading') {
              setPlayState('playing');
            }
          }}
        />
      )}
    </div>
  );
}
