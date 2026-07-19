import React, { useState, useEffect } from 'react';
import { Course, Lesson, SyllabusSection, Enrollment } from '../types';
import YouTubePlayer from './YouTubePlayer';
import { 
  Play, Pause, ArrowLeft, CheckCircle, Circle, Video, 
  BookOpen, HelpCircle, ChevronRight, Sparkles, Trophy, Award, RotateCcw,
  FileText, X, ExternalLink
} from 'lucide-react';

const LESSON_NOTES: { [lessonId: string]: { title: string; content: string; pdfUrl?: string } } = {
  'les-1': {
    title: 'Generative AI Foundations Class Notes',
    content: `### 1. The Generative Paradigm Shift
Traditional programming is explicit and rule-based. Generative AI is probabilistic, built on predicting patterns from massive internet-scale data.

### 2. Foundational LLM Terms
* **LLMs (Large Language Models)**: Deep neural networks (Transformers) trained to predict the next word or token.
* **Tokens**: The basic units of text processed by LLMs (~4 characters per token).
* **Context Window**: The memory size of the model. Gemini Pro has a massive context window of 1 million to 2 million tokens, enabling complex reasoning over whole codebases.

### 3. Recommended Reading
Read "Attention Is All You Need" (Vaswani et al.) to understand the Transformer architecture that makes all of this possible.`,
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf'
  },
  'les-2': {
    title: 'LLM Hyper-parameters Class Notes',
    content: `### 1. Temperature Control
* **Low Temperature (0.0 - 0.2)**: Highly deterministic, precise, and logical. Ideal for coding, mathematical, or structural tasks.
* **High Temperature (0.7 - 1.0)**: Highly creative, random, and diverse. Ideal for brainstorming, fiction, or creative writing.

### 2. Top-K and Top-P Sampling
* **Top-K**: Restricts the selection to the 'K' most likely tokens.
* **Top-P (Nucleus Sampling)**: Dynamically selects the minimum set of tokens whose cumulative probability exceeds the value 'P'.

### 3. Recommended Tools
Use Google AI Studio to experiment with these sliders in real-time.`,
    pdfUrl: 'https://ai.google.dev/gemini-api/docs/quickstart'
  },
  'les-5': {
    title: 'Structured Output Formats Class Notes',
    content: `### 1. Why Structured Outputs?
For web apps and APIs, raw text output is unpredictable. We need formatted JSON or XML to parse details safely into JavaScript objects.

### 2. Best Practices
* Always provide a strict JSON Schema description to the Gemini API.
* Use XML delimiters in prompts like \`<result>...</result>\` for easier regex extraction.
* Handle invalid JSON exceptions gracefully in your catch blocks.`,
    pdfUrl: 'https://ai.google.dev/gemini-api/docs/structured-outputs'
  },
  'les-202-1': {
    title: 'ReAct Loop Mechanics Class Notes',
    content: `### 1. The ReAct Pattern (Reasoning + Acting)
Instead of returning a final answer directly, the agent follows a cycle:
1. **Thought**: Reason about the user's request.
2. **Action**: Choose which tool to use and generate its exact parameters.
3. **Observation**: Read the result returned by the executed tool.

### 2. Avoiding Infinite Loops
Set a maximum loop count (e.g. max 5 tool calls) to prevent the agent from running indefinitely and exhausting your API budget.`,
    pdfUrl: 'https://arxiv.org/pdf/2210.03629.pdf'
  },
  'les-ai-1': {
    title: 'Document Pipelines Class Notes',
    content: `### 1. Document Parsing & Semantic Chunking
* Parse PDFs or webhooks into clean text.
* Split text into semantic chunks of ~500 tokens with 10% overlap to preserve context boundaries.

### 2. Workflow Orchestration
Use event queues or reliable trigger models to process documents asynchronously without freezing the user interface.`,
    pdfUrl: 'https://ai.google.dev/gemini-api/docs/document-processing'
  }
};

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
  const [showClassNotes, setShowClassNotes] = useState<boolean>(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    // Reset video and quiz when lesson changes
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const note = LESSON_NOTES[currentLesson.id];

  return (
    <div className="bg-neutral-50/30 min-h-screen">
      {/* Cinematic Global Video Player Area (Full Width under Navbar) */}
      {currentLesson.type === 'video' && (
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
      )}

      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN - Lesson Player Content (Col 8) */}
          <section className="lg:col-span-8 space-y-4">
            
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden">
              {/* VIDEO TYPE LESSON (TEXT CONTENT DESCRIPTION - REMOVED AS REQUESTED) */}

              {/* READING TYPE LESSON */}
              {currentLesson.type === 'reading' && (
                <div className="p-6 sm:p-8 space-y-6">
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
              {currentLesson.type === 'quiz' && (
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
                        disabled={Object.keys(selectedAnswers).length < (currentLesson.quiz?.length || 0)}
                        className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Submit Answers
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* INTEGRATED CONTROL TOOLBAR */}
              <div className="flex items-center justify-between bg-white px-5 py-4 border-t border-neutral-100">
                {/* Left Side: Back Arrow Button */}
                <button
                  onClick={onBack}
                  className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-orange-600 transition-colors cursor-pointer border border-neutral-100"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                 {/* Right Side: Class Notes Button Only */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowClassNotes(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span>Class Note</span>
                  </button>
                </div>
              </div>
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

      {/* Class Note Modal Overlay */}
      {showClassNotes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 leading-tight">
                  {note?.title || 'Class Notes'}
                </h3>
              </div>
              <button
                onClick={() => setShowClassNotes(false)}
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto font-sans text-neutral-700 leading-relaxed space-y-4">
              {note ? (
                <div className="prose prose-sm prose-orange">
                  <div className="whitespace-pre-line text-xs sm:text-sm">
                    {note.content}
                  </div>
                </div>
              ) : (
                <p className="text-sm italic text-neutral-400 text-center py-6">
                  This class does not have specific structured notes attached yet. Check back soon!
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-2 bg-neutral-50/30">
              {note?.pdfUrl && (
                <a
                  href={note.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Reference PDF
                </a>
              )}
              <button
                onClick={() => setShowClassNotes(false)}
                className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
