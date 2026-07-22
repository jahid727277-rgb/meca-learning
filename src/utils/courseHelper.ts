import { Course, SyllabusSection, Lesson, QuizQuestion, Enrollment, UserProgress } from '../types';
import thumbPromptEng from '../assets/images/thumb_prompt_eng_restored_1784197144591.jpg';
import thumbAiAgents from '../assets/images/thumb_ai_agents_restored_1784197158404.jpg';
import thumbAiAuto from '../assets/images/thumb_ai_auto_restored_1784197174333.jpg';

/**
 * Formats a price value with currency symbol (৳).
 */
export function formatPrice(price: string | number): string {
  if (price === undefined || price === null || price === '') return '৳ ০';
  if (typeof price === 'number') {
    if (isNaN(price)) return '৳ ০';
    return `৳ ${Math.round(price).toLocaleString('en-US')}`;
  }
  
  const trimmed = String(price).trim();
  const cleanNumericStr = trimmed.replace(/,/g, '');
  const parsedNum = Number(cleanNumericStr);
  
  if (!isNaN(parsedNum) && cleanNumericStr !== '') {
    return `৳ ${Math.round(parsedNum).toLocaleString('en-US')}`;
  }
  
  return trimmed;
}

/**
 * Safely converts any value (including index-based objects from Firebase) to an array.
 */
export function ensureArray<T>(val: any): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'object') {
    return Object.keys(val)
      .sort((a, b) => Number(a) - Number(b))
      .map(k => val[k])
      .filter(Boolean);
  }
  return [];
}

/**
 * Normalizes a course structure retrieved from Firebase Realtime Database
 * to ensure that all arrays are robustly parsed (even if stored as index-based objects)
 * and all fields are fallback-safe.
 */
export function normalizeCourse(c: any): Course {
  if (!c) {
    throw new Error('Course object is null or undefined');
  }

  const tags = ensureArray<string>(c.tags);
  const rawSyllabus = ensureArray<any>(c.syllabus);

  const syllabus: SyllabusSection[] = rawSyllabus.map((sec: any, secIdx: number): SyllabusSection => {
    const rawLessons = ensureArray<any>(sec?.lessons);

    const lessons: Lesson[] = rawLessons.map((les: any, lesIdx: number): Lesson => {
      const rawQuiz = ensureArray<any>(les?.quiz);

      const quiz: QuizQuestion[] = rawQuiz.map((q: any, qIdx: number): QuizQuestion => {
        const options = ensureArray<string>(q?.options);

        return {
          id: q?.id || `q-${secIdx}-${lesIdx}-${qIdx}-${Date.now()}`,
          question: q?.question || '',
          options: options,
          correctAnswer: typeof q?.correctAnswer === 'number' ? q.correctAnswer : 0
        };
      });

      return {
        id: les?.id || `les-${secIdx}-${lesIdx}-${Date.now()}`,
        title: les?.title || '',
        duration: les?.duration || undefined,
        type: les?.type || 'video',
        videoUrl: les?.videoUrl || '',
        content: les?.content || '',
        classNotePdfUrl: les?.classNotePdfUrl || undefined,
        quiz: quiz.length > 0 ? quiz : undefined
      };
    });

    return {
      id: sec?.id || `sec-${secIdx}-${Date.now()}`,
      title: sec?.title || '',
      lessons
    };
  });

  const totalLessons = syllabus.reduce((acc, s) => acc + s.lessons.length, 0);

  return {
    id: c.id || c.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'course-unknown',
    title: c.title || '',
    description: c.description || '',
    instructor: {
      name: c.instructor?.name || 'Abrar Chowdhury',
      role: c.instructor?.role || 'AI Research Architect',
      avatar: c.instructor?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: c.instructor?.bio || 'Expert in artificial intelligence.'
    },
    category: c.category || 'AI Agents',
    level: c.level || 'Beginner',
    rating: (c.rating !== undefined && !isNaN(Number(c.rating))) ? Number(c.rating) : 5.0,
    reviewCount: (c.reviewCount !== undefined && !isNaN(Number(c.reviewCount))) ? Number(c.reviewCount) : 1,
    duration: c.duration || '10h 30m',
    lessonsCount: (c.lessonsCount !== undefined && !isNaN(Number(c.lessonsCount)) && Number(c.lessonsCount) > 0) ? Number(c.lessonsCount) : totalLessons,
    price: (c.price !== undefined && c.price !== null && c.price !== '') ? c.price : 6000,
    thumbnail: (() => {
      const thumbStr = String(c.thumbnail || '').trim();
      if (thumbStr && (thumbStr.startsWith('http://') || thumbStr.startsWith('https://'))) {
        return thumbStr;
      }
      const idStr = String(c.id || '').toLowerCase();
      const titleStr = String(c.title || '').toLowerCase();
      if (idStr === 'ai-101' || titleStr.includes('prompt engineering') || titleStr.includes('generative ai')) {
        return 'https://res.cloudinary.com/djjhol6dg/image/upload/v1784463289/1784463216153_jtoqbe.png';
      }
      if (idStr === 'ai-202' || titleStr.includes('agent') || titleStr.includes('multi-agent')) {
        return 'https://res.cloudinary.com/djjhol6dg/image/upload/v1783557260/1000263343-clean_fuquye.png';
      }
      if (idStr === 'ai-303' || titleStr.includes('automation') || titleStr.includes('workflow')) {
        return 'https://res.cloudinary.com/djjhol6dg/image/upload/v1783557260/1000263336-clean_nzjfqt.png';
      }
      if (!thumbStr) {
        return 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800';
      }
      return c.thumbnail;
    })(),
    tags: tags,
    syllabus,
    comingSoonMessage: c.comingSoonMessage || '',
    promoVideoUrl: c.promoVideoUrl || '',
    detailsDescription: c.detailsDescription || ''
  };
}

export function getEnrolledCourses(progress: UserProgress, courses: Course[]): { enrollment: Enrollment, course: Course }[] {
  return Object.values(progress.enrolledCourses)
    .map((enrollment) => {
      const course = courses.find((c) => c.id === enrollment.courseId);
      return { enrollment, course };
    })
    .filter((item): item is { enrollment: Enrollment, course: Course } => item.course !== undefined);
}
