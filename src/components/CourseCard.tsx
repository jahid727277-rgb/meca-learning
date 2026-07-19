import React from 'react';
import { Course, Enrollment } from '../types';
import { Clock, BookOpen, Star, Sparkles, Award } from 'lucide-react';
import { formatBDTPrice } from '../utils/currency';
import ImageWithSkeleton from './ImageWithSkeleton';

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
      className="group flex flex-col bg-white rounded-2xl border border-neutral-200 hover:border-orange-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-full"
    >
      {/* Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <ImageWithSkeleton 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'} 
          alt={course.title || 'Course'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          containerClassName="w-full h-full"
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
        <div className="pt-2 mt-auto border-t border-neutral-50">
          {isEnrolled ? (
            <div className="flex items-center gap-2 w-full">
              {isFinished && onShowCertificate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowCertificate(course.id);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Certificate</span>
                </button>
              )}
              <button
                onClick={() => onSelect(course.id)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs hover:shadow-md cursor-pointer text-center"
              >
                Learn
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-lg font-black text-neutral-900">{formatBDTPrice(course.price)}</span>
              </div>
              <button
                onClick={() => onEnroll(course.id)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs hover:shadow-md cursor-pointer text-center"
              >
                See
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
