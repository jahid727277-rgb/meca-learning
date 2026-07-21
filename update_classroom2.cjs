const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

// 1. Remove the global video player placeholder for the thumbnail
content = content.replace(
`      ) : (
        <div className="w-full bg-black z-20 relative">
          <div className="mx-auto max-w-4xl w-full flex items-center justify-center overflow-hidden aspect-video bg-neutral-900">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-70" />
          </div>
        </div>
      )}`,
`      ) : null}`
);

// 2. Add the thumbnail to the Left Column when !currentLesson
const leftColumnStart = `          {/* LEFT COLUMN - Lesson Player Content (Col 8) */}\n          <section className="lg:col-span-8 space-y-4">`;
const leftColumnReplacement = `${leftColumnStart}
            {!currentLesson && (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden">
                <div className="w-full aspect-[21/9] sm:aspect-video bg-neutral-900 relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="p-6 sm:p-8 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">{course.title}</h2>
                  <p className="text-neutral-600 text-sm leading-relaxed">{course.description}</p>
                </div>
              </div>
            )}`;
content = content.replace(leftColumnStart, leftColumnReplacement);

// 3. Update the Right Column to hide Class PDF if !currentLesson
const rightColumnTarget = `              <button
                onClick={onBack}
                className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-orange-600 transition-colors cursor-pointer border border-neutral-200"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                {currentLesson?.classNotePdfUrl ? (
                  <a
                    href={currentLesson.classNotePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span>Class PDF</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setShowPdfAlert(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <span>Class PDF</span>
                  </button>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800 leading-tight">{course.title}</h2>
            </div>`;

const rightColumnReplacement = `              <button
                onClick={onBack}
                className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-orange-600 transition-colors cursor-pointer border border-neutral-200"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {currentLesson ? (
                <div className="flex items-center gap-2">
                  {currentLesson.classNotePdfUrl ? (
                    <a
                      href={currentLesson.classNotePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span>Class PDF</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => setShowPdfAlert(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-neutral-400" />
                      <span>Class PDF</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 ml-4 flex justify-end">
                  <h2 className="text-sm font-bold text-neutral-800 leading-tight line-clamp-1">{course.title}</h2>
                </div>
              )}
            </div>
            
            {currentLesson && (
              <div>
                <h2 className="text-xl font-bold text-neutral-800 leading-tight">{course.title}</h2>
              </div>
            )}`;

content = content.replace(rightColumnTarget, rightColumnReplacement);

fs.writeFileSync('src/components/Classroom.tsx', content);
