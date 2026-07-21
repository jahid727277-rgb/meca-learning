const fs = require('fs');
const content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

let newContent = content.replace(
  'const [currentLesson, setCurrentLesson] = useState<Lesson>(initialLesson);',
  'const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);'
);

newContent = newContent.replace(
  'if (!currentLesson.quiz) return;',
  'if (!currentLesson?.quiz) return;'
);

newContent = newContent.replace(
  'currentLesson.quiz.forEach',
  'currentLesson?.quiz.forEach'
);

newContent = newContent.replace(
  'currentLesson.quiz.length',
  'currentLesson?.quiz.length'
);

newContent = newContent.replace(
  "{currentLesson.type === 'video' && (",
  `{currentLesson ? (
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
        <div className="w-full bg-neutral-900 z-20 relative flex items-center justify-center overflow-hidden h-[300px] sm:h-[400px] lg:h-[500px]">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
        </div>
      )}`
);

// We need to carefully remove the old player to avoid duplication since we replaced the condition above.
// Actually, it's better to regex replace the whole cinematic block.
