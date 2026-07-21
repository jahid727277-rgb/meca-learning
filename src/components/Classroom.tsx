import React, { useState, useEffect } from 'react';
import { Course, Lesson, SyllabusSection, Enrollment } from '../types';
import YouTubePlayer from './YouTubePlayer';
import { 
  Play, Pause, ArrowLeft, CheckCircle, Circle, Video, 
  BookOpen, HelpCircle, ChevronRight, Sparkles, Trophy, Award, RotateCcw,
  FileText, X, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClassroomProps {
  course: Course;
  enrollment: Enrollment;
  onBack: () => void;
}

export default function Classroom({
  course,
  enrollment,
  onBack,
}: ClassroomProps) {
  // Find initial lesson
  const allLessons = course.syllabus.flatMap((s) => s.lessons);
  const initialLesson = allLessons[0];
  
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const initialSection = course.syllabus.find((s) => s.lessons.some((l) => l.id === initialLesson.id));
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [initialSection?.id || '']: true
  });

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showPdfAlert, setShowPdfAlert] = useState(false);

  useEffect(() => {
    // Reset video and quiz when lesson changes
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    window.scrollTo(0, 0);
  }, [currentLesson]);

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  // Quiz helper functions
  const handleAnswerSelect = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!currentLesson?.quiz) return;
    
    let correctCount = 0;
    currentLesson?.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / currentLesson?.quiz.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const totalLessons = allLessons.length;

  return (
    <div className="bg-neutral-50/30 min-h-screen">

      {/* Cinematic Global Video Player Area (Full Width under Navbar) */}
      {currentLesson ? (
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
      ) : null}

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          
          {/* LEFT COLUMN - Lesson Player Content (Col 8) */}
          <section className="lg:col-span-8 space-y-4">
            {!currentLesson && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
                <div className="w-full aspect-video bg-neutral-100 relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            {(currentLesson?.type === 'reading' || currentLesson?.type === 'quiz') && (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden">
              {/* VIDEO TYPE LESSON (TEXT CONTENT DESCRIPTION - REMOVED AS REQUESTED) */}

              {/* READING TYPE LESSON */}
              {currentLesson?.type === 'reading' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Reading Assignment
                    </span>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                    {currentLesson.title}
                  </h2>
                  
                  <div className="w-16 h-1 bg-orange-500 rounded-full" />

                  <div className="text-neutral-600 font-medium space-y-4 leading-relaxed pt-2 border-t border-neutral-50">
                    {currentLesson.content ? (
                      <div className="whitespace-pre-wrap select-text text-sm">
                        {currentLesson.content}
                      </div>
                    ) : (
                      <p className="italic text-neutral-400">This reading material is currently blank.</p>
                    )}
                  </div>
                </div>
              )}

              {/* QUIZ TYPE LESSON */}
              {currentLesson?.type === 'quiz' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        Interactive Quiz
                      </span>
                      <span className="text-neutral-400 text-xs font-semibold">Instant Grading</span>
                    </div>

                    {quizSubmitted && (
                      <div className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Score: {quizScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    {currentLesson.quiz?.map((q, qIdx) => {
                      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
                      return (
                        <div key={q.id} className="space-y-4">
                          <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                            {qIdx + 1}. {q.question}
                          </h3>

                          <div className="grid grid-cols-1 gap-2.5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedAnswers[q.id] === optIdx;
                              const isAnswerCorrect = q.correctAnswer === optIdx;
                              
                              let optBg = 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200';
                              let optText = 'text-neutral-700';

                              if (isSelected) {
                                optBg = 'bg-orange-50 border-orange-500';
                                optText = 'text-orange-950';
                              }

                              if (quizSubmitted) {
                                if (isAnswerCorrect) {
                                  optBg = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                                } else if (isSelected && !isCorrect) {
                                  optBg = 'bg-red-100 border-red-400 text-red-950';
                                } else {
                                  optBg = 'bg-neutral-50/50 opacity-60 border-neutral-200';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => handleAnswerSelect(q.id, optIdx)}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-xs border transition-all flex items-center justify-between ${optBg} ${optText}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && isAnswerCorrect && (
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
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
          <aside className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-3xl border border-neutral-100 shadow-xs space-y-4 sm:space-y-5 h-fit lg:sticky lg:top-24">
            {/* Actions & Course Title */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-orange-600 transition-colors cursor-pointer border border-neutral-200 shrink-0"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {!currentLesson && (
                  <h2 className="text-base sm:text-lg font-bold text-neutral-800 leading-tight line-clamp-1">{course.title}</h2>
                )}
              </div>
              
              {currentLesson && (
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
            
            {currentLesson && (
              <div>
                <h2 className="text-xl font-bold text-neutral-800 leading-tight">{course.title}</h2>
              </div>
            )}
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
                              className={`w-full text-left px-4 py-3.5 text-xs flex items-center justify-between gap-3 transition-all ${bgStyle} ${itemBorder}`}
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
                                  <span className={`text-xs leading-normal font-bold ${labelColor}`}>{les.title}</span>
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
}
