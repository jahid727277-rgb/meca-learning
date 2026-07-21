import React, { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

interface YouTubePlayerProps {
  videoUrl: string;
}

export default function YouTubePlayer({ videoUrl }: YouTubePlayerProps) {
  const [playState, setPlayState] = useState<'idle' | 'loading' | 'playing'>('idle');

  // Extract YouTube Video ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isDirectVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('mov_bbb.mp4') || url.includes('movie.mp4');
  };

  const videoId = getYouTubeId(videoUrl);
  const isDirect = isDirectVideo(videoUrl);

  // Reset state when url changes
  useEffect(() => {
    setPlayState('idle');
  }, [videoUrl]);

  if (!videoUrl || (!videoId && !isDirect)) {
    return (
      <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-900 animate-pulse flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-neutral-400 dark:text-neutral-600 animate-spin" />
        </div>
        <div className="space-y-2 w-3/4 max-w-xs">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video relative bg-black group overflow-hidden rounded-none shadow-lg select-none">
      {/* 1. INITIAL IDLE STATE: SHOWS THUMBNAIL WITH CUSTOM PLAY BUTTON */}
      {playState === 'idle' && (
        <div 
          onClick={() => setPlayState('loading')}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900 z-30 cursor-pointer"
        >
          {videoId ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
              alt="Video Thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-neutral-800 flex items-center justify-center">
              <Play className="w-16 h-16 text-neutral-600 opacity-20" />
            </div>
          )}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1 sm:ml-2" />
          </div>
        </div>
      )}

      {/* 2. LOADING STATE: SHOWS THUMBNAIL WITH SPINNING LOADER */}
      {playState === 'loading' && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900 z-40 cursor-wait">
          {videoId ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
              alt="Video Thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-neutral-800 opacity-30" />
          )}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-600/90 text-white rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-white" />
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD NATIVE YOUTUBE IFRAME OR HTML5 VIDEO */}
      {playState !== 'idle' && (
        <>
          {videoId ? (
            <iframe
              className={`w-full h-full absolute inset-0 block z-10 ${playState === 'loading' ? 'opacity-0' : 'opacity-100'}`}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
              onLoad={() => setPlayState('playing')}
            />
          ) : (
            <video 
              src={videoUrl} 
              autoPlay 
              controls 
              className={`w-full h-full absolute inset-0 block z-10 bg-black ${playState === 'loading' ? 'opacity-0' : 'opacity-100'}`}
              controlsList="nodownload"
              onLoadedData={() => setPlayState('playing')}
            />
          )}
        </>
      )}
    </div>
  );
}
