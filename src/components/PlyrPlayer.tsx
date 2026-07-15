import React, { useEffect, useRef } from 'react';

interface PlyrPlayerProps {
  videoUrl: string;
}

export default function PlyrPlayer({ videoUrl }: PlyrPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Detect if this is a YouTube URL
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('embed');
    
    // Check if the Plyr library is loaded globally
    const Plyr = (window as any).Plyr;

    if (Plyr && containerRef.current) {
      if (isYouTube) {
        // Extract YouTube Video ID
        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        } else if (videoUrl.includes('embed/')) {
          const parts = videoUrl.split('embed/');
          if (parts[1]) {
            videoId = parts[1].split('?')[0];
          }
        }

        if (videoId) {
          containerRef.current.innerHTML = `
            <div class="plyr__video-embed">
              <iframe
                src="https://www.youtube.com/embed/${videoId}?origin=${encodeURIComponent(window.location.origin)}&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1"
                allowfullscreen
                allowtransparency
                allow="autoplay"
              ></iframe>
            </div>
          `;
          const target = containerRef.current.querySelector('.plyr__video-embed');
          if (target) {
            playerRef.current = new Plyr(target, {
              ratio: '16:9',
              youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
            });
          }
        } else {
          // Fallback if ID is missing but YouTube-like URL is present
          containerRef.current.innerHTML = `
            <div class="plyr__video-embed">
              <iframe
                src="${videoUrl}"
                allowfullscreen
                allowtransparency
                allow="autoplay"
              ></iframe>
            </div>
          `;
          const target = containerRef.current.querySelector('.plyr__video-embed');
          if (target) {
            playerRef.current = new Plyr(target, { ratio: '16:9' });
          }
        }
      } else {
        // Direct HTML5 mp4/webm/ogg video url
        containerRef.current.innerHTML = `
          <video playsinline controls class="w-full h-full rounded-xl">
            <source src="${videoUrl}" type="video/mp4" />
          </video>
        `;
        const videoElement = containerRef.current.querySelector('video');
        if (videoElement) {
          playerRef.current = new Plyr(videoElement, {
            ratio: '16:9',
            controls: [
              'play-large', 'play', 'progress', 'current-time', 
              'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ]
          });
        }
      }
    } else {
      // Direct Iframe or native video element fallback
      if (isYouTube) {
        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        }
        const srcUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
        containerRef.current.innerHTML = `
          <div class="aspect-video w-full rounded-xl overflow-hidden shadow-sm">
            <iframe
              src="${srcUrl}"
              class="w-full h-full"
              allowfullscreen
              allow="autoplay; encrypted-media"
            ></iframe>
          </div>
        `;
      } else {
        containerRef.current.innerHTML = `
          <video src="${videoUrl}" controls class="w-full rounded-xl aspect-video bg-neutral-900 shadow-sm" />
        `;
      }
    }

    // Cleanup Plyr instance on unmount
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Silent catch
        }
      }
    };
  }, [videoUrl]);

  return (
    <div className="w-full overflow-hidden rounded-xl bg-black border border-neutral-100 shadow-sm relative aspect-video">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
