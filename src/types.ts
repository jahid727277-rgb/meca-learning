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
  duration?: string;
  type: LessonType;
  videoUrl?: string; // e.g. for mock embed or custom video placeholder
  content?: string;  // markdown/text content for reading lessons
  quiz?: QuizQuestion[];
  classNotePdfUrl?: string; // Add PDF URL for class notes
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
  price: string | number;
  thumbnail: string;
  tags: string[];
  syllabus: SyllabusSection[];
  promoVideoUrl?: string;
  detailsDescription?: string;
}

export interface Enrollment {
  courseId: string;
  courseTitle?: string;
  enrolledAt: string;
}

export interface UserProgress {
  enrolledCourses: { [courseId: string]: Enrollment };
}
