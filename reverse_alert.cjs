const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

const regex = /\{\/\* PDF Alert Modal \*\/\}\s*<AnimatePresence>[\s\S]*?<\/AnimatePresence>\s*<\/div>\s*\);\s*\}/;

content = content.replace(regex, `    </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quiz Control Bar */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-100">
                    {quizSubmitted ? (
                      <button
                        onClick={handleResetQuiz}
                        className="flex items-center gap-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry Quiz
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(selectedAnswers).length < (currentLesson?.quiz?.length || 0)}
                        className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Submit Answers
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </section>

          {/* RIGHT COLUMN - Topic Accordion Hub (Col 4) */}
          <aside className="lg:col-span-4 bg-white p-5 rounded-3xl border border-neutral-100 shadow-xs space-y-5 h-fit lg:sticky lg:top-24">
            {/* Actions & Course Title */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <button
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
            </div>
            <div className="space-y-3">
              {course.syllabus.map((sec) => {
                const isExpanded = !!expandedSections[sec.id];
                return (
                  <div key={sec.id} className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {/* Accordion Toggle Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedSections((prev) => ({
                          ...prev,
                          [sec.id]: !prev[sec.id],
                        }));
                      }}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-neutral-800 tracking-tight">
                        {sec.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-900 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-900 shrink-0" />
                      )}
                    </button>

                    {/* Expandable content containing topic videos/lessons */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100 bg-neutral-50/30 divide-y divide-neutral-100/60">
                        {sec.lessons.map((les) => {
                          const isSelected = currentLesson?.id === les.id;
                          
                          let bgStyle = 'hover:bg-neutral-100/60';
                          let labelColor = 'text-neutral-600 hover:text-neutral-900';
                          let itemBorder = 'border-l-2 border-transparent';

                          if (isSelected) {
                            bgStyle = 'bg-orange-50/80 text-orange-950 font-extrabold';
                            labelColor = 'text-orange-950';
                            itemBorder = 'border-l-2 border-orange-500 bg-orange-50/40';
                          }

                          return (
                            <button
                              key={les.id}
                              onClick={() => handleLessonSelect(les)}
                              className={\`w-full text-left px-4 py-3.5 text-xs flex items-center justify-between gap-3 transition-all \${bgStyle} \${itemBorder}\`}
                            >
                              <div className="flex items-start gap-2.5">
                                {isSelected ? (
                                  <Circle className="w-4 h-4 text-orange-500 shrink-0 fill-orange-50 mt-0.5" />
                                ) : (
                                  <Circle className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                                )}
                                
                                <div className="flex items-start gap-2">
                                  <span className="shrink-0 text-neutral-400 mt-0.5">
                                    {les.type === 'video' && <Video className="w-3.5 h-3.5" />}
                                    {les.type === 'reading' && <BookOpen className="w-3.5 h-3.5" />}
                                    {les.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5" />}
                                  </span>
                                  <span className={\`text-xs leading-normal font-bold \${labelColor}\`}>{les.title}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {sec.lessons.length === 0 && (
                          <div className="px-4 py-3.5 text-xs text-neutral-400 font-semibold italic text-center">
                            কোনো লেসন পাওয়া যায়নি
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

        </div>
      </div>
      
      {/* PDF Alert Modal */}
      <AnimatePresence>
        {showPdfAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPdfAlert(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-neutral-100 max-w-sm w-full p-6 relative z-10"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">PDF Not Available</h3>
                <p className="text-sm text-neutral-500 font-medium">
                  There is no PDF available for this class.
                </p>
                <button
                  onClick={() => setShowPdfAlert(false)}
                  className="mt-4 w-full px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}`);

fs.writeFileSync('src/components/Classroom.tsx', content);
