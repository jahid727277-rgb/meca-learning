import React, { useState, useEffect } from 'react';
import { Course, Lesson, SyllabusSection, Enrollment } from '../types';
import PlyrPlayer from './PlyrPlayer';
import { 
  Play, Pause, ArrowLeft, CheckCircle, Circle, Video, 
  BookOpen, HelpCircle, ChevronRight, Sparkles, Trophy, Award, RotateCcw
} from 'lucide-react';

interface ClassroomProps {
  course: Course;
  enrollment: Enrollment;
  onUpdateEnrollment: (courseId: string, completedLessonIds: string[], currentLessonId: string) => void;
  onAddHours: (minutes: number) => void;
  onBack: () => void;
  onUnlockCertificate: (courseId: string) => void;
}

export default function Classroom({
  course,
  enrollment,
  onUpdateEnrollment,
  onAddHours,
  onBack,
  onUnlockCertificate,
}: ClassroomProps) {
  // Find initial lesson
  const allLessons = course.syllabus.flatMap((s) => s.lessons);
  const initialLesson = allLessons.find((l) => l.id === enrollment.currentLessonId) || allLessons[0];
  
  const [currentLesson, setCurrentLesson] = useState<Lesson>(initialLesson);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    // Reset video and quiz when lesson changes
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, [currentLesson]);

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleMarkComplete = () => {
    // Add lesson ID to completed list if not already present
    const completed = [...enrollment.completedLessons];
    if (!completed.includes(currentLesson.id)) {
      completed.push(currentLesson.id);
      
      // Simulate adding study hours: 15 minutes for videos/readings, 10 for quizzes
      const mins = currentLesson.type === 'quiz' ? 10 : 15;
      onAddHours(mins);
    }

    // Determine what the next lesson is
    const currentIdx = allLessons.findIndex((l) => l.id === currentLesson.id);
    const nextLesson = allLessons[currentIdx + 1];
    const nextLessonId = nextLesson ? nextLesson.id : currentLesson.id;

    // Update parent state
    onUpdateEnrollment(course.id, completed, nextLessonId);

    // If there is a next lesson, switch to it, else trigger certificate check if completed
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    } else {
      // Calculate final progress
      const finalProgress = (completed.length / allLessons.length) * 100;
      if (finalProgress >= 100) {
        onUnlockCertificate(course.id);
      }
    }
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
    if (!currentLesson.quiz) return;
    
    let correctCount = 0;
    currentLesson.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / currentLesson.quiz.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const isCurrentLessonCompleted = enrollment.completedLessons.includes(currentLesson.id);
  const totalLessons = allLessons.length;
  const completedLessonsCount = enrollment.completedLessons.length;
  const progressPercent = (completedLessonsCount / totalLessons) * 100;

  return (
    <div className="bg-neutral-50/30 min-h-screen">
      {/* Classroom header status bar */}
      <div className="bg-white border-b border-orange-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                Classroom Portal • {course.category}
              </span>
              <h1 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-none">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Progress gauge */}
          <div className="flex items-center gap-3 bg-orange-50/20 p-2.5 rounded-2xl border border-orange-100/40">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Course Progress</span>
              <span className="text-xs font-black text-orange-600">
                {completedLessonsCount} / {totalLessons} Lessons ({progressPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="relative w-10 h-10 flex items-center justify-center">
              {/* Simple visual SVG radial loader */}
              <svg className="w-full h-full transform -rotate-95">
                <circle cx="20" cy="20" r="16" className="stroke-neutral-100 fill-none" strokeWidth="3" />
                <circle 
                  cx="20" 
                  cy="20" 
                  r="16" 
                  className="stroke-orange-500 fill-none transition-all duration-700" 
                  strokeWidth="3" 
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressPercent / 100)}`}
                />
              </svg>
              <span className="absolute text-[9px] font-extrabold text-neutral-700">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main learning split board */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN - Lesson Player Content (Col 8) */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* 1. VIDEO TYPE LESSON */}
            {currentLesson.type === 'video' && (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden">
                {/* Plyr.js Video Player Integration */}
                <div className="w-full bg-neutral-950">
                  {currentLesson.videoUrl ? (
                    <PlyrPlayer videoUrl={currentLesson.videoUrl} />
                  ) : (
                    <div className="text-center text-neutral-400 p-8 space-y-2 aspect-video flex flex-col justify-center items-center">
                      <Video className="w-12 h-12 text-neutral-600 mx-auto animate-pulse" />
                      <p className="text-sm font-semibold">Video Unavailable</p>
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Video Lecture
                    </span>
                    <span className="text-neutral-400 text-xs font-semibold">{currentLesson.duration}</span>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                    {currentLesson.title}
                  </h2>
                  <div className="prose prose-sm prose-orange text-neutral-600 font-medium leading-relaxed max-w-none pt-2 border-t border-neutral-50">
                    <p>{currentLesson.content}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. READING TYPE LESSON */}
            {currentLesson.type === 'reading' && (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Reading Assignment
                  </span>
                  <span className="text-neutral-400 text-xs font-semibold">{currentLesson.duration}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  {currentLesson.title}
                </h2>
                
                <div className="w-16 h-1 bg-orange-500 rounded-full" />

                {/* Simulated formatted reading content */}
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

            {/* 3. QUIZ TYPE LESSON */}
            {currentLesson.type === 'quiz' && (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs p-6 sm:p-8 space-y-6">
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
                      disabled={Object.keys(selectedAnswers).length < (currentLesson.quiz?.length || 0)}
                      className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Submit Answers
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* COMPLETE LESSON ACTION BUTTON BAR */}
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-neutral-100 shadow-2xs">
              <span className="text-xs text-neutral-500 font-semibold">
                {isCurrentLessonCompleted 
                  ? '✅ You have finished this class lesson segment.' 
                  : '⭐️ Complete the module to log study hours.'}
              </span>

              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md"
              >
                <span>{isCurrentLessonCompleted ? 'Next Lesson' : 'Complete & Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </section>

          {/* RIGHT COLUMN - Syllabus Navigation Hub (Col 4) */}
          <aside className="lg:col-span-4 bg-white p-5 rounded-3xl border border-neutral-100 shadow-xs space-y-6 max-h-[80vh] overflow-y-auto sticky top-24">
            <div>
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Syllabus Directory</h3>
              <p className="text-[11px] text-neutral-500 font-medium">Select any module below to load materials instantly.</p>
            </div>

            <div className="space-y-6">
              {course.syllabus.map((sec, secIdx) => (
                <div key={sec.id} className="space-y-2.5">
                  <h4 className="text-xs font-bold text-neutral-800 tracking-tight uppercase">
                    {sec.title}
                  </h4>
                  
                  <div className="space-y-1">
                    {sec.lessons.map((les) => {
                      const isSelected = currentLesson.id === les.id;
                      const isDone = enrollment.completedLessons.includes(les.id);
                      
                      let iconColor = 'text-neutral-400';
                      let labelColor = 'text-neutral-600 hover:text-neutral-900';
                      let bgStyle = 'hover:bg-neutral-50/50';

                      if (isDone) {
                        iconColor = 'text-emerald-500';
                      }
                      if (isSelected) {
                        bgStyle = 'bg-orange-50 text-orange-950 font-semibold';
                        labelColor = 'text-orange-950';
                      }

                      return (
                        <button
                          key={les.id}
                          onClick={() => handleLessonSelect(les)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 transition-all ${bgStyle}`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {isDone ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-neutral-300 shrink-0" />
                            )}
                            <span className={`truncate leading-none ${labelColor}`}>{les.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 text-[10px] text-neutral-400 font-semibold">
                            {les.type === 'video' && <Video className="w-3.5 h-3.5 text-neutral-400" />}
                            {les.type === 'reading' && <BookOpen className="w-3.5 h-3.5 text-neutral-400" />}
                            {les.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />}
                            <span>{les.duration}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
