export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type LessonType = 'video' | 'quiz' | 'reading';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of options array
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: LessonType;
  videoUrl?: string; // e.g. for mock embed or custom video placeholder
  content?: string;  // markdown/text content for reading lessons
  quiz?: QuizQuestion[];
}

export interface SyllabusSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Instructor {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: Instructor;
  category: string;
  level: Level;
  rating: number;
  reviewCount: number;
  duration: string;
  lessonsCount: number;
  price: number;
  thumbnail: string;
  tags: string[];
  syllabus: SyllabusSection[];
}

export interface Enrollment {
  courseId: string;
  progress: number; // 0 to 100
  completedLessons: string[]; // List of lesson IDs
  completedAt?: string; // Date string when course was completed
  currentLessonId?: string;
  quizScores?: { [lessonId: string]: number }; // Score percentage for quizzes
}

export interface UserProgress {
  streak: number;
  lastStudyDate?: string;
  totalHours: number;
  enrolledCourses: { [courseId: string]: Enrollment };
  certificates: string[]; // Course IDs for earned certificates
  activityLog: { date: string; minutes: number }[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}
