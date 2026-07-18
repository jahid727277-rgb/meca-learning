import React from 'react';
import { Course, Enrollment } from '../types';
import { Clock, BookOpen, Star, Sparkles, Award } from 'lucide-react';
import { formatBDTPrice } from '../utils/currency';

interface CourseCardProps {
  key?: string | number;
  course: Course;
  enrollment?: Enrollment;
  onSelect: (courseId: string) => void;
  onEnroll: (courseId: string) => void;
  onShowCertificate?: (courseId: string) => void;
}

export default function CourseCard({ course, enrollment, onSelect, onEnroll, onShowCertificate }: CourseCardProps) {
  const isEnrolled = !!enrollment;
  const isFinished = isEnrolled && enrollment.progress >= 100;

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
      </div>

      {/* Course Details */}
      <div className="flex flex-col flex-1 p-5">
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

        {/* Progress or Pricing Footer */}
        <div className="flex items-center justify-between gap-3 pt-1 mt-auto">
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
              <span className="text-lg font-black text-neutral-900">{formatBDTPrice(course.price)}</span>
            </div>
          )}
          {/* Action Button */}
          <div className="flex items-center gap-1.5">
            {isEnrolled && isFinished && onShowCertificate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowCertificate(course.id);
                }}
                className="px-2.5 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                Certificate
              </button>
            )}
            {isEnrolled ? (
              <button
                onClick={() => onSelect(course.id)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Learn
              </button>
            ) : (
              <button
                onClick={() => onEnroll(course.id)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs hover:shadow-md cursor-pointer shrink-0"
              >
                See
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
