import React from 'react';
import { Course, Enrollment } from '../types';
import { Clock, BookOpen, Star, Sparkles } from 'lucide-react';
import { formatBDTPrice } from '../utils/currency';

interface CourseCardProps {
  key?: string | number;
  course: Course;
  enrollment?: Enrollment;
  onSelect: (courseId: string) => void;
  onEnroll: (courseId: string) => void;
}

export default function CourseCard({ course, enrollment, onSelect, onEnroll }: CourseCardProps) {
  const isEnrolled = !!enrollment;

  return (
    <article 
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 hover:border-orange-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-full"
    >
      {/* Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'} 
          alt={course.title || 'Course'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category & Level Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-orange-600 border border-orange-100 uppercase tracking-wider">
            {course.category || 'AI'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
            {course.level || 'Beginner'}
          </span>
        </div>
      </div>

      {/* Course Details */}
      <div className="flex flex-col flex-1 p-5">
        {/* Rating and Tags */}
        <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-2.5">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-neutral-900 font-semibold">{course.rating || 5}</span>
            <span>({course.reviewCount || 0})</span>
          </div>
          {course.tags && course.tags.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-orange-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{course.tags[0]}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(course.id)} 
          className="text-base font-bold text-neutral-900 leading-snug mb-2 group-hover:text-orange-600 transition-colors cursor-pointer"
        >
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-neutral-500 line-clamp-2 mb-4 font-medium leading-relaxed">
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 font-semibold mb-5 border-t border-b border-neutral-50 py-3 mt-auto">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>{course.duration || '10 hours'}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <span>{course.lessonsCount || (course.syllabus?.flatMap(s => s.lessons).length || 0)} lessons</span>
          </div>
        </div>

        {/* Progress or Pricing Footer */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {isEnrolled ? (
            <div className="w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                <span>Progress</span>
                <span className="text-orange-600">{enrollment.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500" 
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Tuition</span>
              <span className="text-lg font-black text-neutral-900">{formatBDTPrice(course.price)}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {isEnrolled ? (
              <button
                onClick={() => onSelect(course.id)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Learn
              </button>
            ) : (
              <button
                onClick={() => onEnroll(course.id)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs hover:shadow-md"
              >
                Enroll
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
