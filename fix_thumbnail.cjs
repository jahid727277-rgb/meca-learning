const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

const target = `      {currentLesson ? (
        currentLesson.type === 'video' && (
          <div className="w-full bg-black z-20 relative">
            <div className="mx-auto max-w-4xl w-full">
              {currentLesson.videoUrl ? (
                <YouTubePlayer videoUrl={currentLesson.videoUrl} />
              ) : (
                <div className="text-center text-neutral-400 p-8 space-y-2 aspect-video flex flex-col justify-center items-center w-full h-full bg-neutral-900">
                  <Video className="w-12 h-12 text-neutral-600 mx-auto animate-pulse" />
                  <p className="text-sm font-semibold">Video Unavailable</p>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="w-full bg-neutral-900 z-20 relative flex items-center justify-center overflow-hidden max-h-[500px]">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-70 aspect-[21/9] sm:aspect-[21/7]" />
        </div>
      )}`;

const replacement = `      {currentLesson ? (
        currentLesson.type === 'video' && (
          <div className="w-full bg-black z-20 relative">
            <div className="mx-auto max-w-4xl w-full">
              {currentLesson.videoUrl ? (
                <YouTubePlayer videoUrl={currentLesson.videoUrl} />
              ) : (
                <div className="text-center text-neutral-400 p-8 space-y-2 aspect-video flex flex-col justify-center items-center w-full h-full bg-neutral-900">
                  <Video className="w-12 h-12 text-neutral-600 mx-auto animate-pulse" />
                  <p className="text-sm font-semibold">Video Unavailable</p>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="w-full bg-black z-20 relative">
          <div className="mx-auto max-w-4xl w-full flex items-center justify-center overflow-hidden aspect-video bg-neutral-900">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-70" />
          </div>
        </div>
      )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Classroom.tsx', content);
