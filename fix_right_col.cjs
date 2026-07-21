const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

const target = `              {currentLesson ? (
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

const replacement = `              {currentLesson && (
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
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-neutral-800 leading-tight">{course.title}</h2>
            </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Classroom.tsx', content);
